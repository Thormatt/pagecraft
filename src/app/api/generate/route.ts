import { openrouter, MODEL_ID } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/prompt";
import { formatDocumentsForContext } from "@/lib/content/processor";
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
  document_ids?: string[];
}

function convertToModelMessages(
  messages: UIMessage[],
  documentContext?: string
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

    // Prepend document context to the first user message
    if (documentContext && msg.role === "user" && idx === 0) {
      content = `${documentContext}\n\n## User Request\n${content}`;
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

  const { messages, brand_id, document_ids }: GenerateRequest =
    await request.json();

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

  const modelMessages = convertToModelMessages(messages, documentContext);
  const systemPrompt = buildSystemPrompt(brand);

  const result = streamText({
    model: openrouter(MODEL_ID),
    system: systemPrompt,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
