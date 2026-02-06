"use client";

import { ChatInterface } from "@/components/generate/chat-interface";
import { HtmlPreview } from "@/components/generate/html-preview";
import type { HtmlPreviewHandle } from "@/components/generate/html-preview";
import { CodeEditor } from "@/components/generate/code-editor";
import { StyleEditorPanel } from "@/components/generate/style-editor-panel";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { applyInlineStyle, applyTextContent } from "@/lib/style-editor/html-mutator";
import type { Page, PromptMessage } from "@/types";
import type { ElementInfo } from "@/types/style-editor";

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [html, setHtml] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [messages, setMessages] = useState<PromptMessage[]>([]);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const previewRef = useRef<HtmlPreviewHandle>(null);

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
      setPreviewHtml(data.html_content);
      setMessages(data.prompt_history ?? []);
      setLoading(false);
    }
    loadPage();
  }, [id, router]);

  const handleHtmlUpdate = useCallback((newHtml: string) => {
    setHtml(newHtml);
    setPreviewHtml(newHtml);
    setSelectedElement(null);
  }, []);

  const handleMessagesUpdate = useCallback((newMessages: PromptMessage[]) => {
    setMessages(newMessages);
  }, []);

  const handleStyleChange = useCallback(
    (cssPath: string, property: string, value: string) => {
      setHtml((prev) => applyInlineStyle(prev, cssPath, property, value));
      previewRef.current?.applyStyle(cssPath, property, value);
      setSelectedElement((prev) => {
        if (!prev || prev.cssPath !== cssPath) return prev;
        return { ...prev, styles: { ...prev.styles, [property]: value } };
      });
    },
    []
  );

  const handleTextChange = useCallback(
    (cssPath: string, text: string) => {
      setHtml((prev) => applyTextContent(prev, cssPath, text));
    },
    []
  );

  const handleElementSelected = useCallback((element: ElementInfo) => {
    setSelectedElement(element);
  }, []);

  const handleSelectElement = useCallback(
    (cssPath: string) => {
      previewRef.current?.selectElement(cssPath);
    },
    []
  );

  const handleClearSelection = useCallback(() => {
    setSelectedElement(null);
    previewRef.current?.clearSelection();
  }, []);

  const toggleEditor = useCallback(() => {
    setEditorOpen((prev) => {
      if (prev) {
        setHtml((currentHtml) => {
          setPreviewHtml(currentHtml);
          return currentHtml;
        });
        setSelectedElement(null);
        previewRef.current?.clearSelection();
      }
      return !prev;
    });
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
          {view === "preview" && (
            <Button
              variant={editorOpen ? "default" : "outline"}
              size="sm"
              onClick={toggleEditor}
            >
              <svg
                className="h-3.5 w-3.5 mr-1.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" />
              </svg>
              Style
            </Button>
          )}
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
        {editorOpen && view === "preview" && (
          <div className="hidden w-[280px] md:block">
            <StyleEditorPanel
              html={html}
              selectedElement={selectedElement}
              onStyleChange={handleStyleChange}
              onSelectElement={handleSelectElement}
              onClearSelection={handleClearSelection}
            />
          </div>
        )}
        <div className="hidden flex-1 md:block">
          {view === "preview" ? (
            <HtmlPreview
              ref={previewRef}
              html={html}
              previewHtml={previewHtml}
              editorMode={editorOpen}
              onElementSelected={handleElementSelected}
              onTextChanged={handleTextChange}
              className="h-full w-full border-0"
            />
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
