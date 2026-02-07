import { SYSTEM_PROMPT, type IconStyle, type ImageMode } from "@/lib/ai/prompt";
import { getPhotoReferenceForPrompt } from "@/lib/images/unsplash";
import { createClient } from "@/lib/supabase/server";
import type { BuildRequest } from "@/types/moodboard";

export const maxDuration = 120;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

interface OpenRouterChoice {
  message?: { content?: string };
}

interface OpenRouterResponse {
  choices?: OpenRouterChoice[];
}

/**
 * Deep visual analysis of the concept image using Gemini.
 * Extracts exact colors, text content, layout structure, typography — everything
 * needed to recreate the design faithfully.
 */
async function analyzeDesignImage(imageUrl: string): Promise<string> {
  const prompt = `Analyze this website design image in EXTREME detail. Extract everything needed to recreate it exactly.

Return a structured analysis with:

## LAYOUT STRUCTURE
- Describe the overall page layout (header, hero, sections, footer)
- For each section, describe: position, width, height, alignment
- Describe grid/flex layouts used

## COLORS (extract exact hex codes)
- Background colors for each section
- Text colors (headings, body, links)
- Button colors (background, text, border)
- Accent colors

## TYPOGRAPHY
- Font styles (serif/sans-serif)
- Heading sizes (approximate: text-4xl, text-2xl, etc.)
- Font weights (bold, semibold, normal)
- Line heights and letter spacing

## ALL TEXT CONTENT
- List EVERY piece of text visible: headlines, subheadlines, paragraphs, button labels, navigation items, footer text
- Include testimonials, quotes, feature descriptions

## UI ELEMENTS
- Navigation: layout, items, style
- Buttons: shape (rounded/square), size, style (filled/outlined)
- Cards: shadow, border-radius, padding
- Icons: describe any icons you see

## SECTIONS (top to bottom)
List each section and describe in detail:
1. Header/Nav
2. Hero section
3. Features section
4. [Any other sections]
5. Footer

Be extremely detailed and specific. This analysis will be used to recreate the design pixel-perfectly.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl } },
              { type: "text", text: prompt },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      console.error("[Build] Design analysis error:", await response.text());
      return "";
    }

    const data = (await response.json()) as OpenRouterResponse;
    const analysis = data.choices?.[0]?.message?.content || "";
    console.log("[Build] Design analysis length:", analysis.length);
    return analysis;
  } catch (error) {
    console.error("[Build] Design analysis error:", error);
    return "";
  }
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!OPENROUTER_API_KEY) {
    return new Response("OpenRouter API key not configured", { status: 500 });
  }

  const { description, websiteType, selectedLayout, selectedConcept, icon_style, image_mode }: BuildRequest = await request.json();

  if (!description || !selectedLayout || !selectedConcept) {
    return new Response("Missing required fields", { status: 400 });
  }

  console.log("[Build] Starting moodboard build:", {
    description: description.substring(0, 50),
    layout: selectedLayout.name,
    concept: selectedConcept.name,
  });

  // Deep analysis of the concept image (the one the user chose as their style)
  const designAnalysis = await analyzeDesignImage(selectedConcept.imageUrl);
  console.log("[Build] Got design analysis:", designAnalysis.length, "chars");

  // Build icon/image instructions
  let extraInstructions = "";
  if (icon_style === "svg") {
    extraInstructions += "\nUse simple inline SVG icons instead of emoji. Keep SVGs clean, single-color, 20-24px.";
  } else if (icon_style === "none") {
    extraInstructions += "\nDo NOT use emoji or icons. Text only.";
  }

  if (image_mode === "stock") {
    extraInstructions += `\nUse real stock photos from Unsplash for all imagery.\n${getPhotoReferenceForPrompt()}`;
  } else if (image_mode === "none") {
    extraInstructions += "\nDo NOT include any images. Use CSS gradients/backgrounds only.";
  }

  // Build the prompt — include the full design analysis as the blueprint
  let userMessage: string;

  if (designAnalysis) {
    userMessage = `Website Description: ${description}
Website Type: ${websiteType === "landing" ? "Single-page landing page" : "Multi-page website"}
Layout Style: "${selectedLayout.name}" - ${selectedLayout.description}
Visual Style: "${selectedConcept.name}" - ${selectedConcept.description}

## DESIGN ANALYSIS (from visual analysis of the selected concept image)
${designAnalysis}

## YOUR TASK
Using the detailed design analysis above, create an HTML page that EXACTLY recreates this design.

CRITICAL INSTRUCTIONS:
- Follow the LAYOUT STRUCTURE section exactly
- Use the exact HEX COLORS listed in the analysis
- Include ALL TEXT CONTENT from the analysis verbatim
- Recreate every section described in the analysis
- Match the typography sizes and weights
- The output should look like a pixel-perfect recreation of the analyzed design
${extraInstructions}

Generate a complete, self-contained HTML page. Return ONLY the HTML — no explanations, no markdown code blocks.`;
  } else {
    userMessage = `Create a ${websiteType === "landing" ? "single-page landing page" : "multi-page website"} for:

${description}

The layout should follow the "${selectedLayout.name}" style: ${selectedLayout.description}
The visual design should follow the "${selectedConcept.name}" aesthetic: ${selectedConcept.description}
${extraInstructions}

Generate a complete, polished HTML page. Return ONLY the HTML — no explanations, no markdown code blocks.`;
  }

  console.log("[Build] User message length:", userMessage.length);

  // Call OpenRouter directly
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 16000,
    }),
  });

  console.log("[Build] OpenRouter response status:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Build] OpenRouter error:", errorText);
    return new Response(`Failed to generate HTML: ${errorText}`, { status: 500 });
  }

  const data = (await response.json()) as OpenRouterResponse;
  const generatedHtml = data.choices?.[0]?.message?.content || "";

  console.log("[Build] Generated HTML length:", generatedHtml.length);

  if (!generatedHtml.trim()) {
    return new Response("Model returned empty response", { status: 500 });
  }

  return new Response(generatedHtml, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
