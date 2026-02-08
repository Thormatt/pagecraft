/**
 * Brand Extraction API
 *
 * POST /api/brands/extract
 *
 * Extracts brand aesthetics from a URL and saves to database
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractBrand } from "@/lib/brand/extractor";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ExtractRequest {
  url: string;
  name?: string;
  is_default?: boolean;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ExtractRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { url, name, is_default = false } = body;

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Validate URL format and block private/internal URLs
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Only HTTP(S) URLs are allowed" }, { status: 400 });
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const blockedPatterns = [
    /^localhost$/,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\./,
    /^\[::1\]$/,
    /^\[fc/i,
    /^\[fd/i,
    /^\[fe80:/i,
    /\.internal$/,
    /\.local$/,
  ];

  if (blockedPatterns.some((p) => p.test(hostname))) {
    return NextResponse.json({ error: "Internal URLs are not allowed" }, { status: 400 });
  }

  try {
    // Extract brand from URL
    const extraction = await extractBrand(url);

    // Create brand profile in database
    const { data: brand, error } = await supabase
      .from("brand_profiles")
      .insert({
        user_id: user.id,
        name: name || extraction.title || new URL(url).hostname,
        source_url: url,
        logo_url: extraction.logo_url,
        colors: extraction.colors,
        fonts: extraction.fonts,
        styles: extraction.styles,
        screenshot: extraction.screenshot,
        is_default,
      })
      .select()
      .single();

    if (error) {
      console.error("[Brand Extract] Database error:", error);
      return NextResponse.json(
        { error: "Failed to save brand profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      brand,
    });
  } catch (error) {
    console.error("[Brand Extract] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to extract brand",
      },
      { status: 500 }
    );
  }
}
