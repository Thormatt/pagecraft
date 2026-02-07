import { createClient } from "@/lib/supabase/server";
import { PUBLIC_PAGE_CSP } from "@/lib/constants";

/**
 * Inject OG meta tags into HTML content for social media sharing
 */
function injectOgMetaTags(
  html: string,
  options: {
    title: string;
    description: string;
    ogImageUrl: string;
    pageUrl: string;
  }
): string {
  const { title, description, ogImageUrl, pageUrl } = options;

  const ogTags = `
    <!-- Open Graph / Social Media Meta Tags -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(ogImageUrl)}" />
    <meta property="og:url" content="${escapeHtml(pageUrl)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}" />
  `;

  // Insert OG tags before </head>
  if (html.includes("</head>")) {
    return html.replace("</head>", `${ogTags}</head>`);
  }

  // If no </head> found, try to add after opening <html> or at the beginning
  if (html.includes("<head>")) {
    return html.replace("<head>", `<head>${ogTags}`);
  }

  // Fallback: wrap content with proper HTML structure including OG tags
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  ${ogTags}
</head>
<body>
${html}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const supabase = await createClient();

  let page;

  if (path.length === 2) {
    // New format: /p/username/slug
    const [username, slug] = path;

    // First, find the user by username
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (profile) {
      // Look up the page by user_id and slug
      const { data } = await supabase
        .from("pages")
        .select("id, html_content, title, is_published")
        .eq("user_id", profile.id)
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      page = data;
    }
  }

  if (!page) {
    const displayPath = path.join("/");
    return new Response(notFoundHtml(displayPath), {
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

  // Build the full page URL
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const pageUrl = `${baseUrl}/p/${path.join("/")}`;
  const ogImageUrl = `${baseUrl}/api/pages/${page.id}/og-image`;

  // Inject OG meta tags for social media sharing
  const htmlWithOg = injectOgMetaTags(page.html_content, {
    title: page.title || "Generated Page",
    description: "Created with PageGen",
    ogImageUrl,
    pageUrl,
  });

  return new Response(htmlWithOg, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": PUBLIC_PAGE_CSP,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });
}

function notFoundHtml(path: string): string {
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
    <p>The page <code>/p/${escapeHtml(path)}</code> doesn't exist or isn't published.</p>
    <p><a href="/">Go home</a></p>
  </div>
</body>
</html>`;
}
