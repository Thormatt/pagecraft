export const MAX_HTML_SIZE = 500 * 1024; // 500KB
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_SLUG_LENGTH = 64;
export const MIN_SLUG_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 30;
export const MIN_USERNAME_LENGTH = 3;
export const MAX_DISPLAY_NAME_LENGTH = 100;

export const SITE_NAME = "PageCraft";
export const SITE_DESCRIPTION = "Generate beautiful HTML pages with AI and deploy them instantly.";

export const MAX_PAGE_PASSWORD_LENGTH = 128;
export const PAGE_ACCESS_COOKIE_MAX_AGE = 86400; // 24 hours

export const EXPIRATION_PRESETS = [
  { label: "1 hour", seconds: 3600 },
  { label: "1 day", seconds: 86400 },
  { label: "7 days", seconds: 604800 },
  { label: "30 days", seconds: 2592000 },
] as const;

export const PASSWORD_FORM_CSP = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "form-action 'self'",
  "base-uri 'none'",
].join("; ");

export const PUBLIC_PAGE_CSP = [
  "sandbox allow-scripts",
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src https: data: blob:",
  "media-src https: data: blob:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join("; ");
