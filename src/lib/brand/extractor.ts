/**
 * Brand Extractor
 *
 * Extracts brand aesthetics (colors, fonts, logo, screenshot) from a URL
 * using Playwright for headless browsing.
 */

import { chromium, Browser } from "playwright";

export interface BrandExtraction {
  title: string;
  logo_url: string | null;
  colors: string[];
  fonts: string[];
  styles: {
    borderRadius?: string;
    spacing?: string;
  };
  screenshot: string;
}

/**
 * Convert RGB/RGBA color to hex format
 */
function rgbToHex(color: string): string | null {
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!rgbMatch) return null;

  const r = parseInt(rgbMatch[1], 10);
  const g = parseInt(rgbMatch[2], 10);
  const b = parseInt(rgbMatch[3], 10);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Extract brand aesthetics from a URL using Playwright
 */
export async function extractBrand(url: string): Promise<BrandExtraction> {
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    });
    const page = await context.newPage();

    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(1000);

    const title = await page.title();

    // Extract logo URL
    const logo_url = await page.evaluate(() => {
      // Common logo selectors
      const selectors = [
        'img[alt*="logo" i]',
        'img[src*="logo" i]',
        'img[class*="logo" i]',
        'a[class*="logo" i] img',
        'header img:first-of-type',
        'nav img:first-of-type',
        '[class*="brand"] img',
        'link[rel="icon"]',
      ];

      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el) {
          if (el.tagName === "LINK") {
            return (el as HTMLLinkElement).href;
          }
          if (el.tagName === "IMG") {
            const src = (el as HTMLImageElement).src;
            if (src && !src.includes("data:") && src.startsWith("http")) {
              return src;
            }
          }
        }
      }
      return null;
    });

    // Extract colors
    const rawColors = await page.evaluate(() => {
      const colorSet = new Set<string>();
      const elements = document.querySelectorAll("*");

      elements.forEach((el) => {
        const style = getComputedStyle(el);

        // Background colors
        if (
          style.backgroundColor &&
          style.backgroundColor !== "rgba(0, 0, 0, 0)"
        ) {
          colorSet.add(style.backgroundColor);
        }

        // Text colors
        if (style.color) {
          colorSet.add(style.color);
        }

        // Border colors
        if (
          style.borderColor &&
          style.borderColor !== "rgba(0, 0, 0, 0)" &&
          style.borderColor !== "rgb(0, 0, 0)"
        ) {
          colorSet.add(style.borderColor);
        }
      });

      return Array.from(colorSet).slice(0, 20);
    });

    // Convert to hex and dedupe
    const hexColors = new Set<string>();
    for (const color of rawColors) {
      const hex = rgbToHex(color);
      if (hex) {
        hexColors.add(hex.toLowerCase());
      }
    }

    // Filter out common defaults and sort by frequency
    const filteredColors = Array.from(hexColors)
      .filter((c) => !["#ffffff", "#000000", "#f5f5f5", "#e5e5e5"].includes(c))
      .slice(0, 8);

    // Add back white/black if we have room
    const colors = [...filteredColors];
    if (colors.length < 8 && hexColors.has("#ffffff")) {
      colors.push("#ffffff");
    }
    if (colors.length < 8 && hexColors.has("#000000")) {
      colors.push("#000000");
    }

    // Extract fonts
    const fonts = await page.evaluate(() => {
      const fontSet = new Set<string>();
      document.querySelectorAll("*").forEach((el) => {
        const font = getComputedStyle(el)
          .fontFamily.split(",")[0]
          .replace(/['"]/g, "")
          .trim();
        if (
          font &&
          !font.includes("system-ui") &&
          !font.includes("-apple-system") &&
          !font.includes("BlinkMacSystemFont") &&
          !font.includes("Segoe UI") &&
          font !== "inherit"
        ) {
          fontSet.add(font);
        }
      });
      return Array.from(fontSet).slice(0, 5);
    });

    // Extract common style patterns
    const styles = await page.evaluate(() => {
      const buttons = document.querySelectorAll(
        'button, [role="button"], .btn, [class*="button"]'
      );
      let borderRadius = "4px";
      let spacing = "16px";

      if (buttons.length > 0) {
        const btnStyle = getComputedStyle(buttons[0]);
        borderRadius = btnStyle.borderRadius || "4px";
      }

      const containers = document.querySelectorAll(
        'main, [class*="container"], section'
      );
      if (containers.length > 0) {
        const containerStyle = getComputedStyle(containers[0]);
        spacing = containerStyle.padding || "16px";
      }

      return { borderRadius, spacing };
    });

    // Take screenshot (viewport only, not full page)
    const screenshotBuffer = await page.screenshot({
      type: "png",
      fullPage: false,
    });
    const screenshot = `data:image/png;base64,${screenshotBuffer.toString("base64")}`;

    await browser.close();

    return {
      title,
      logo_url,
      colors,
      fonts,
      styles,
      screenshot,
    };
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}
