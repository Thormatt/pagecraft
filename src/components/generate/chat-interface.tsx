"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThemeSelector, type ThemeSelection } from "@/components/generate/theme-selector";
import { FileUpload } from "@/components/generate/file-upload";
import { extractHtml, type IconStyle, type ImageMode } from "@/lib/ai/prompt";
import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import type { UIMessage } from "ai";
import type { PromptMessage } from "@/types";

interface UploadedDocument {
  id: string;
  filename: string;
  content_type: string;
  file_size: number;
}

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

interface ChatInterfaceProps {
  onHtmlUpdate: (html: string) => void;
  onMessagesUpdate: (messages: PromptMessage[]) => void;
  initialMessages?: PromptMessage[];
  initialHtml?: string;
  initialBrandId?: string;
  initialTemplateHtml?: string | null;
}

export function ChatInterface({
  onHtmlUpdate,
  onMessagesUpdate,
  initialMessages = [],
  initialHtml,
  initialTemplateHtml,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [themeSelection, setThemeSelection] = useState<ThemeSelection>({
    theme: null,
    layout: initialTemplateHtml ? { type: "starter", id: "initial", name: "Template", html: initialTemplateHtml } : null,
  });
  const [attachedDocuments, setAttachedDocuments] = useState<UploadedDocument[]>([]);
  const [iconStyle, setIconStyle] = useState<IconStyle>("svg");
  const [imageMode, setImageMode] = useState<ImageMode>("stock");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestHtmlRef = useRef(initialHtml ?? "");

  // Store request body in a ref so it's always current
  const requestBodyRef = useRef<Record<string, unknown>>({});

  // Update layout when initialTemplateHtml changes (from sessionStorage)
  useEffect(() => {
    if (initialTemplateHtml && !themeSelection.layout) {
      setThemeSelection((prev) => ({
        ...prev,
        layout: { type: "starter", id: "initial", name: "Template", html: initialTemplateHtml },
      }));
    }
  }, [initialTemplateHtml, themeSelection.layout]);

  // Update the ref whenever theme selection changes
  useEffect(() => {
    const body: Record<string, unknown> = {
      document_ids: attachedDocuments.map((d) => d.id),
      icon_style: iconStyle,
      image_mode: imageMode,
    };

    if (themeSelection.theme) {
      body.brand_id = themeSelection.theme.id;
    }

    if (themeSelection.layout) {
      if (themeSelection.layout.type === "starter" && themeSelection.layout.html) {
        body.starter_template_html = themeSelection.layout.html;
      } else if (themeSelection.layout.type === "saved") {
        body.layout_id = themeSelection.layout.id;
        body.layout_type = "template";
      }
    }

    requestBodyRef.current = body;
    console.log("[chat] Updated request body:", requestBodyRef.current);
  }, [themeSelection, attachedDocuments, iconStyle, imageMode]);

  // Custom transport that reads from the ref for current values
  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: "/api/generate",
      fetch: async (input, init) => {
        // Parse the existing body and merge with our dynamic data
        const existingBody = init?.body ? JSON.parse(init.body as string) : {};
        const mergedBody = { ...existingBody, ...requestBodyRef.current };
        console.log("[chat] Sending request with body:", mergedBody);
        return fetch(input, {
          ...init,
          body: JSON.stringify(mergedBody),
        });
      },
    });
  }, []);

  const { messages, status, sendMessage } = useChat({
    transport,
    messages: initialMessages.map((m, i) => ({
      id: String(i),
      role: m.role,
      parts: [{ type: "text" as const, text: m.content }],
    })),
  });

  const isLoading = status === "submitted" || status === "streaming";

  // Stream preview: update on each chunk from the assistant
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "assistant") {
      const text = getTextContent(lastMessage);
      if (text) {
        const html = extractHtml(text);
        if (html !== latestHtmlRef.current) {
          latestHtmlRef.current = html;
          onHtmlUpdate(html);
        }
      }
    }
  }, [messages, onHtmlUpdate]);

  // Sync messages back to parent when generation finishes
  useEffect(() => {
    if (status === "ready" && messages.length > 0) {
      const promptMessages: PromptMessage[] = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: getTextContent(m),
      }));
      onMessagesUpdate(promptMessages);
    }
  }, [messages, status, onMessagesUpdate]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!trimmed || isLoading) return;
      setInputValue("");
      sendMessage({ text: trimmed });
    },
    [inputValue, isLoading, sendMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <div className="space-y-2">
              <p className="text-lg font-medium">Describe the page you want to create</p>
              <p className="text-sm text-muted-foreground">
                e.g. &quot;A landing page for a coffee shop with a hero section, menu, and contact form&quot;
              </p>
            </div>
          </div>
        )}
        {messages.map((message) => {
          const text = getTextContent(message);
          return (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap">{text}</p>
                ) : (
                  <p className="text-muted-foreground">
                    {isLoading && message.id === messages[messages.length - 1]?.id
                      ? "Generating..."
                      : "HTML generated. See preview."}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <ThemeSelector
            selection={themeSelection}
            onSelectionChange={(sel) => {
              setThemeSelection(sel);
              // Show layout preview immediately when a starter template is selected
              if (sel.layout?.type === "starter" && sel.layout.html) {
                onHtmlUpdate(sel.layout.html);
              }
            }}
          />
          <FileUpload
            documents={attachedDocuments}
            onDocumentsChange={setAttachedDocuments}
          />
          <select
            value={iconStyle}
            onChange={(e) => setIconStyle(e.target.value as IconStyle)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
            title="Icon style in generated pages"
          >
            <option value="svg">SVG Icons</option>
            <option value="emoji">Emoji</option>
            <option value="none">No Icons</option>
          </select>
          <select
            value={imageMode}
            onChange={(e) => setImageMode(e.target.value as ImageMode)}
            className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
            title="Image style in generated pages"
          >
            <option value="stock">Stock Photos</option>
            <option value="ai">AI Generated</option>
            <option value="none">No Images</option>
          </select>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              attachedDocuments.length > 0
                ? "Describe what to create from these files..."
                : "Describe your page or request changes..."
            }
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()}>
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
