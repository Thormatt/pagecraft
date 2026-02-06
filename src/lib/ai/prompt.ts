import type { BrandProfile } from "@/types/database";

export const SYSTEM_PROMPT = `You are an expert HTML page generator. Your job is to create beautiful, complete, self-contained HTML pages based on user descriptions.

Rules:
1. Always return a complete HTML document starting with <!DOCTYPE html>
2. Inline ALL CSS within <style> tags in the <head>
3. Inline ALL JavaScript within <script> tags
4. The only allowed external resource is Google Fonts via <link> tags
5. Use responsive design with mobile-first approach
6. Use semantic HTML5 elements
7. Use modern CSS (flexbox, grid, custom properties, etc.)
8. Make pages visually polished with good typography, spacing, and colors
9. Do NOT include any tracking scripts or analytics
10. Do NOT include any external resources besides Google Fonts
11. Do NOT wrap your response in markdown code blocks — return raw HTML only
12. Do NOT include any explanation text — only return the HTML document

When the user asks you to modify an existing page, incorporate their changes while preserving the overall structure and style unless they ask for a complete redesign.`;

/**
 * Build system prompt with optional brand guidelines
 */
export function buildSystemPrompt(brand?: BrandProfile | null): string {
  if (!brand) return SYSTEM_PROMPT;

  const brandColors = Array.isArray(brand.colors) ? brand.colors : [];
  const brandFonts = Array.isArray(brand.fonts) ? brand.fonts : [];

  let brandGuidelines = `\n\n## Brand Guidelines
Apply these brand aesthetics to the page:`;

  if (brandColors.length > 0) {
    brandGuidelines += `\n\n**Primary Colors:** ${brandColors.slice(0, 4).join(", ")}`;
    if (brandColors.length > 4) {
      brandGuidelines += `\n**Accent Colors:** ${brandColors.slice(4).join(", ")}`;
    }
  }

  if (brandFonts.length > 0) {
    brandGuidelines += `\n**Typography:** ${brandFonts.join(", ")}`;
    brandGuidelines += `\nUse Google Fonts to load these fonts if they are web fonts.`;
  }

  if (brand.source_url) {
    brandGuidelines += `\n**Style Reference:** ${brand.source_url}`;
  }

  brandGuidelines += `\n\nMatch this brand's visual identity in colors, typography, and overall feel. Use the primary colors for backgrounds, buttons, and key UI elements. Use accent colors for highlights and interactive states.`;

  return SYSTEM_PROMPT + brandGuidelines;
}

export function extractHtml(text: string): string {
  // Try to find HTML in markdown code blocks first
  const codeBlockMatch = text.match(/```(?:html)?\s*\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  // Check if the text itself is raw HTML
  const trimmed = text.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html") || trimmed.startsWith("<HTML")) {
    return trimmed;
  }

  // Try to find HTML anywhere in the text
  const htmlMatch = text.match(/(<!DOCTYPE[\s\S]*<\/html>)/i);
  if (htmlMatch) {
    return htmlMatch[1].trim();
  }

  // Fallback: wrap in basic HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
  </style>
</head>
<body>
${trimmed}
</body>
</html>`;
}
