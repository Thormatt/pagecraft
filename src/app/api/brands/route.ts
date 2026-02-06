/**
 * Brand Profiles API
 *
 * GET /api/brands - List user's brand profiles
 * PATCH /api/brands - Update a brand profile
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: brands, error } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Brands] Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }

  return NextResponse.json({ brands });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, is_default } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Brand ID is required" },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (is_default !== undefined) updates.is_default = is_default;

  const { data: brand, error } = await supabase
    .from("brand_profiles")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[Brands] Update error:", error);
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 }
    );
  }

  return NextResponse.json({ brand });
}
