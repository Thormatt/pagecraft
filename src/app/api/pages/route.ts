import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { MAX_HTML_SIZE, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_SLUG_LENGTH, MIN_SLUG_LENGTH } from "@/lib/constants";

const createPageSchema = z.object({
  title: z.string().min(1).max(MAX_TITLE_LENGTH),
  slug: z
    .string()
    .min(MIN_SLUG_LENGTH)
    .max(MAX_SLUG_LENGTH)
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Invalid slug format"),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).nullable().optional(),
  html_content: z.string().min(1).max(MAX_HTML_SIZE),
  prompt_history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ).optional().default([]),
});

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

  const parsed = createPageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { title, slug, description, html_content, prompt_history } = parsed.data;

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("pages")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const { data: page, error } = await supabase
    .from("pages")
    .insert({
      user_id: user.id,
      title,
      slug,
      description: description ?? null,
      html_content,
      prompt_history,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
  }

  return NextResponse.json(page, { status: 201 });
}
