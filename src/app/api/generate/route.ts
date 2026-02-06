import { openrouter, MODEL_ID } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/prompt";
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

  const { messages, brand_id, template_id, document_ids, layout_id, layout_type }: GenerateRequest =
    await request.json();

  console.log("[generate] Request received:", { brand_id, template_id, document_ids, layout_id, layout_type, messageCount: messages.length });

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
      templateContext = `## Template Reference

Use this HTML template as your structural and stylistic reference. Match its layout, component structure, and design patterns. Replace the content with the user's requested content while preserving the template's design language.

\`\`\`html
${template.html_content}
\`\`\``;
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
          templateContext = `## Template Reference

Use this HTML template as your structural and stylistic reference. Match its layout, component structure, and design patterns. Replace the content with the user's requested content while preserving the template's design language.

\`\`\`html
${layoutTemplate.html_content}
\`\`\``;
        }
        console.log("[generate] Layout loaded from template:", layout_id);
      }
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
  const systemPrompt = buildSystemPrompt(brand, layoutData);

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
