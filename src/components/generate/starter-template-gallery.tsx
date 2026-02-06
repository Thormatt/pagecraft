"use client";

import { useRef, useEffect, useState } from "react";
import { STARTER_TEMPLATES, type StarterTemplate } from "@/data/starter-templates";

const CATEGORY_LABELS: Record<StarterTemplate["category"], string> = {
  slides: "Slides",
  report: "Report",
};

interface StarterTemplateGalleryProps {
  onSelect: (html: string) => void;
}

function TemplateCard({
  template,
  onSelect,
}: {
  template: StarterTemplate;
  onSelect: (html: string) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scale, setScale] = useState(0);

  const isSlides = template.category === "slides";
  const iframeWidth = 1280;
  const iframeHeight = isSlides ? 720 : 4000;

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

  // Dynamically compute scale to fill card width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / iframeWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [iframeWidth]);

  // Preview height: slides use 16:9 ratio, reports use capped height
  const previewHeight = isSlides
    ? iframeWidth * scale * (9 / 16)
    : Math.min(250, iframeHeight * scale);

  return (
    <button
      className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-all hover:border-primary/50 hover:shadow-md"
      onClick={() => onSelect(template.html)}
    >
      {/* Iframe preview */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-muted"
        style={{ height: previewHeight || 180 }}
      >
        {scale > 0 && (
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
        )}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{template.name}</span>
          <span className="shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {CATEGORY_LABELS[template.category]}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow">
          Use Template
        </span>
      </div>
    </button>
  );
}

const FILTERS = [
  { value: "all" as const, label: "All" },
  { value: "slides" as const, label: "Slides" },
  { value: "report" as const, label: "Reports" },
];

export function StarterTemplateGallery({ onSelect }: StarterTemplateGalleryProps) {
  const [filter, setFilter] = useState<"all" | "slides" | "report">("all");

  const filtered = filter === "all"
    ? STARTER_TEMPLATES
    : STARTER_TEMPLATES.filter((t) => t.category === filter);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold">Start from a Template</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pick a template or describe your page in the chat
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
