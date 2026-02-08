import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  size?: "small" | "medium" | "large";
}

interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Extract image from various Gemini response formats
 */
function extractImageFromResponse(data: Record<string, unknown>): string | null {
  const message = (data.choices as Array<{ message?: Record<string, unknown> }>)?.[0]?.message;
  if (!message) return null;

  // Format 1: images array with image_url objects
  const images = message.images as Array<{ type?: string; image_url?: { url?: string } } | string> | undefined;
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

  // Format 2: content as array with image_url items
  const content = message.content;
  if (Array.isArray(content)) {
    for (const item of content as Array<{ type?: string; image_url?: { url?: string } }>) {
      if (item.type === "image_url" && item.image_url?.url) {
        return item.image_url.url;
      }
    }
  }

  // Format 3: base64 embedded in string content
  if (typeof content === "string") {
    const base64Match = content.match(/data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+/);
    if (base64Match) {
      return base64Match[0];
    }
  }

  // Format 4: parts with inline_data (native Gemini format)
  const parts = message.parts as Array<{ inline_data?: { mime_type?: string; data?: string } }> | undefined;
  if (Array.isArray(parts)) {
    for (const part of parts) {
      if (part.inline_data?.mime_type?.startsWith("image/") && part.inline_data.data) {
        return `data:${part.inline_data.mime_type};base64,${part.inline_data.data}`;
      }
    }
  }

  return null;
}

export async function POST(request: Request): Promise<Response> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" } as ImageGenerationResponse,
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as ImageGenerationRequest;
    const { prompt, style, size = "medium" } = body;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" } as ImageGenerationResponse,
        { status: 400 }
      );
    }

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OpenRouter API key not configured" } as ImageGenerationResponse,
        { status: 500 }
      );
    }

    // Build the image prompt
    let imagePrompt = `Generate a high-quality image: ${prompt}`;
    if (style) {
      imagePrompt += `. Style: ${style}`;
    }

    // Size mapping
    const sizeInstructions = {
      small: "Image should be optimized for thumbnails or icons, simple and clear.",
      medium: "Image should be suitable for web content, balanced detail and clarity.",
      large: "Image should be high-detail, suitable for hero sections or backgrounds.",
    };

    imagePrompt += `. ${sizeInstructions[size]}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: imagePrompt,
          },
        ],
        modalities: ["text", "image"],
        temperature: 0.8,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Image Generate] API error:", errorText);
      return NextResponse.json(
        { success: false, error: `API error: ${response.status}` } as ImageGenerationResponse,
        { status: response.status }
      );
    }

    const data = (await response.json()) as Record<string, unknown>;
    const imageUrl = extractImageFromResponse(data);

    if (!imageUrl) {
      console.error("[Image Generate] No image in response:", JSON.stringify(data).substring(0, 500));
      return NextResponse.json(
        { success: false, error: "No image generated" } as ImageGenerationResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, imageUrl } as ImageGenerationResponse);
  } catch (error) {
    console.error("[Image Generate] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      } as ImageGenerationResponse,
      { status: 500 }
    );
  }
}
