import { createClient } from "@/lib/supabase/server";
import { PUBLIC_PAGE_CSP } from "@/lib/constants";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("id, html_content, title, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!page) {
    return new Response(notFoundHtml(slug), {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  // Track view (fire-and-forget)
  const referrer = request.headers.get("referer") ?? null;
  const userAgent = request.headers.get("user-agent") ?? null;
  Promise.all([
    supabase.from("page_views").insert({
      page_id: page.id,
      referrer,
      user_agent: userAgent,
    }),
    supabase.rpc("increment_view_count", { p_page_id: page.id }),
  ]).catch(() => {});

  return new Response(page.html_content, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": PUBLIC_PAGE_CSP,
      "X-Frame-Options": "SAMEORIGIN",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}

function notFoundHtml(slug: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; margin: 0;
      background: #fafafa; color: #333;
    }
    .container { text-align: center; }
    h1 { font-size: 4rem; margin: 0; color: #ccc; }
    p { color: #666; margin-top: 0.5rem; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>The page <code>/${slug}</code> doesn't exist or isn't published.</p>
    <p><a href="/">Go home</a></p>
  </div>
</body>
</html>`;
}
