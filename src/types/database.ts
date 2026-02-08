export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  html_content: string;
  prompt_history: PromptMessage[];
  view_count: number;
  is_published: boolean;
  expires_at: string | null;
  page_password: string | null;
  brand_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageView {
  id: string;
  page_id: string;
  viewed_at: string;
  referrer: string | null;
  user_agent: string | null;
}

export interface PromptMessage {
  role: "user" | "assistant";
  content: string;
}

export interface BrandProfile {
  id: string;
  user_id: string;
  name: string;
  source_url: string;
  logo_url: string | null;
  colors: string[];
  fonts: string[];
  styles: Record<string, unknown>;
  screenshot: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  mime_type: string;
  file_size: number;
  content: string;
  content_type: "pdf" | "docx" | "xlsx" | "csv" | "txt";
  created_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  html_content: string;
  thumbnail: string | null;
  brand_id: string | null;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdate = Partial<Pick<Profile, "username" | "display_name">>;
export type PageInsert = Omit<Page, "id" | "created_at" | "updated_at" | "view_count">;
export type PageUpdate = Partial<Pick<Page, "title" | "slug" | "description" | "html_content" | "prompt_history" | "is_published" | "expires_at" | "brand_id" | "page_password">>;
export type BrandProfileInsert = Omit<BrandProfile, "id" | "created_at" | "updated_at">;
export type DocumentInsert = Omit<Document, "id" | "created_at">;
export type TemplateInsert = Omit<Template, "id" | "created_at" | "updated_at">;
