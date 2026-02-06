import { openrouter, MODEL_ID } from "@/lib/ai/client";
import { createClient } from "@/lib/supabase/server";
import { generateText } from "ai";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a precise HTML/CSS editor. You receive a single HTML element and an instruction describing how to modify it.

Rules:
1. Return ONLY the modified HTML element — no explanation, no markdown, no code blocks
2. Preserve the element's tag name and overall structure unless the instruction explicitly asks to change it
3. You may modify inline styles, classes, attributes, and inner content
4. Keep all existing attributes unless the instruction asks to remove them
5. If the instruction asks for a style change, prefer inline styles
6. Return valid HTML that can directly replace the original element`;

interface EditElementRequest {
  elementHtml: string;
  instruction: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { elementHtml, instruction }: EditElementRequest = await request.json();

  if (!elementHtml || !instruction) {
    return Response.json({ error: "Missing elementHtml or instruction" }, { status: 400 });
  }

  console.log("[edit-element] Request:", { instructionLength: instruction.length, elementHtmlLength: elementHtml.length });

  const { text } = await generateText({
    model: openrouter(MODEL_ID),
    system: SYSTEM_PROMPT,
    prompt: `## Current Element\n\`\`\`html\n${elementHtml}\n\`\`\`\n\n## Instruction\n${instruction}`,
  });

  // Clean up: strip any markdown code block wrapping the AI might add
  let result = text.trim();
  const codeBlockMatch = result.match(/```(?:html)?\s*\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    result = codeBlockMatch[1].trim();
  }

  console.log("[edit-element] Result length:", result.length);

  return Response.json({ html: result });
}
