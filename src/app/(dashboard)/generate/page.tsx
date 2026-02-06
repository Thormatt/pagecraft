"use client";

import { ChatInterface } from "@/components/generate/chat-interface";
import { HtmlPreview } from "@/components/generate/html-preview";
import type { HtmlPreviewHandle } from "@/components/generate/html-preview";
import { StyleEditorPanel } from "@/components/generate/style-editor-panel";
import { DeployButton } from "@/components/generate/deploy-button";
import { SaveTemplateButton } from "@/components/generate/save-template-button";
import { SaveDraftButton } from "@/components/generate/save-draft-button";
import { StarterTemplateGallery } from "@/components/generate/starter-template-gallery";
import { ExportButton } from "@/components/generate/export-button";
import { Button } from "@/components/ui/button";
import { useState, useCallback, useRef, useEffect } from "react";
import { applyInlineStyle, applyTextContent, applyAttribute, getElementOuterHtml, replaceElementOuterHtml, insertChildElement } from "@/lib/style-editor/html-mutator";
import type { PromptMessage } from "@/types";
import type { ElementInfo } from "@/types/style-editor";

export default function GeneratePage() {
  const [html, setHtml] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [messages, setMessages] = useState<PromptMessage[]>([]);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [editorOpen, setEditorOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [initialTemplateHtml, setInitialTemplateHtml] = useState<string | null>(null);
  const previewRef = useRef<HtmlPreviewHandle>(null);

  // Pick up template from /themes page navigation
  useEffect(() => {
    const templateHtml = sessionStorage.getItem("starter-template-html");
    if (templateHtml) {
      sessionStorage.removeItem("starter-template-html");
      setHtml(templateHtml);
      setPreviewHtml(templateHtml);
      setInitialTemplateHtml(templateHtml); // Pass to chat interface for API
    }
  }, []);

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

  const handleAttributeChange = useCallback(
    (cssPath: string, attribute: string, value: string) => {
      setHtml((prev) => applyAttribute(prev, cssPath, attribute, value));
      // Update selected element attributes to keep UI in sync
      setSelectedElement((prev) => {
        if (!prev || prev.cssPath !== cssPath) return prev;
        return { ...prev, attributes: { ...prev.attributes, [attribute]: value } };
      });
    },
    []
  );

  const handleAiEdit = useCallback(
    async (cssPath: string, instruction: string) => {
      const elementHtml = getElementOuterHtml(html, cssPath);
      if (!elementHtml) return;

      const res = await fetch("/api/generate/edit-element", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elementHtml, instruction }),
      });

      if (!res.ok) return;

      const { html: newElementHtml } = await res.json();
      if (!newElementHtml) return;

      const updated = replaceElementOuterHtml(html, cssPath, newElementHtml);
      setHtml(updated);
      setPreviewHtml(updated);
      setSelectedElement(null);
    },
    [html]
  );

  const handleInsertElement = useCallback(
    (parentCssPath: string, childHtml: string) => {
      const updated = insertChildElement(html, parentCssPath, childHtml);
      setHtml(updated);
      setPreviewHtml(updated);
    },
    [html]
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
        // Exiting editor mode - sync previewHtml with html to persist text changes
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
          <ExportButton html={html} disabled={!html} />
          <SaveDraftButton html={html} messages={messages} disabled={!html} />
          <SaveTemplateButton html={html} disabled={!html} />
          <DeployButton html={html} messages={messages} disabled={!html} />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {chatOpen && (
          <div className="w-full border-r md:w-[400px] relative shrink-0">
            <ChatInterface
              onHtmlUpdate={handleHtmlUpdate}
              onMessagesUpdate={handleMessagesUpdate}
              initialTemplateHtml={initialTemplateHtml}
            />
            {/* Collapse chat button */}
            {html && (
              <button
                onClick={() => setChatOpen(false)}
                className="absolute top-3 right-3 z-10 rounded-md border bg-background p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Hide chat"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 19l-7-7 7-7" />
                  <path d="M18 19l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>
        )}
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="shrink-0 flex items-center justify-center w-10 border-r bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Show chat"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        )}
        {editorOpen && html && view === "preview" && (
          <div className="hidden w-[280px] shrink-0 md:block">
            <StyleEditorPanel
              html={html}
              selectedElement={selectedElement}
              onStyleChange={handleStyleChange}
              onAttributeChange={handleAttributeChange}
              onAiEdit={handleAiEdit}
              onInsertElement={handleInsertElement}
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
            <StarterTemplateGallery onSelect={handleHtmlUpdate} />
          )}
        </div>
      </div>
    </div>
  );
}
