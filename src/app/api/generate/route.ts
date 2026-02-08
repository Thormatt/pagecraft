import { openrouter, MODEL_ID } from "@/lib/ai/client";
import { buildSystemPrompt, type IconStyle, type ImageMode } from "@/lib/ai/prompt";
import { formatDocumentsForContext } from "@/lib/content/processor";
import { PAGE_FORMATS, type PageFormat } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { streamText } from "ai";
import type { BrandProfile } from "@/types/database";

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
  starter_template_html?: string;
  icon_style?: IconStyle;
  image_mode?: ImageMode;
  page_format?: PageFormat;
}

function detectSlideshow(html: string): boolean {
  return (
    html.includes("slide") ||
    html.includes("carousel") ||
    (html.includes("prev") && html.includes("next")) ||
    /\d+\s*\/\s*\d+/.test(html) ||
    html.includes("currentSlide")
  );
}

function buildTemplateContext(html: string): string {
  if (detectSlideshow(html)) {
    return `## CRITICAL: Slideshow Template (MUST PRESERVE FORMAT)

This is a SLIDESHOW/PRESENTATION template. You MUST preserve the slideshow format exactly:
1. Keep ALL slides as separate sections that display one at a time (using the .slide class pattern)
2. Keep the navigation arrows (prev/next buttons)
3. Keep the slide counter/indicator (e.g., "1 / 6")
4. Keep the JavaScript for slide navigation
5. Keep the 16:9 or presentation aspect ratio
6. Keep the slide transition effects

DO NOT convert this into a scrolling landing page. The output MUST be a slideshow presentation.
Replace the placeholder content in each slide with the user's requested content, but maintain the exact same number of slides and navigation structure.

NOTE: If brand guidelines are provided in the system prompt, apply the brand's colors and fonts to the slides INSTEAD of the template's default colors. The template defines STRUCTURE; the brand defines VISUAL IDENTITY.

\`\`\`html
${html}
\`\`\``;
  }

  return `## Template Reference (Layout Structure)

Use this HTML template as your structural foundation:
1. Keep the same section arrangement, layout patterns, and visual hierarchy
2. Preserve CSS class naming and structural patterns
3. Keep spacing, borders, shadows, and layout effects
4. Replace placeholder text with the user's requested content
5. Do NOT redesign the layout structure

NOTE: If brand guidelines are provided in the system prompt, apply the brand's colors and fonts INSTEAD of the template's default colors. The template defines STRUCTURE; the brand defines VISUAL IDENTITY.

\`\`\`html
${html}
\`\`\``;
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

  const { messages, brand_id, template_id, document_ids, starter_template_html, icon_style, image_mode, page_format }: GenerateRequest =
    await request.json();

  console.log("[generate] Request received:", { brand_id, template_id, document_ids, hasStarterTemplate: !!starter_template_html, image_mode, messageCount: messages.length });

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

  // Fetch saved template if provided (backward compat)
  let templateContext = "";
  if (template_id) {
    const { data: template } = await supabase
      .from("templates")
      .select("*")
      .eq("id", template_id)
      .eq("user_id", user.id)
      .single();
    if (template) {
      console.log("[generate] Template loaded:", { id: template.id, name: template.name });
      templateContext = buildTemplateContext(template.html_content);
    }
  }

  // Use starter template HTML as reference if provided (and no DB template is set)
  if (starter_template_html && !templateContext) {
    templateContext = buildTemplateContext(starter_template_html);
    console.log("[generate] Using starter template as reference, isSlideshow:", detectSlideshow(starter_template_html));
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
  const formatPrompt = page_format
    ? PAGE_FORMATS.find(f => f.value === page_format)?.prompt ?? null
    : null;
  const systemPrompt = buildSystemPrompt(brand, undefined, icon_style, image_mode, formatPrompt);

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
