import type { PageSection } from "@/types/style-editor";

/**
 * Resolve a CSS path (e.g. "body > div:nth-child(1) > h1") to an element
 * in a parsed DOM document.
 */
function resolveElement(doc: Document, cssPath: string): Element | null {
  try {
    return doc.querySelector(cssPath);
  } catch {
    return null;
  }
}

/**
 * Generate a CSS path for an element relative to the document.
 */
function getCssPath(el: Element): string {
  const parts: string[] = [];
  let current: Element | null = el;

  while (current && current !== current.ownerDocument.documentElement) {
    if (current.id) {
      parts.unshift(`#${current.id}`);
      break;
    }

    const parent: Element | null = current.parentElement;
    if (!parent) {
      parts.unshift(current.tagName.toLowerCase());
      break;
    }

    const tag = current.tagName;
    const siblings = Array.from(parent.children).filter(
      (c: Element) => c.tagName === tag
    );

    if (siblings.length === 1) {
      parts.unshift(current.tagName.toLowerCase());
    } else {
      const index = siblings.indexOf(current) + 1;
      parts.unshift(`${current.tagName.toLowerCase()}:nth-of-type(${index})`);
    }

    current = parent;
  }

  return parts.join(" > ");
}

/**
 * Apply an inline style to an element identified by cssPath in an HTML string.
 * Returns the updated HTML string.
 */
export function applyInlineStyle(
  html: string,
  cssPath: string,
  property: string,
  value: string
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const el = resolveElement(doc, cssPath);

  if (!el) return html;

  (el as HTMLElement).style.setProperty(property, value);

  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}

/**
 * Read the inline styles of an element identified by cssPath.
 */
export function getInlineStyles(
  html: string,
  cssPath: string
): Record<string, string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const el = resolveElement(doc, cssPath) as HTMLElement | null;

  if (!el) return {};

  const styles: Record<string, string> = {};
  for (let i = 0; i < el.style.length; i++) {
    const prop = el.style[i];
    styles[prop] = el.style.getPropertyValue(prop);
  }
  return styles;
}

/**
 * Read specific page-level styles from the <body> element.
 */
export function getPageStyles(html: string): Record<string, string> {
  return getInlineStyles(html, "body");
}

/**
 * Set the textContent of an element identified by cssPath in an HTML string.
 * Returns the updated HTML string.
 */
export function applyTextContent(
  html: string,
  cssPath: string,
  text: string
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const el = resolveElement(doc, cssPath);

  if (!el) return html;

  el.textContent = text;

  return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}

const SECTION_TAGS = new Set([
  "header", "nav", "main", "section", "article",
  "aside", "footer", "div", "form",
]);

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function getLabelForElement(el: Element): string {
  const tag = el.tagName.toLowerCase();

  if (el.id) return `${tag}#${el.id}`;

  const className = el.className;
  if (typeof className === "string" && className.trim()) {
    const firstClass = className.trim().split(/\s+/)[0];
    return `${tag}.${firstClass}`;
  }

  if (HEADING_TAGS.has(tag)) {
    const text = el.textContent?.trim().slice(0, 30) || "";
    return text ? `${tag}: ${text}` : tag;
  }

  return tag;
}

function buildSectionTree(el: Element, depth: number, maxDepth: number): PageSection | null {
  const tag = el.tagName.toLowerCase();
  const isSection = SECTION_TAGS.has(tag) || HEADING_TAGS.has(tag);

  if (!isSection || depth > maxDepth) return null;

  const children: PageSection[] = [];
  if (!HEADING_TAGS.has(tag)) {
    for (const child of Array.from(el.children)) {
      const childSection = buildSectionTree(child, depth + 1, maxDepth);
      if (childSection) children.push(childSection);
    }
  }

  return {
    cssPath: getCssPath(el),
    tagName: tag,
    label: getLabelForElement(el),
    depth,
    children,
  };
}

/**
 * Extract a tree of semantic page sections from an HTML string.
 */
export function getPageSections(html: string): PageSection[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;

  if (!body) return [];

  const sections: PageSection[] = [];
  for (const child of Array.from(body.children)) {
    const section = buildSectionTree(child, 0, 4);
    if (section) sections.push(section);
  }

  return sections;
}
