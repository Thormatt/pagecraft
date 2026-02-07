import { chromium } from "playwright";

export const maxDuration = 60;

interface ExportRequest {
  html: string;
  title?: string;
  format?: "a4" | "letter" | "landscape";
}

/** CSS injected into the page to fix print rendering issues */
const PRINT_FIX_CSS = `
  /* Force all elements to be visible in print */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* Prevent page breaks inside cards and sections */
  section, .card, [class*="card"], [class*="feature"], [class*="product"],
  [class*="testimonial"], [class*="benefit"], [class*="pricing"] {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  /* Force grid/flex layouts to render properly */
  [style*="display: grid"], [style*="display:grid"],
  [class*="grid"] {
    display: grid !important;
  }
  [style*="display: flex"], [style*="display:flex"],
  [class*="flex"] {
    display: flex !important;
  }

  /* Ensure images are visible */
  img {
    max-width: 100% !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  /* Ensure SVGs render */
  svg {
    display: inline-block !important;
  }

  /* Ensure background images/gradients print */
  [style*="background"] {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
`;

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
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();

    // Set the HTML content and wait for network to settle
    await page.setContent(html, {
      waitUntil: "networkidle",
    });

    // Inject print-fix CSS
    await page.addStyleTag({ content: PRINT_FIX_CSS });

    // Wait for all images to load (including lazy/external ones)
    await page.evaluate(async () => {
      const images = Array.from(document.querySelectorAll("img"));
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          });
        })
      );

      // Wait for web fonts
      if (document.fonts) {
        await document.fonts.ready;
      }
    });

    // Extra buffer for any remaining renders
    await page.waitForTimeout(2000);

    // Generate PDF
    const pdf = await page.pdf({
      format: pageConfig.format,
      landscape: pageConfig.landscape,
      printBackground: true,
      margin: {
        top: "0.5cm",
        right: "0.5cm",
        bottom: "0.5cm",
        left: "0.5cm",
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
