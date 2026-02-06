import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const username = request.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ error: "Username required" }, { status: 400 });
  }

  // Check if username is taken by someone else
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username.toLowerCase())
    .neq("id", user.id)
    .single();

  return NextResponse.json({ available: !existing });
}
