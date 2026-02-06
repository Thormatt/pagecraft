/**
 * Drafts API
 *
 * GET /api/drafts - List user's draft pages
 * POST /api/drafts - Create or update a draft
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { MAX_HTML_SIZE } from "@/lib/constants";

const saveDraftSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200).optional().default("Untitled Draft"),
  html_content: z.string().min(1).max(MAX_HTML_SIZE),
  prompt_history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
  brand_id: z.string().uuid().nullable().optional(),
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: drafts, error } = await supabase
    .from("pages")
    .select("id, title, html_content, prompt_history, brand_id, created_at, updated_at")
    .eq("user_id", user.id)
    .eq("is_published", false)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[Drafts] Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    );
  }

  return NextResponse.json({ drafts });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = saveDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { id, title, html_content, prompt_history, brand_id } = parsed.data;

  // If id provided, update existing draft
  if (id) {
    const { data: draft, error } = await supabase
      .from("pages")
      .update({
        title,
        html_content,
        prompt_history,
        brand_id: brand_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("is_published", false)
      .select()
      .single();

    if (error || !draft) {
      console.error("[Drafts] Update error:", error);
      return NextResponse.json(
        { error: "Failed to update draft" },
        { status: 500 }
      );
    }

    return NextResponse.json({ draft });
  }

  // Create new draft with a temporary slug
  const tempSlug = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const { data: draft, error } = await supabase
    .from("pages")
    .insert({
      user_id: user.id,
      title,
      slug: tempSlug,
      html_content,
      prompt_history,
      brand_id: brand_id ?? null,
      is_published: false,
    })
    .select()
    .single();

  if (error) {
    console.error("[Drafts] Create error:", error);
    return NextResponse.json(
      { error: "Failed to create draft" },
      { status: 500 }
    );
  }

  return NextResponse.json({ draft }, { status: 201 });
}
