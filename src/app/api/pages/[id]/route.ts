import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { MAX_HTML_SIZE, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_SLUG_LENGTH, MIN_SLUG_LENGTH } from "@/lib/constants";

const updatePageSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE_LENGTH).optional(),
  slug: z
    .string()
    .min(MIN_SLUG_LENGTH)
    .max(MAX_SLUG_LENGTH)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Invalid slug format")
    .optional(),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).nullable().optional(),
  html_content: z.string().min(1).max(MAX_HTML_SIZE).optional(),
  prompt_history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ).optional(),
  is_published: z.boolean().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: page, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const parsed = updatePageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // If updating slug, check uniqueness per user
  if (parsed.data.slug) {
    const { data: existing } = await supabase
      .from("pages")
      .select("id")
      .eq("user_id", user.id)
      .eq("slug", parsed.data.slug)
      .neq("id", id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "You already have a page with this slug" }, { status: 409 });
    }
  }

  const { data: page, error } = await supabase
    .from("pages")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error || !page) {
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }

  return NextResponse.json(page);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("pages")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
