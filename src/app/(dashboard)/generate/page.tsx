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
import { GenerationOverlay } from "@/components/generate/generation-overlay";
import { Button } from "@/components/ui/button";
import { MoodboardWizard } from "@/components/moodboard/moodboard-wizard";
import { useState, useCallback, useRef, useEffect } from "react";
import { applyInlineStyle, applyTextContent, applyAttribute, getElementOuterHtml, replaceElementOuterHtml, insertChildElement } from "@/lib/style-editor/html-mutator";
import type { PromptMessage } from "@/types";
import type { ElementInfo } from "@/types/style-editor";

type GenerateMode = "chat" | "moodboard";

export default function GeneratePage() {
  const [html, setHtml] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [messages, setMessages] = useState<PromptMessage[]>([]);
  const [view, setView] = useState<"preview" | "code">("preview");
  const [editorOpen, setEditorOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [initialTemplateHtml, setInitialTemplateHtml] = useState<string | null>(null);
  const [mode, setMode] = useState<GenerateMode>("chat");
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HtmlPreviewHandle>(null);
  const saveMenuRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef(html);
  useEffect(() => { htmlRef.current = html; }, [html]);

  // Pick up template from /themes page navigation
  useEffect(() => {
    const templateHtml = sessionStorage.getItem("starter-template-html");
    if (!templateHtml) return;
    sessionStorage.removeItem("starter-template-html");
    const frameId = requestAnimationFrame(() => {
      setHtml(templateHtml);
      setPreviewHtml(templateHtml);
      setInitialTemplateHtml(templateHtml);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (!saveMenuOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (
        saveMenuRef.current &&
        !saveMenuRef.current.contains(event.target as Node)
      ) {
        setSaveMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [saveMenuOpen]);

  const handleHtmlUpdate = useCallback((newHtml: string) => {
    setHtml(newHtml);
    setPreviewHtml(newHtml);
    setSelectedElement(null);
  }, []);

  const handleTemplateSelect = useCallback((templateHtml: string) => {
    setHtml(templateHtml);
    setPreviewHtml(templateHtml);
    setInitialTemplateHtml(templateHtml);
    setSelectedElement(null);
  }, []);

  const handleMessagesUpdate = useCallback((newMessages: PromptMessage[]) => {
    setMessages(newMessages);
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsGenerating(loading);
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
      const elementHtml = getElementOuterHtml(htmlRef.current, cssPath);
      if (!elementHtml) return;

      try {
        const res = await fetch("/api/generate/edit-element", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ elementHtml, instruction }),
        });

        if (!res.ok) return;

        const { html: newElementHtml } = await res.json();
        if (!newElementHtml) return;

        // Update persisted HTML using functional update to avoid stale closure
        setHtml((prev) => replaceElementOuterHtml(prev, cssPath, newElementHtml));

        // Patch the element in the live iframe via bridge (no reload)
        previewRef.current?.replaceElement(cssPath, newElementHtml);
        setSelectedElement(null);
      } catch (err) {
        console.error("AI edit failed:", err);
      }
    },
    []
  );

  const handleInsertElement = useCallback(
    (parentCssPath: string, childHtml: string) => {
      const updated = insertChildElement(htmlRef.current, parentCssPath, childHtml);
      setHtml(updated);
      setPreviewHtml(updated);
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
        // Exiting editor mode - sync previewHtml with latest html
        setPreviewHtml(htmlRef.current);
        setSelectedElement(null);
        previewRef.current?.clearSelection();
      }
      return !prev;
    });
  }, []);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 md:px-5">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold tracking-tight">Generate Page</h1>
          {html && (
            <div className="flex rounded-xl border border-border/70 bg-background p-1">
              <button
                onClick={() => setView("preview")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  view === "preview"
                    ? "tab-pill-active text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setView("code")}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200 ${
                  view === "code"
                    ? "tab-pill-active text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Code
              </button>
            </div>
          )}
        </div>
        <div className="floating-bar flex items-center gap-1.5 p-1.5">
          {html && view === "preview" && (
            <Button
              variant={editorOpen ? "default" : "outline"}
              size="md"
              onClick={toggleEditor}
              className="rounded-xl"
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
          <ExportButton
            html={html}
            disabled={!html || isGenerating}
            variant="ghost"
            size="md"
            className="rounded-xl text-foreground/80 hover:text-foreground"
          />
          <div className="relative" ref={saveMenuRef}>
            <Button
              variant="outline"
              size="md"
              disabled={!html || isGenerating}
              onClick={() => setSaveMenuOpen((prev) => !prev)}
              className="rounded-xl"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save
              <svg
                className={`h-3 w-3 transition-transform ${saveMenuOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </Button>
            <div
              className={`absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-border/80 bg-background/95 p-1.5 shadow-lg backdrop-blur-sm transition ${
                saveMenuOpen
                  ? "visible scale-100 opacity-100"
                  : "invisible pointer-events-none scale-95 opacity-0"
              }`}
            >
              <SaveDraftButton
                html={html}
                messages={messages}
                disabled={!html}
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-lg px-3"
                onDraftSaved={() => setSaveMenuOpen(false)}
              />
              <SaveTemplateButton
                html={html}
                disabled={!html}
                variant="ghost"
                size="sm"
                className="w-full justify-start rounded-lg px-3"
                onTriggerClick={() => setSaveMenuOpen(false)}
              />
            </div>
          </div>
          <DeployButton
            html={html}
            messages={messages}
            disabled={!html || isGenerating}
            size="md"
            variant="default"
            className="rounded-xl px-5"
          />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {chatOpen && (
          <div className="w-full border-r border-border/50 md:w-[400px] relative shrink-0 flex flex-col">
            {/* Mode tabs */}
            <div className="flex bg-muted/50 m-3 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setMode("chat")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === "chat"
                    ? "tab-pill-active text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Chat
                </span>
              </button>
              <button
                onClick={() => setMode("moodboard")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === "moodboard"
                    ? "tab-pill-active text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  Moodboard
                </span>
              </button>
            </div>

            {/* Content based on mode */}
            <div className="flex-1 overflow-hidden">
              {mode === "chat" ? (
                <ChatInterface
                  onHtmlUpdate={handleHtmlUpdate}
                  onMessagesUpdate={handleMessagesUpdate}
                  onLoadingChange={handleLoadingChange}
                  initialTemplateHtml={initialTemplateHtml}
                />
              ) : (
                <MoodboardWizard
                  onHtmlUpdate={handleHtmlUpdate}
                  onMessagesUpdate={handleMessagesUpdate}
                  onLoadingChange={handleLoadingChange}
                />
              )}
            </div>

            {/* Collapse chat button */}
            {html && (
              <button
                onClick={() => setChatOpen(false)}
                className="absolute top-12 right-3 z-10 rounded-md border bg-background p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Hide panel"
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
        <div className="hidden flex-1 md:flex md:flex-col relative overflow-hidden">
          {html ? (
            view === "preview" ? (
              <>
                <HtmlPreview
                  ref={previewRef}
                  html={html}
                  previewHtml={previewHtml}
                  editorMode={editorOpen}
                  onElementSelected={handleElementSelected}
                  onTextChanged={handleTextChange}
                  className="h-full w-full border-0"
                />
                <GenerationOverlay isGenerating={isGenerating} />
              </>
            ) : (
              <div className="h-full overflow-auto bg-muted p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                  {html}
                </pre>
              </div>
            )
          ) : mode === "chat" ? (
            <StarterTemplateGallery onSelect={handleTemplateSelect} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <p className="text-sm font-medium">Your page preview will appear here</p>
              <p className="text-xs mt-1 opacity-70">Complete the moodboard steps to generate your page</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
