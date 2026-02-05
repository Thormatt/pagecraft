"use client";

import { ChatInterface } from "@/components/generate/chat-interface";
import { HtmlPreview } from "@/components/generate/html-preview";
import { DeployButton } from "@/components/generate/deploy-button";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";
import type { PromptMessage } from "@/types";

export default function GeneratePage() {
  const [html, setHtml] = useState("");
  const [messages, setMessages] = useState<PromptMessage[]>([]);
  const [view, setView] = useState<"preview" | "code">("preview");

  const handleHtmlUpdate = useCallback((newHtml: string) => {
    setHtml(newHtml);
  }, []);

  const handleMessagesUpdate = useCallback((newMessages: PromptMessage[]) => {
    setMessages(newMessages);
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium">Generate Page</h1>
          {html && (
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
          )}
        </div>
        <DeployButton html={html} messages={messages} disabled={!html} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full border-r md:w-[400px]">
          <ChatInterface
            onHtmlUpdate={handleHtmlUpdate}
            onMessagesUpdate={handleMessagesUpdate}
          />
        </div>
        <div className="hidden flex-1 md:block">
          {html ? (
            view === "preview" ? (
              <HtmlPreview html={html} className="h-full w-full border-0" />
            ) : (
              <div className="h-full overflow-auto bg-muted p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                  {html}
                </pre>
              </div>
            )
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <svg className="mx-auto h-12 w-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                <p className="text-sm">Preview will appear here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
