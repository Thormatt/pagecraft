import type { BrandProfile } from "@/types/database";
import type { LayoutMap } from "@/types/style-editor";
import { getPhotoReferenceForPrompt } from "@/lib/images/unsplash";

export type ImageMode = "stock" | "ai" | "none";

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

## Template Following
If the user's message includes a "## Template Reference" or "## CRITICAL: Slideshow Template" section with HTML code, you MUST:
- Use that template as your STRUCTURAL foundation (layout, sections, CSS class patterns)
- Keep the same section arrangement, visual hierarchy, and spacing
- Only replace placeholder content (text, headings, descriptions) with the user's requested content
- Do NOT redesign or reorganize the layout structure
- IMPORTANT: If brand guidelines are also provided, the brand's colors and fonts OVERRIDE the template's colors and fonts. Use the template's structure but the brand's visual identity.

When the user asks you to modify an existing page, incorporate their changes while preserving the overall structure and style unless they ask for a complete redesign.`;

interface LayoutData {
  layoutMap?: LayoutMap;
  layoutHtml?: string;
}

/**
 * Build a layout reference section for the system prompt
 */
function buildLayoutPrompt(layout: LayoutData): string {
  const parts: string[] = [];

  parts.push(`\n\n## Layout Reference (MUST FOLLOW this structure)`);
  parts.push(`\nThis page should follow this structural pattern:`);

  if (layout.layoutMap?.sections?.length) {
    for (const section of layout.layoutMap.sections) {
      let desc = `- ${section.role.charAt(0).toUpperCase() + section.role.slice(1)}: ${section.layout} layout`;
      if (section.childCount > 0) desc += ` with ${section.childCount} elements`;
      if (section.hasImage) desc += ` (includes imagery)`;
      parts.push(desc);
    }
  }

  if (layout.layoutMap?.patterns) {
    const p = layout.layoutMap.patterns;
    const patternParts: string[] = [];
    if (p.maxWidth) patternParts.push(`max-width ${p.maxWidth}`);
    if (p.sectionPadding) patternParts.push(`section padding ${p.sectionPadding}`);
    if (p.gridGap) patternParts.push(`grid gap ${p.gridGap}`);
    if (p.containerPadding) patternParts.push(`container padding ${p.containerPadding}`);
    if (patternParts.length > 0) {
      parts.push(`\nLayout patterns: ${patternParts.join(", ")}.`);
    }
  }

  if (layout.layoutHtml) {
    parts.push(`\nHere is a structural HTML skeleton to use as your starting reference:\n\`\`\`html\n${layout.layoutHtml}\n\`\`\``);
    parts.push(`\nAdapt this structure to fit the user's content. Keep the same section arrangement and layout patterns, but replace placeholder content with the user's actual content.`);
  }

  return parts.join("\n");
}

/**
 * Build system prompt with optional brand guidelines and layout reference
 */
export type IconStyle = "emoji" | "svg" | "none";

export function buildSystemPrompt(
  brand?: BrandProfile | null,
  layout?: LayoutData | null,
  iconStyle?: IconStyle,
  imageMode?: ImageMode,
  formatPrompt?: string | null
): string {
  let prompt = SYSTEM_PROMPT;

  if (iconStyle === "svg") {
    prompt += `\n\n## Icon Style
Use simple inline SVG icons instead of emoji characters. Keep SVGs clean, single-color, and sized around 20-24px. Never use emoji/unicode symbols.`;
  } else if (iconStyle === "none") {
    prompt += `\n\n## Icon Style
Do NOT use emoji characters, unicode symbols, or any icons. Use only text content.`;
  }

  // Image mode handling
  if (imageMode === "stock") {
    prompt += `\n\n## Image Style: Stock Photos
Use real stock photos from Unsplash for all imagery. Do NOT use placeholder images, gradients as image substitutes, or generic colored boxes.

${getPhotoReferenceForPrompt()}

Choose appropriate images that match the content and context. Use meaningful alt text.`;
  } else if (imageMode === "ai") {
    prompt += `\n\n## Image Style: AI-Generated (Placeholder Markers)
When you need images, insert placeholder markers in this format: {{IMAGE:description}}
For example: {{IMAGE:modern office space with natural lighting}}

These markers will be replaced with AI-generated images after the page is created.
Do NOT use Unsplash URLs or placeholder.co - only use the {{IMAGE:description}} markers.`;
  } else if (imageMode === "none") {
    prompt += `\n\n## Image Style: No Images
Do NOT include any images in the generated page. Use text, icons, and CSS styling only.
You may use CSS gradients and backgrounds for visual interest, but no <img> tags.`;
  }

  if (brand) {
    const brandColors = Array.isArray(brand.colors) ? brand.colors : [];
    const brandFonts = Array.isArray(brand.fonts) ? brand.fonts : [];

    let brandGuidelines = `\n\n## HIGHEST PRIORITY: Brand Identity (OVERRIDES ALL OTHER STYLING)
These brand colors and fonts are the #1 priority. They override template colors, default palettes, and your own design instincts. The page MUST look like it belongs to this brand.`;

    if (brandColors.length > 0) {
      const primary = brandColors[0];
      const secondary = brandColors[1] || brandColors[0];
      const accent = brandColors[2] || brandColors[1] || brandColors[0];
      const bg = brandColors[3] || "#ffffff";
      const text = brandColors[4] || "#1a1a1a";

      brandGuidelines += `\n\n### Color Palette (use these EXACT hex values everywhere)
- Primary: ${primary}
- Secondary: ${secondary}
- Accent: ${accent}`;

      if (brandColors.length > 3) {
        brandGuidelines += `\n- Additional: ${brandColors.slice(3).join(", ")}`;
      }

      brandGuidelines += `\n
### How to apply these colors:
- **Hero/header backgrounds**: Use primary (${primary}) or a dark/light variant
- **Buttons & CTAs**: Primary (${primary}) background with white text, or accent (${accent})
- **Links & interactive elements**: Accent (${accent})
- **Section backgrounds**: Alternate between white/light and secondary (${secondary}) tinted sections
- **Headings**: Primary (${primary}) or dark text that complements the palette
- **Borders & dividers**: Light tint of primary or secondary
- **Cards/containers**: White or very light tint of secondary (${secondary})
- **Hover states**: Darker shade of the base color

### Required CSS custom properties:
\`\`\`css
:root {
  --color-primary: ${primary};
  --color-secondary: ${secondary};
  --color-accent: ${accent};
  --color-bg: ${bg};
  --color-text: ${text};
}
\`\`\`
Use var(--color-primary) etc. throughout your CSS. Every colored element should reference these variables.`;
    }

    if (brandFonts.length > 0) {
      brandGuidelines += `\n\n### Required Typography
Fonts: ${brandFonts.join(", ")}
Load from Google Fonts. Use the first font for headings and the second (if available) for body text. Do NOT use system-ui or other fallback fonts as the primary font.`;
    }

    if (brand.source_url) {
      brandGuidelines += `\n\n### Style Reference: ${brand.source_url}
Match the visual feel, spacing rhythm, and design sensibility of this website.`;
    }

    brandGuidelines += `\n\nReminder: If a template is also provided, use the template's LAYOUT STRUCTURE but apply THIS brand's colors and fonts. The brand identity always wins over template styling.`;

    prompt += brandGuidelines;
  }

  if (formatPrompt) {
    prompt += `\n\n## Page Format (MUST FOLLOW this structure)
${formatPrompt}

Use the brand colors and fonts defined above (if any) when building this layout. Every section should use the CSS custom properties (--color-primary, etc.) for consistent branding.`;
  }

  if (layout?.layoutMap || layout?.layoutHtml) {
    prompt += buildLayoutPrompt(layout);
  }

  return prompt;
}

/**
 * Build system prompt for moodboard-generated pages
 * Uses analyzed layout structure and concept styling
 */
export function buildMoodboardSystemPrompt(
  layoutAnalysis: { sections: string[]; patterns: string },
  conceptAnalysis: { colors: string[]; fonts: string[]; mood: string },
  iconStyle?: IconStyle,
  imageMode?: ImageMode
): string {
  let prompt = SYSTEM_PROMPT;

  // Add layout structure requirements
  prompt += `\n\n## Layout Structure (MUST FOLLOW)
${layoutAnalysis.sections.map((s) => `- ${s}`).join("\n")}

Layout patterns: ${layoutAnalysis.patterns}

Follow this section order and structure exactly. Each section should be implemented as described.`;

  // Add visual design requirements
  prompt += `\n\n## Visual Design (MUST FOLLOW)
Color Palette: ${conceptAnalysis.colors.join(", ")}
Typography: ${conceptAnalysis.fonts.join(", ")}
Visual Mood: ${conceptAnalysis.mood}

Use these EXACT hex colors in your CSS. Define them as CSS custom properties:
:root {
  --color-primary: ${conceptAnalysis.colors[0] || "#000000"};
  --color-secondary: ${conceptAnalysis.colors[1] || "#333333"};
  --color-accent: ${conceptAnalysis.colors[2] || "#0066cc"};
  --color-background: ${conceptAnalysis.colors[3] || "#ffffff"};
  --color-text: ${conceptAnalysis.colors[4] || "#1a1a1a"};
}

The design should feel ${conceptAnalysis.mood}. Apply this aesthetic consistently throughout all sections.`;

  // Add icon handling
  if (iconStyle === "svg") {
    prompt += `\n\n## Icon Style
Use simple inline SVG icons instead of emoji characters. Keep SVGs clean, single-color, and sized around 20-24px. Never use emoji/unicode symbols.`;
  } else if (iconStyle === "none") {
    prompt += `\n\n## Icon Style
Do NOT use emoji characters, unicode symbols, or any icons. Use only text content.`;
  }

  // Add image handling
  if (imageMode === "stock") {
    prompt += `\n\n## Image Style: Stock Photos
Use real stock photos from Unsplash for all imagery. Do NOT use placeholder images or generic colored boxes.
${getPhotoReferenceForPrompt()}
Choose appropriate images that match the content and visual mood.`;
  } else if (imageMode === "ai") {
    prompt += `\n\n## Image Style: AI-Generated (Placeholder Markers)
When you need images, insert placeholder markers in this format: {{IMAGE:description}}
For example: {{IMAGE:modern office space with natural lighting}}
These markers will be replaced with AI-generated images after the page is created.`;
  } else if (imageMode === "none") {
    prompt += `\n\n## Image Style: No Images
Do NOT include any images. Use text, icons, and CSS styling only.
You may use CSS gradients and backgrounds for visual interest, but no <img> tags.`;
  }

  return prompt;
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
