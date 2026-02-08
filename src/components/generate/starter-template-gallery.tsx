"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { STARTER_TEMPLATES, type StarterTemplate } from "@/data/starter-templates";
import type { Template } from "@/types/database";

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
    if (scale === 0) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const blob = new Blob([template.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;
    return () => URL.revokeObjectURL(url);
  }, [template.html, scale]);

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
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
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
              onLoad={() => setIsLoaded(true)}
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
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{template.name}</span>
          <span className="shrink-0 rounded-full border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
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

function SavedTemplateCard({
  template,
  onSelect,
  onDelete,
}: {
  template: Template;
  onSelect: (html: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <button
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card text-left shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
      onClick={() => onSelect(template.html_content)}
    >
      {/* Thumbnail or placeholder */}
      <div className="relative w-full overflow-hidden bg-muted" style={{ height: 180 }}>
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold truncate">{template.name}</span>
          <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            Saved
          </span>
        </div>
        {template.description && (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {template.description}
          </p>
        )}
      </div>

      {/* Delete button */}
      <button
        className="absolute top-2 right-2 rounded-md bg-background/80 p-1 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity hover:text-destructive group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(template.id);
        }}
        title="Delete template"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
        <span className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow">
          Use Template
        </span>
      </div>
    </button>
  );
}

type FilterValue = "all" | "slides" | "report" | "saved";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "slides", label: "Slides" },
  { value: "report", label: "Reports" },
  { value: "saved", label: "My Templates" },
];

export function StarterTemplateGallery({ onSelect }: StarterTemplateGalleryProps) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
  const [isFetchingSaved, setIsFetchingSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsFetchingSaved(true);
    fetch("/api/templates")
      .then((res) => (res.ok ? res.json() : { templates: [] }))
      .then((data) => {
        if (!cancelled) setSavedTemplates(data.templates || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsFetchingSaved(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleDeleteSaved = useCallback(async (templateId: string) => {
    try {
      const res = await fetch(`/api/templates/${templateId}`, { method: "DELETE" });
      if (res.ok) {
        setSavedTemplates((prev) => prev.filter((t) => t.id !== templateId));
      }
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  }, []);

  const filteredStarter = filter === "saved"
    ? []
    : filter === "all"
      ? STARTER_TEMPLATES
      : STARTER_TEMPLATES.filter((t) => t.category === filter);

  const filteredSaved = filter === "slides" || filter === "report"
    ? []
    : savedTemplates;

  const totalCount = filteredStarter.length + filteredSaved.length;
  const activeLabel = FILTERS.find((f) => f.value === filter)?.label ?? "All";

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/70 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Start From Templates</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalCount} templates · {activeLabel}
          </p>
        </div>
        <div className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-card p-1 shadow-sm">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.value
                  ? "bg-foreground text-background shadow-sm"
                  : "text-foreground/70 hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              {f.label}
              {f.value === "saved" && savedTemplates.length > 0 && (
                <span className="ml-1 text-[10px] opacity-70">({savedTemplates.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 pt-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Saved templates first when showing all or "My Templates" */}
          {filteredSaved.map((template) => (
            <SavedTemplateCard
              key={template.id}
              template={template}
              onSelect={onSelect}
              onDelete={handleDeleteSaved}
            />
          ))}
          {filteredStarter.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={onSelect}
            />
          ))}
        </div>
        {totalCount === 0 && !isFetchingSaved && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">No templates found</p>
          </div>
        )}
        {isFetchingSaved && savedTemplates.length === 0 && filter === "saved" && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
