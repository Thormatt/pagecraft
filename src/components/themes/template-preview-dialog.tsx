"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import type { StarterTemplate } from "@/data/starter-templates";

type AspectRatio = "16:9" | "9:16";

// Native render dimensions for each mode
const DIMENSIONS: Record<AspectRatio, { w: number; h: number }> = {
  "16:9": { w: 1280, h: 720 },
  "9:16": { w: 390, h: 693 },
};

interface TemplatePreviewDialogProps {
  template: StarterTemplate | null;
  onClose: () => void;
  onUse: (template: StarterTemplate) => void;
}

export function TemplatePreviewDialog({
  template,
  onClose,
  onUse,
}: TemplatePreviewDialogProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [scale, setScale] = useState(1);

  const { w: iframeW, h: iframeH } = DIMENSIONS[aspectRatio];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!template) return;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [template, handleKeyDown]);

  // Write HTML into iframe
  useEffect(() => {
    if (!template) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(template.html);
    doc.close();
  }, [template, aspectRatio]);

  // Measure container and calculate scale
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const { width, height } = container.getBoundingClientRect();
      const pad = 32;
      const availW = width - pad;
      const availH = height - pad;
      setScale(Math.min(availW / iframeW, availH / iframeH, 1));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [iframeW, iframeH]);

  if (!template) return null;

  const isSlides = template.category === "slides";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative z-10 flex flex-col w-[90vw] max-w-5xl bg-card rounded-xl border border-border shadow-xl overflow-hidden"
        style={{ height: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{template.name}</h2>
            <span className="rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {isSlides ? "Slides" : "Report"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Aspect ratio picker — only for slides */}
            {isSlides && (
              <div className="flex rounded-lg border p-0.5">
                <button
                  onClick={() => setAspectRatio("16:9")}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    aspectRatio === "16:9"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Desktop (16:9)"
                >
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="0.75" y="0.75" width="12.5" height="8.5" rx="1" />
                  </svg>
                  16:9
                </button>
                <button
                  onClick={() => setAspectRatio("9:16")}
                  className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                    aspectRatio === "9:16"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Mobile (9:16)"
                >
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="0.75" y="0.75" width="8.5" height="12.5" rx="1" />
                  </svg>
                  9:16
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {template.previewColors.map((color, i) => (
                <div
                  key={i}
                  className="h-5 w-5 rounded-full border border-border/50"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Button onClick={() => onUse(template)}>Use Template</Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="px-6 py-2 border-b bg-muted/30 shrink-0">
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>

        {/* Preview area */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center overflow-hidden bg-muted/20"
          style={{ minHeight: 0 }}
        >
          {isSlides ? (
            /* Slides: render at native resolution, scale to fit */
            <div
              className="rounded-md shadow-lg overflow-hidden"
              style={{
                width: iframeW * scale,
                height: iframeH * scale,
              }}
            >
              <iframe
                ref={iframeRef}
                className="border-0 origin-top-left"
                style={{
                  width: iframeW,
                  height: iframeH,
                  transform: `scale(${scale})`,
                }}
                title={`${template.name} preview`}
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          ) : (
            /* Pages: scrollable iframe */
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title={`${template.name} preview`}
              sandbox="allow-same-origin allow-scripts"
            />
          )}
        </div>
      </div>
    </div>
  );
}
