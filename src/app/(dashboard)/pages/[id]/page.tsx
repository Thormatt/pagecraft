"use client";

import { ChatInterface } from "@/components/generate/chat-interface";
import { HtmlPreview } from "@/components/generate/html-preview";
import { CodeEditor } from "@/components/generate/code-editor";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Page, PromptMessage } from "@/types";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [html, setHtml] = useState("");
  const [messages, setMessages] = useState<PromptMessage[]>([]);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      const response = await fetch(`/api/pages/${id}`);
      if (!response.ok) {
        router.push("/dashboard");
        return;
      }
      const data = await response.json();
      setPage(data);
      setHtml(data.html_content);
      setMessages(data.prompt_history ?? []);
      setLoading(false);
    }
    loadPage();
  }, [id, router]);

  const handleHtmlUpdate = useCallback((newHtml: string) => {
    setHtml(newHtml);
  }, []);

  const handleMessagesUpdate = useCallback((newMessages: PromptMessage[]) => {
    setMessages(newMessages);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html_content: html,
        prompt_history: messages,
      }),
    });
    setSaving(false);
  };

  const handleCodeChange = (newCode: string) => {
    setHtml(newCode);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium">{page?.title ?? "Edit Page"}</h1>
          <div className="flex rounded-lg border p-0.5">
            <button
              onClick={() => setView("preview")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                view === "preview"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setView("code")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                view === "code"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Code
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/pages/${id}/settings`)}
          >
            Settings
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full border-r md:w-[400px]">
          <ChatInterface
            onHtmlUpdate={handleHtmlUpdate}
            onMessagesUpdate={handleMessagesUpdate}
            initialMessages={messages}
            initialHtml={html}
          />
        </div>
        <div className="hidden flex-1 md:block">
          {view === "preview" ? (
            <HtmlPreview html={html} className="h-full w-full border-0" />
          ) : (
            <CodeEditor
              value={html}
              onChange={handleCodeChange}
              className="h-full resize-none rounded-none border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}
