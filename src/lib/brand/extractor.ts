/**
 * Brand Extractor
 *
 * Extracts brand aesthetics (colors, fonts, logo, screenshot) from a URL
 * using Playwright for headless browsing.
 */

import { chromium, Browser } from "playwright";
import type { LayoutMap } from "@/types/style-editor";

export interface BrandExtraction {
  title: string;
  logo_url: string | null;
  colors: string[];
  fonts: string[];
  styles: {
    borderRadius?: string;
    spacing?: string;
    layoutMap?: LayoutMap;
    layoutHtml?: string;
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

    // Extract layout data (section map + cleaned HTML skeleton)
    const layoutData = await page.evaluate(() => {
      // --- Section map extraction ---
      const ROLE_TAGS: Record<string, string> = {
        nav: "navigation",
        header: "header",
        footer: "footer",
        aside: "sidebar",
        main: "main",
      };

      const ROLE_HEURISTICS: Array<{ pattern: RegExp; role: string }> = [
        { pattern: /hero|banner|jumbotron/i, role: "hero" },
        { pattern: /feature|benefit/i, role: "features" },
        { pattern: /pricing|plan/i, role: "pricing" },
        { pattern: /testimonial|review|quote/i, role: "testimonials" },
        { pattern: /faq|question/i, role: "faq" },
        { pattern: /contact|cta|call.?to.?action/i, role: "cta" },
        { pattern: /about|team|story/i, role: "about" },
        { pattern: /blog|article|post/i, role: "blog" },
        { pattern: /gallery|portfolio|showcase/i, role: "gallery" },
        { pattern: /stat|number|metric|counter/i, role: "stats" },
        { pattern: /logo|client|partner|brand/i, role: "logos" },
      ];

      function detectRole(el: Element): string {
        const tag = el.tagName.toLowerCase();
        if (ROLE_TAGS[tag]) return ROLE_TAGS[tag];

        const className = el.className?.toString() || "";
        const id = el.id || "";
        const text = className + " " + id;

        for (const h of ROLE_HEURISTICS) {
          if (h.pattern.test(text)) return h.role;
        }

        // Check first heading for clues
        const heading = el.querySelector("h1, h2, h3");
        if (heading) {
          const headingText = heading.textContent || "";
          for (const h of ROLE_HEURISTICS) {
            if (h.pattern.test(headingText)) return h.role;
          }
        }

        return "section";
      }

      function detectLayout(el: Element): string {
        const style = getComputedStyle(el);
        const display = style.display;
        const flexDir = style.flexDirection;
        const gridCols = style.gridTemplateColumns;

        if (display === "grid" || display === "inline-grid") {
          const colCount = gridCols.split(/\s+/).filter((s: string) => s && s !== "none").length;
          if (colCount > 1) return `${colCount}-column-grid`;
          return "grid";
        }

        if (display === "flex" || display === "inline-flex") {
          if (flexDir === "column" || flexDir === "column-reverse") {
            const aligned = style.alignItems;
            if (aligned === "center") return "centered-stack";
            return "flex-column";
          }
          return "flex-row";
        }

        // Check first child container for grid/flex
        const firstChild = el.children[0];
        if (firstChild) {
          const childStyle = getComputedStyle(firstChild);
          if (childStyle.display === "grid") {
            const cols = childStyle.gridTemplateColumns.split(/\s+/).filter((s: string) => s && s !== "none").length;
            if (cols > 1) return `${cols}-column-grid`;
          }
          if (childStyle.display === "flex" && childStyle.flexDirection !== "column") {
            return "flex-row";
          }
        }

        return "block";
      }

      // Collect top-level sections
      const body = document.body;
      const topElements = Array.from(body.children).filter((el) => {
        const tag = el.tagName.toLowerCase();
        if (["script", "style", "noscript", "link", "meta"].includes(tag)) return false;
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") return false;
        return true;
      });

      const sections = topElements.map((el) => {
        const tag = el.tagName.toLowerCase();
        const role = detectRole(el);
        const layout = detectLayout(el);
        const childCount = el.children.length;
        const hasImage = el.querySelector("img, picture, video, svg[width]") !== null;
        return { tag, role, layout, childCount, hasImage };
      }).slice(0, 20); // Cap at 20 sections

      // Collect layout patterns
      const containers = document.querySelectorAll('main, [class*="container"], [class*="wrapper"], [class*="content"]');
      let maxWidth = "";
      let containerPadding = "";
      for (const c of Array.from(containers).slice(0, 5)) {
        const cs = getComputedStyle(c);
        if (cs.maxWidth && cs.maxWidth !== "none" && !maxWidth) maxWidth = cs.maxWidth;
        if (cs.paddingLeft && cs.paddingLeft !== "0px" && !containerPadding) {
          containerPadding = `0 ${cs.paddingLeft}`;
        }
      }

      const sectionEls = document.querySelectorAll("section, [class*='section']");
      let sectionPadding = "";
      let gridGap = "";
      for (const s of Array.from(sectionEls).slice(0, 5)) {
        const cs = getComputedStyle(s);
        if (cs.paddingTop && cs.paddingTop !== "0px" && !sectionPadding) {
          sectionPadding = `${cs.paddingTop} 0`;
        }
        if (cs.gap && cs.gap !== "normal" && !gridGap) {
          gridGap = cs.gap;
        }
      }

      const patterns: Record<string, string> = {};
      if (maxWidth) patterns.maxWidth = maxWidth;
      if (sectionPadding) patterns.sectionPadding = sectionPadding;
      if (gridGap) patterns.gridGap = gridGap;
      if (containerPadding) patterns.containerPadding = containerPadding;

      const layoutMap = { sections, patterns };

      // --- Cleaned HTML skeleton extraction ---
      const clone = document.documentElement.cloneNode(true) as HTMLElement;

      // Remove script, noscript, and non-layout style tags
      clone.querySelectorAll("script, noscript, iframe, svg, canvas, video, audio").forEach((el) => el.remove());

      // Replace text content with semantic placeholders
      function replaceTextNodes(node: Node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = (node.textContent || "").trim();
          if (!text) return;

          const parent = node.parentElement;
          if (!parent) return;
          const parentTag = parent.tagName.toLowerCase();

          if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(parentTag)) {
            node.textContent = "[heading]";
          } else if (parentTag === "a") {
            node.textContent = "[link]";
          } else if (parentTag === "button" || parent.getAttribute("role") === "button") {
            node.textContent = "[button]";
          } else if (parentTag === "li") {
            node.textContent = "[item]";
          } else if (parentTag === "span" || parentTag === "label") {
            node.textContent = "[text]";
          } else if (text.length > 20) {
            node.textContent = "[paragraph]";
          } else {
            node.textContent = "[text]";
          }
          return;
        }

        const children = Array.from(node.childNodes);
        for (const child of children) {
          replaceTextNodes(child);
        }
      }

      const cloneBody = clone.querySelector("body");
      if (cloneBody) {
        replaceTextNodes(cloneBody);

        // Replace images with placeholder divs
        cloneBody.querySelectorAll("img, picture").forEach((img) => {
          const placeholder = document.createElement("div");
          placeholder.setAttribute("data-placeholder", "image");
          img.replaceWith(placeholder);
        });

        // Strip inline styles except layout-relevant ones
        const LAYOUT_PROPS = new Set([
          "display", "flex-direction", "flex-wrap", "justify-content", "align-items",
          "grid-template-columns", "grid-template-rows", "gap", "grid-gap",
          "max-width", "min-height", "width", "height", "padding", "margin",
          "position", "top", "left", "right", "bottom",
        ]);

        cloneBody.querySelectorAll("[style]").forEach((el) => {
          const htmlEl = el as HTMLElement;
          const currentStyle = htmlEl.style;
          const kept: string[] = [];
          for (let i = 0; i < currentStyle.length; i++) {
            const prop = currentStyle[i];
            if (LAYOUT_PROPS.has(prop)) {
              kept.push(`${prop}: ${currentStyle.getPropertyValue(prop)}`);
            }
          }
          if (kept.length > 0) {
            htmlEl.setAttribute("style", kept.join("; "));
          } else {
            htmlEl.removeAttribute("style");
          }
        });
      }

      // Extract only layout-relevant CSS from style tags
      const headEl = clone.querySelector("head");
      if (headEl) {
        // Remove all link tags (external stylesheets)
        headEl.querySelectorAll("link, meta, title, base").forEach((el) => el.remove());
        // Remove all style tags from head (we keep class names but strip heavy CSS)
        headEl.querySelectorAll("style").forEach((el) => el.remove());
      }

      let layoutHtml = clone.outerHTML;

      // Truncate to ~15KB
      const MAX_SIZE = 15000;
      if (layoutHtml.length > MAX_SIZE) {
        layoutHtml = layoutHtml.slice(0, MAX_SIZE) + "\n<!-- truncated -->";
      }

      return { layoutMap, layoutHtml };
    });

    // Merge layout data into styles
    const stylesWithLayout = {
      ...styles,
      layoutMap: layoutData.layoutMap,
      layoutHtml: layoutData.layoutHtml,
    };

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
      styles: stylesWithLayout,
      screenshot,
    };
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}
