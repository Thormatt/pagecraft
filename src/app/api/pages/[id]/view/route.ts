import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const referrer = request.headers.get("referer") ?? null;
  const userAgent = request.headers.get("user-agent") ?? null;

  // Fire-and-forget: insert view and increment counter
  await Promise.all([
    supabase.from("page_views").insert({
      page_id: id,
      referrer,
      user_agent: userAgent,
    }),
    supabase.rpc("increment_view_count", { p_page_id: id }),
  ]);

  return NextResponse.json({ success: true });
}
