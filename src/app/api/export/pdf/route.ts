import { chromium } from "playwright";

export const maxDuration = 60;

interface ExportRequest {
  html: string;
  title?: string;
  format?: "a4" | "letter" | "landscape";
}

export async function POST(request: Request) {
  try {
    const { html, title = "page", format = "a4" }: ExportRequest =
      await request.json();

    if (!html) {
      return new Response(JSON.stringify({ error: "HTML content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Configure page size based on format
    const pageConfig = {
      a4: { format: "A4" as const, landscape: false },
      letter: { format: "Letter" as const, landscape: false },
      landscape: { format: "A4" as const, landscape: true },
    }[format];

    // Launch headless browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set the HTML content
    await page.setContent(html, {
      waitUntil: "networkidle",
    });

    // Wait for fonts and images to load
    await page.waitForTimeout(1000);

    // Generate PDF
    const pdf = await page.pdf({
      format: pageConfig.format,
      landscape: pageConfig.landscape,
      printBackground: true,
      margin: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm",
      },
    });

    await browser.close();

    // Sanitize filename
    const filename = title.replace(/[^a-zA-Z0-9-_]/g, "_") + ".pdf";

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (error) {
    console.error("[PDF Export] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate PDF",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
