import { createClient } from "@/lib/supabase/server";
import { CONCEPT_DIRECTIONS, type ConceptsRequest, type ConceptOption, type LayoutOption } from "@/types/moodboard";

export const maxDuration = 120;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

interface OpenRouterPart {
  type?: string;
  inline_data?: { mime_type?: string; data?: string };
  image_url?: { url?: string };
}

interface OpenRouterMessage {
  content?: unknown;
  parts?: OpenRouterPart[];
  images?: Array<{ type?: string; image_url?: { url?: string } } | string>;
}

interface OpenRouterChoice {
  message?: OpenRouterMessage;
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
}

function extractImageFromResponse(data: OpenRouterResponse): string | null {
  const message = data.choices?.[0]?.message;
  if (!message) return null;

  const images = message.images;
  if (images && Array.isArray(images)) {
    for (const img of images) {
      if (typeof img === "object" && img.type === "image_url" && img.image_url?.url) {
        return img.image_url.url;
      }
      if (typeof img === "string") {
        return `data:image/png;base64,${img}`;
      }
    }
  }

  const content = message.content;
  if (Array.isArray(content)) {
    for (const item of content as OpenRouterPart[]) {
      if (item.type === "image_url" && item.image_url?.url) {
        return item.image_url.url;
      }
    }
  }

  if (typeof content === "string") {
    const base64Match = content.match(/data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+/);
    if (base64Match) {
      return base64Match[0];
    }
  }

  const parts = message.parts;
  if (Array.isArray(parts)) {
    for (const part of parts) {
      if (part.inline_data?.mime_type?.startsWith("image/") && part.inline_data.data) {
        return `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
      }
    }
  }

  return null;
}

async function generateConceptImage(
  description: string,
  websiteType: string,
  layout: LayoutOption,
  direction: typeof CONCEPT_DIRECTIONS[number]
): Promise<string | null> {
  const prompt = `You are a professional web designer. Create a beautiful, FULLY DESIGNED website screenshot with rich colors, real photography, and polished UI.

Website: ${description}
Type: ${websiteType === "landing" ? "Single-page landing page" : "Multi-page full website"}
Layout Style: ${layout.name} - ${layout.description}
Visual Direction: ${direction.name} - ${direction.description}
Color Palette: Use colors that match the "${direction.name}" aesthetic

REQUIREMENTS:
- Render a COMPLETE, pixel-perfect website design as it would appear in a browser
- Apply the "${direction.name}" color scheme and visual style throughout
- Use real photography, icons, and realistic text content
- Include navigation, hero section, content sections, and footer
- Typography and styling should embody "${direction.description}"
- Make it look like a screenshot from a live, polished website on Dribbble or Awwwards

FORBIDDEN - Do NOT generate any of these:
- Wireframes or grayscale sketches
- Boxes labeled "IMAGE PLACEHOLDER" or "HEADLINE"
- Low-fidelity outlines or diagrams
- Gray/white mockups with placeholder text

Output a 16:9 aspect ratio image of the finished website design.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-image-preview",
      messages: [{ role: "user", content: prompt }],
      modalities: ["text", "image"],
      temperature: 0.8,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    console.error("[Concepts] API error:", await response.text());
    return null;
  }

  const data = (await response.json()) as OpenRouterResponse;
  return extractImageFromResponse(data);
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!OPENROUTER_API_KEY) {
    return new Response("OpenRouter API key not configured", { status: 500 });
  }

  const { description, websiteType, selectedLayout }: ConceptsRequest = await request.json();

  if (!description || !selectedLayout) {
    return new Response("Description and selected layout are required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      sendEvent({ type: "progress", completed: 0, total: CONCEPT_DIRECTIONS.length });

      const concepts: ConceptOption[] = [];

      const batchSize = 2;
      for (let i = 0; i < CONCEPT_DIRECTIONS.length; i += batchSize) {
        const batch = CONCEPT_DIRECTIONS.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (direction, batchIndex) => {
            const imageUrl = await generateConceptImage(
              description,
              websiteType,
              selectedLayout,
              direction
            );
            return {
              direction,
              imageUrl,
              index: i + batchIndex,
            };
          })
        );

        for (const result of results) {
          if (result.imageUrl) {
            const concept: ConceptOption = {
              id: result.direction.id,
              name: result.direction.name,
              description: result.direction.description,
              imageUrl: result.imageUrl,
            };
            concepts.push(concept);
            sendEvent({
              type: "concept",
              concept,
              completed: concepts.length,
            });
          } else {
            sendEvent({
              type: "progress",
              completed: result.index + 1,
              total: CONCEPT_DIRECTIONS.length,
            });
          }
        }
      }

      sendEvent({ type: "done", items: concepts });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
