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

export type PageInsert = Omit<Page, "id" | "created_at" | "updated_at" | "view_count">;
export type PageUpdate = Partial<Pick<Page, "title" | "slug" | "description" | "html_content" | "prompt_history" | "is_published">>;
