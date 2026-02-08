import { createClient } from "@/lib/supabase/server";
import { chromium } from "playwright";

export const maxDuration = 30;

// Cache OG images for 1 hour
const CACHE_CONTROL = "public, max-age=3600, stale-while-revalidate=86400";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch page content
  const { data: page, error } = await supabase
    .from("pages")
    .select("html_content, title")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !page) {
    // Return a fallback OG image
    return new Response(generateFallbackSvg("Page Not Found"), {
      status: 404,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60",
      },
    });
  }

  try {
    // Launch headless browser (JS disabled to prevent SSRF)
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1200, height: 630 }, // OG image dimensions
      deviceScaleFactor: 2, // Higher quality
      javaScriptEnabled: false,
    });
    const browserPage = await context.newPage();

    // Set the HTML content (domcontentloaded since JS is disabled)
    await browserPage.setContent(page.html_content, {
      waitUntil: "domcontentloaded",
    });

    // Wait a bit for any animations/fonts to load
    await browserPage.waitForTimeout(500);

    // Take screenshot
    const screenshot = await browserPage.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });

    await browser.close();

    return new Response(new Uint8Array(screenshot), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error("[OG Image] Error generating screenshot:", error);

    // Return fallback SVG on error
    return new Response(generateFallbackSvg(page.title || "Generated Page"), {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=60",
      },
    });
  }
}

function generateFallbackSvg(title: string): string {
  // Escape title for SVG
  const escapedTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b"/>
      <stop offset="100%" style="stop-color:#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <text x="600" y="280" text-anchor="middle" font-family="system-ui, sans-serif" font-size="48" font-weight="600" fill="#ffffff">${escapedTitle}</text>
  <text x="600" y="350" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" fill="#94a3b8">Created with PageGen</text>
</svg>`;
}
