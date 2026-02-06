"use client";

import { ChatInterface } from "@/components/generate/chat-interface";
import { HtmlPreview } from "@/components/generate/html-preview";
import type { HtmlPreviewHandle } from "@/components/generate/html-preview";
import { StyleEditorPanel } from "@/components/generate/style-editor-panel";
import { DeployButton } from "@/components/generate/deploy-button";
import { SaveTemplateButton } from "@/components/generate/save-template-button";
import { SaveDraftButton } from "@/components/generate/save-draft-button";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useRef } from "react";
import { applyInlineStyle, applyTextContent } from "@/lib/style-editor/html-mutator";
import type { PromptMessage } from "@/types";
import type { ElementInfo } from "@/types/style-editor";

export default function GeneratePage() {
  const [html, setHtml] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [messages, setMessages] = useState<PromptMessage[]>([]);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const previewRef = useRef<HtmlPreviewHandle>(null);

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
      // Update the persisted HTML string
      setHtml((prev) => applyInlineStyle(prev, cssPath, property, value));

      // Send to iframe for instant visual update (no reload)
      previewRef.current?.applyStyle(cssPath, property, value);

      // Update selected element styles if this element is selected
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
        setSelectedElement(null);
        previewRef.current?.clearSelection();
      }
      return !prev;
    });
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
        <div className="flex items-center gap-2">
          {html && view === "preview" && (
            <Button
              variant={editorOpen ? "default" : "outline"}
              size="sm"
              onClick={toggleEditor}
            >
              <svg
                className="h-3.5 w-3.5"
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
          <SaveDraftButton html={html} messages={messages} disabled={!html} />
          <SaveTemplateButton html={html} disabled={!html} />
          <DeployButton html={html} messages={messages} disabled={!html} />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full border-r md:w-[400px]">
          <ChatInterface
            onHtmlUpdate={handleHtmlUpdate}
            onMessagesUpdate={handleMessagesUpdate}
          />
        </div>
        {editorOpen && html && view === "preview" && (
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
          {html ? (
            view === "preview" ? (
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
