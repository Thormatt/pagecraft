export const MAX_HTML_SIZE = 500 * 1024; // 500KB
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_SLUG_LENGTH = 64;
export const MIN_SLUG_LENGTH = 3;

export const SITE_NAME = "PageCraft";
export const SITE_DESCRIPTION = "Generate beautiful HTML pages with AI and deploy them instantly.";

export const PUBLIC_PAGE_CSP = [
  "default-src 'none'",
  "style-src 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "script-src 'unsafe-inline'",
  "img-src * data: blob:",
  "media-src * data: blob:",
  "connect-src 'none'",
].join("; ");
