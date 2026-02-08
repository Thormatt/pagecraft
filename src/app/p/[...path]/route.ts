import { createClient } from "@/lib/supabase/server";
import { PUBLIC_PAGE_CSP, PASSWORD_FORM_CSP, PAGE_ACCESS_COOKIE_MAX_AGE } from "@/lib/constants";
import {
  verifyPagePassword,
  verifyAccessCookie,
  createAccessCookie,
  cookieName,
  serializeCookie,
} from "@/lib/page-access";

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

interface PublishedPage {
  id: string;
  html_content: string;
  title: string;
  is_published: boolean;
  expires_at: string | null;
  page_password: string | null;
}

/**
 * Look up a published page by username/slug path.
 */
async function findPublishedPage(
  path: string[]
): Promise<PublishedPage | null> {
  if (path.length !== 2) return null;

  const [username, slug] = path;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (!profile) return null;

  const { data } = await supabase
    .from("pages")
    .select("id, html_content, title, is_published, expires_at, page_password")
    .eq("user_id", profile.id)
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  return data as PublishedPage | null;
}

/**
 * Parse cookies from a request header string.
 */
function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  const cookies: Record<string, string> = {};
  for (const pair of header.split(";")) {
    const [key, ...rest] = pair.trim().split("=");
    if (key) cookies[key] = rest.join("=");
  }
  return cookies;
}

/**
 * Serve the page content with OG tags and CSP.
 */
function servePageContent(
  request: Request,
  page: PublishedPage,
  path: string[],
  supabase: Awaited<ReturnType<typeof createClient>>,
  extraHeaders?: Record<string, string>
): Response {
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

  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const pageUrl = `${baseUrl}/p/${path.join("/")}`;
  const ogImageUrl = `${baseUrl}/api/pages/${page.id}/og-image`;

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
      ...extraHeaders,
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const page = await findPublishedPage(path);

  if (!page) {
    const displayPath = path.join("/");
    return new Response(notFoundHtml(displayPath), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Expiration check (before password — no point prompting for an expired page)
  if (page.expires_at && new Date(page.expires_at) < new Date()) {
    return new Response(expiredPageHtml(page.title), {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": PASSWORD_FORM_CSP,
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  // Password check
  if (page.page_password) {
    const cookies = parseCookies(request.headers.get("cookie"));
    const accessCookie = cookies[cookieName(page.id)];

    if (!accessCookie || !(await verifyAccessCookie(page.id, accessCookie))) {
      return new Response(passwordFormHtml(page.title), {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy": PASSWORD_FORM_CSP,
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
  }

  const supabase = await createClient();
  return servePageContent(request, page, path, supabase);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const page = await findPublishedPage(path);

  if (!page) {
    const displayPath = path.join("/");
    return new Response(notFoundHtml(displayPath), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Expiration check
  if (page.expires_at && new Date(page.expires_at) < new Date()) {
    return new Response(expiredPageHtml(page.title), {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": PASSWORD_FORM_CSP,
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  if (!page.page_password) {
    // No password set — redirect to GET
    return new Response(null, {
      status: 303,
      headers: { Location: `/p/${path.join("/")}` },
    });
  }

  const formData = await request.formData();
  const password = formData.get("password");

  if (
    typeof password !== "string" ||
    !password ||
    !(await verifyPagePassword(page.id, password, page.page_password))
  ) {
    return new Response(passwordFormHtml(page.title, "Incorrect password"), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": PASSWORD_FORM_CSP,
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  // Correct password — set cookie and redirect to GET
  const cookie = await createAccessCookie(page.id);
  return new Response(null, {
    status: 303,
    headers: {
      Location: `/p/${path.join("/")}`,
      "Set-Cookie": serializeCookie(
        cookieName(page.id),
        cookie,
        PAGE_ACCESS_COOKIE_MAX_AGE
      ),
    },
  });
}

function passwordFormHtml(pageTitle: string, errorMessage?: string): string {
  const errorHtml = errorMessage
    ? `<p class="error">${escapeHtml(errorMessage)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Required — ${escapeHtml(pageTitle)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh;
      background: #fafafa; color: #333;
    }
    .card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
      padding: 2rem; width: 100%; max-width: 380px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    h1 { font-size: 1.125rem; font-weight: 600; margin-bottom: 0.25rem; }
    .subtitle { color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.375rem; }
    input[type="password"] {
      width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db;
      border-radius: 6px; font-size: 0.875rem; outline: none;
    }
    input[type="password"]:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.15); }
    button {
      width: 100%; margin-top: 1rem; padding: 0.5rem; border: none;
      border-radius: 6px; background: #18181b; color: #fff;
      font-size: 0.875rem; font-weight: 500; cursor: pointer;
    }
    button:hover { background: #27272a; }
    .error { color: #dc2626; font-size: 0.8125rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Password Required</h1>
    <p class="subtitle">This page is password protected.</p>
    <form method="POST">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required autofocus />
      ${errorHtml}
      <button type="submit">View Page</button>
    </form>
  </div>
</body>
</html>`;
}

function expiredPageHtml(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Expired — ${escapeHtml(title)}</title>
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
    <h1>410</h1>
    <p>This page has expired.</p>
    <p><a href="/">Go home</a></p>
  </div>
</body>
</html>`;
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
