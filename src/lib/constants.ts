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

export const PAGE_FORMATS = [
  {
    value: "auto",
    label: "Auto",
    description: "AI decides the best layout",
    prompt: null,
  },
  {
    value: "landing",
    label: "Landing Page",
    description: "Hero, features, testimonials, CTA",
    prompt: "Create a scrolling landing page with: hero section with headline and CTA button, features/benefits grid (3-4 items), social proof or testimonials section, and a final call-to-action section. Use full-width sections with alternating backgrounds.",
  },
  {
    value: "dashboard",
    label: "Dashboard",
    description: "KPI cards, charts, data tables",
    prompt: "Create a data dashboard layout with: a top row of KPI/stat cards (3-4 metrics with numbers and labels), a charts section using simple CSS/SVG bar charts or progress indicators, and a data table or list section. Use a grid layout with cards. Include realistic sample data.",
  },
  {
    value: "slides",
    label: "Presentation",
    description: "Slide deck with navigation",
    prompt: "Create a fullscreen slideshow presentation with: 5-7 slides displayed one at a time, prev/next navigation arrows, a slide counter (e.g. '1 / 7'), and a 16:9 aspect ratio. Include a title slide, content slides with bullet points or grids, a data/stats slide, and a closing slide. Use JavaScript for slide navigation.",
  },
  {
    value: "report",
    label: "Report",
    description: "Long-form document with sections",
    prompt: "Create a long-form report/document with: a cover section with title and date, a table of contents, numbered sections with headings, data visualizations (CSS charts, stat callouts), pull quotes or highlight boxes, and a summary section. Use a centered max-width layout with generous typography.",
  },
  {
    value: "blog",
    label: "Blog / Article",
    description: "Article with rich typography",
    prompt: "Create a blog article layout with: a hero image or banner, article title with author and date, well-formatted body text with subheadings, a blockquote or callout box, and a related articles or CTA section at the bottom. Use a narrow reading-width layout (max ~720px) with excellent typography.",
  },
  {
    value: "portfolio",
    label: "Portfolio / Gallery",
    description: "Visual grid with lightbox feel",
    prompt: "Create a portfolio/gallery page with: a minimal header with name/title, a masonry or grid layout of project cards (6-8 items) with images and brief descriptions, hover effects on cards, and a contact/about section. Use CSS grid with responsive columns.",
  },
] as const;

export type PageFormat = (typeof PAGE_FORMATS)[number]["value"];
