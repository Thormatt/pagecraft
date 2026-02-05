import { anthropic, MODEL_ID } from "@/lib/ai/client";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { createClient } from "@/lib/supabase/server";
import { streamText } from "ai";

export const maxDuration = 60;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await request.json();

  const result = streamText({
    model: anthropic(MODEL_ID),
    system: SYSTEM_PROMPT,
    messages,
  });

  return result.toUIMessageStreamResponse();
}
