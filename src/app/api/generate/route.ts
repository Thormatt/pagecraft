import { openrouter, MODEL_ID } from "@/lib/ai/client";
import { buildSystemPrompt, type IconStyle, type ImageMode } from "@/lib/ai/prompt";
import { formatDocumentsForContext } from "@/lib/content/processor";
import { createClient } from "@/lib/supabase/server";
import { streamText } from "ai";
import type { BrandProfile, Template } from "@/types/database";
import type { LayoutMap } from "@/types/style-editor";

export const maxDuration = 60;

interface UIMessagePart {
  type: string;
  text?: string;
}

interface UIMessage {
  role: "user" | "assistant";
  parts?: UIMessagePart[];
  content?: string;
}

interface ModelMessage {
  role: "user" | "assistant";
  content: string;
}

interface GenerateRequest {
  messages: UIMessage[];
  brand_id?: string;
  template_id?: string;
  document_ids?: string[];
  layout_id?: string;
  layout_type?: "brand" | "template";
  starter_template_html?: string;
  icon_style?: IconStyle;
  image_mode?: ImageMode;
}

function convertToModelMessages(
  messages: UIMessage[],
  context?: { documents?: string; template?: string }
): ModelMessage[] {
  return messages.map((msg, idx) => {
    let content: string;
    if (msg.parts) {
      content = msg.parts
        .filter((p) => p.type === "text" && p.text)
        .map((p) => p.text)
        .join("");
    } else {
      content = msg.content ?? "";
    }

    // Prepend context to the first user message
    if (msg.role === "user" && idx === 0) {
      const parts: string[] = [];

      if (context?.template) {
        parts.push(context.template);
      }

      if (context?.documents) {
        parts.push(context.documents);
      }

      if (parts.length > 0) {
        content = `${parts.join("\n\n")}\n\n## User Request\n${content}`;
      }
    }

    return { role: msg.role, content };
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, brand_id, template_id, document_ids, layout_id, layout_type, starter_template_html, icon_style, image_mode }: GenerateRequest =
    await request.json();

  console.log("[generate] Request received:", { brand_id, template_id, document_ids, layout_id, layout_type, hasStarterTemplate: !!starter_template_html, image_mode, messageCount: messages.length });

  // Fetch brand profile if provided
  let brand: BrandProfile | null = null;
  if (brand_id) {
    const { data } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("id", brand_id)
      .eq("user_id", user.id)
      .single();
    brand = data;
    console.log("[generate] Brand loaded:", {
      id: brand?.id,
      name: brand?.name,
      colors: brand?.colors,
      fonts: brand?.fonts,
      source_url: brand?.source_url,
    });
  }

  // Fetch template if provided
  let template: Template | null = null;
  let templateContext = "";
  if (template_id) {
    const { data } = await supabase
      .from("templates")
      .select("*")
      .eq("id", template_id)
      .eq("user_id", user.id)
      .single();
    template = data;
    if (template) {
      console.log("[generate] Template loaded:", { id: template.id, name: template.name });

      // Detect if this is a slideshow/presentation template
      const html = template.html_content;
      const isSlideshow = html.includes('slide') ||
                          html.includes('carousel') ||
                          (html.includes('prev') && html.includes('next')) ||
                          /\d+\s*\/\s*\d+/.test(html) ||
                          html.includes('currentSlide');

      if (isSlideshow) {
        templateContext = `## CRITICAL: Slideshow Template (MUST PRESERVE FORMAT)

This is a SLIDESHOW/PRESENTATION template. You MUST preserve the slideshow format exactly:
1. Keep ALL slides as separate sections that display one at a time
2. Keep the navigation arrows (prev/next buttons)
3. Keep the slide counter/indicator
4. Keep the JavaScript for slide navigation
5. Keep the presentation aspect ratio and transitions

DO NOT convert this into a scrolling landing page. The output MUST be a slideshow presentation.

\`\`\`html
${html}
\`\`\``;
      } else {
        templateContext = `## Template Reference (MUST FOLLOW EXACTLY)

Use this HTML template as your structural and stylistic reference. You MUST:
1. Match its layout, component structure, design patterns, and CSS styling exactly
2. Keep the same section arrangement and visual hierarchy
3. Preserve the exact color palette, typography, and spacing
4. Replace only the placeholder text content with the user's requested content

\`\`\`html
${html}
\`\`\``;
      }
    }
  }

  // Fetch layout data if provided
  let layoutData: { layoutMap?: LayoutMap; layoutHtml?: string } | null = null;
  if (layout_id && layout_type) {
    if (layout_type === "brand") {
      const { data: layoutBrand } = await supabase
        .from("brand_profiles")
        .select("styles")
        .eq("id", layout_id)
        .eq("user_id", user.id)
        .single();
      if (layoutBrand?.styles) {
        const s = layoutBrand.styles as Record<string, unknown>;
        layoutData = {
          layoutMap: s.layoutMap as LayoutMap | undefined,
          layoutHtml: s.layoutHtml as string | undefined,
        };
        console.log("[generate] Layout loaded from brand:", layout_id);
      }
    } else if (layout_type === "template") {
      // When a template is selected as layout source, use its full HTML as the layout reference
      const { data: layoutTemplate } = await supabase
        .from("templates")
        .select("html_content")
        .eq("id", layout_id)
        .eq("user_id", user.id)
        .single();
      if (layoutTemplate) {
        layoutData = { layoutHtml: layoutTemplate.html_content };
        // Also set template context for backward compatibility
        if (!template) {
          const html = layoutTemplate.html_content;
          const isSlideshow = html.includes('slide') ||
                              html.includes('carousel') ||
                              (html.includes('prev') && html.includes('next')) ||
                              /\d+\s*\/\s*\d+/.test(html) ||
                              html.includes('currentSlide');

          if (isSlideshow) {
            templateContext = `## CRITICAL: Slideshow Template (MUST PRESERVE FORMAT)

This is a SLIDESHOW/PRESENTATION template. You MUST preserve the slideshow format exactly:
1. Keep ALL slides as separate sections that display one at a time
2. Keep the navigation arrows (prev/next buttons)
3. Keep the slide counter/indicator
4. Keep the JavaScript for slide navigation
5. Keep the presentation aspect ratio and transitions

DO NOT convert this into a scrolling landing page. The output MUST be a slideshow presentation.

\`\`\`html
${html}
\`\`\``;
          } else {
            templateContext = `## Template Reference (MUST FOLLOW EXACTLY)

Use this HTML template as your structural and stylistic reference. You MUST:
1. Match its layout, component structure, design patterns, and CSS styling exactly
2. Keep the same section arrangement and visual hierarchy
3. Preserve the exact color palette, typography, and spacing
4. Replace only the placeholder text content with the user's requested content

\`\`\`html
${html}
\`\`\``;
          }
        }
        console.log("[generate] Layout loaded from template:", layout_id);
      }
    }
  }

  // Use starter template HTML as reference if provided (and no DB template is set)
  if (starter_template_html && !templateContext) {
    // Detect if this is a slideshow/presentation template
    const isSlideshow = starter_template_html.includes('slide') ||
                        starter_template_html.includes('carousel') ||
                        (starter_template_html.includes('prev') && starter_template_html.includes('next')) ||
                        /\d+\s*\/\s*\d+/.test(starter_template_html) || // "1 / 6" pattern
                        starter_template_html.includes('currentSlide');

    if (isSlideshow) {
      templateContext = `## CRITICAL: Slideshow Template (MUST PRESERVE FORMAT)

This is a SLIDESHOW/PRESENTATION template. You MUST preserve the slideshow format exactly:
1. Keep ALL slides as separate sections that display one at a time
2. Keep the navigation arrows (prev/next buttons)
3. Keep the slide counter/indicator (e.g., "1 / 6")
4. Keep the JavaScript for slide navigation
5. Keep the 16:9 or presentation aspect ratio
6. Keep the slide transition effects

DO NOT convert this into a scrolling landing page. The output MUST be a slideshow presentation.

Replace the placeholder content in each slide with the user's requested content, but maintain the exact same number of slides and navigation structure.

\`\`\`html
${starter_template_html}
\`\`\``;
      console.log("[generate] Using starter template as SLIDESHOW reference");
    } else {
      templateContext = `## Template Reference (MUST FOLLOW EXACTLY)

Use this HTML template as your structural and stylistic reference. You MUST:
1. Match its layout, component structure, design patterns, and CSS styling exactly
2. Keep the same section arrangement and visual hierarchy
3. Preserve the exact color palette, typography, and spacing
4. Replace only the placeholder text content with the user's requested content
5. Do NOT reorganize sections or change the fundamental layout

\`\`\`html
${starter_template_html}
\`\`\``;
      console.log("[generate] Using starter template as reference");
    }
  }

  // Fetch documents if provided
  let documentContext = "";
  if (document_ids && document_ids.length > 0) {
    const { data: documents } = await supabase
      .from("documents")
      .select("filename, content")
      .in("id", document_ids)
      .eq("user_id", user.id);

    if (documents && documents.length > 0) {
      documentContext = formatDocumentsForContext(
        documents as Array<{ filename: string; content: string }>
      );
    }
  }

  const modelMessages = convertToModelMessages(messages, {
    template: templateContext,
    documents: documentContext,
  });
  const systemPrompt = buildSystemPrompt(brand, layoutData, icon_style, image_mode);

  console.log("[generate] System prompt length:", systemPrompt.length);
  if (brand) {
    console.log("[generate] Brand section of prompt:", systemPrompt.slice(systemPrompt.indexOf("## CRITICAL")));
  }

  const result = streamText({
    model: openrouter(MODEL_ID),
    system: systemPrompt,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
