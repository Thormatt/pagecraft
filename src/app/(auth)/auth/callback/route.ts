import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_REDIRECTS = ["/pages", "/generate", "/pages", "/themes", "/content", "/settings"];

function isAllowedRedirect(path: string): boolean {
  return ALLOWED_REDIRECTS.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/pages";
  const next = isAllowedRedirect(rawNext) ? rawNext : "/pages";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
