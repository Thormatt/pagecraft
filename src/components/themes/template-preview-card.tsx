"use client";

import { useRef, useEffect, useState } from "react";
import type { StarterTemplate } from "@/data/starter-templates";

interface TemplatePreviewCardProps {
  template: StarterTemplate;
  onClick: () => void;
  onUse: () => void;
}

export function TemplatePreviewCard({ template, onClick, onUse }: TemplatePreviewCardProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const previewRef = useRef<HTMLButtonElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const isSlides = template.category === "slides";
  const iframeWidth = 1280;
  const iframeHeight = isSlides ? 720 : 4000;
  const scale = 0.25;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(template.html);
    doc.close();
    setIsLoaded(true);
  }, [template.html]);

  // Forward wheel events to iframe scroll for report templates
  useEffect(() => {
    if (isSlides) return;
    const el = previewRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.scrollBy(0, e.deltaY / scale);
      e.preventDefault();
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [isSlides]);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:shadow-md">
      {/* Preview thumbnail */}
      <button
        ref={previewRef}
        onClick={onClick}
        className="relative w-full overflow-hidden bg-muted cursor-pointer"
        style={{
          height: isSlides ? 180 : 225,
        }}
      >
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{
            width: iframeWidth,
            height: iframeHeight,
            transform: `scale(${scale})`,
          }}
        >
          <iframe
            ref={iframeRef}
            className="border-0 pointer-events-none"
            style={{ width: iframeWidth, height: iframeHeight }}
            title={`${template.name} preview`}
            sandbox="allow-same-origin"
          />
        </div>
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        )}
        {/* Hover overlay with preview button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow">
            Preview
          </span>
        </div>
      </button>

      {/* Info section */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-sm font-semibold truncate">{template.name}</span>
          <span className="shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {template.category === "slides" ? "Slides" : "Report"}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2 mb-3">
          {template.description}
        </p>

        {/* Color swatches */}
        <div className="flex items-center gap-1.5 mt-auto">
          {template.previewColors.map((color, i) => (
            <div
              key={i}
              className="h-4 w-4 rounded-full border border-border/50"
              style={{ backgroundColor: color }}
            />
          ))}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUse();
            }}
            className="ml-auto text-xs font-medium text-primary hover:underline"
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}
