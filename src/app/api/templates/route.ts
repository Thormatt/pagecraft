import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: templates, error } = await supabase
    .from("templates")
    .select("id, name, description, thumbnail, brand_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, html_content, thumbnail, brand_id } =
    await request.json();

  if (!name || !html_content) {
    return NextResponse.json(
      { error: "Name and HTML content are required" },
      { status: 400 }
    );
  }

  const { data: template, error } = await supabase
    .from("templates")
    .insert({
      user_id: user.id,
      name,
      description,
      html_content,
      thumbnail,
      brand_id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template });
}
