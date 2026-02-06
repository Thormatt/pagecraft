"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { STARTER_TEMPLATES, type StarterTemplate } from "@/data/starter-templates";
import type { BrandProfile, Template } from "@/types/database";

export interface LayoutSelection {
  type: "starter" | "saved";
  id: string;
  name: string;
  html?: string;
}

export interface ThemeSelection {
  theme: BrandProfile | null;
  layout: LayoutSelection | null;
}

interface ThemeSelectorProps {
  selection: ThemeSelection;
  onSelectionChange: (selection: ThemeSelection) => void;
}

function LayoutPreview({ template }: { template: StarterTemplate }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(template.html);
    doc.close();
  }, [template.html]);

  const isSlides = template.category === "slides";
  const iframeW = 1280;
  const iframeH = isSlides ? 720 : 900;
  const scale = 0.15;

  return (
    <div
      className="relative w-full overflow-hidden bg-muted rounded"
      style={{ height: isSlides ? 108 : 135 }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: iframeW, height: iframeH, transform: `scale(${scale})` }}
      >
        <iframe
          ref={iframeRef}
          className="border-0 pointer-events-none"
          style={{ width: iframeW, height: iframeH }}
          title={template.name}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}

export function ThemeSelector({
  selection,
  onSelectionChange,
}: ThemeSelectorProps) {
  const [themes, setThemes] = useState<BrandProfile[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"theme" | "layout">("theme");
  const [layoutFilter, setLayoutFilter] = useState<"all" | "slides" | "report">("all");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [brandsRes, templatesRes] = await Promise.all([
        fetch("/api/brands"),
        fetch("/api/templates"),
      ]);

      if (brandsRes.ok) {
        const data = await brandsRes.json();
        setThemes(data.brands || []);
        if (!selection.theme) {
          const defaultTheme = data.brands?.find((b: BrandProfile) => b.is_default);
          if (defaultTheme) {
            onSelectionChange({ ...selection, theme: defaultTheme });
          }
        }
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setSavedTemplates(data.templates || []);
      }
    } catch (err) {
      console.error("Failed to fetch themes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selection, onSelectionChange]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      fetchData();
    }
  }, [isDialogOpen]);

  const handleSelectTheme = (theme: BrandProfile) => {
    onSelectionChange({ ...selection, theme });
  };

  const handleSelectStarterLayout = (template: StarterTemplate) => {
    onSelectionChange({
      ...selection,
      layout: { type: "starter", id: template.id, name: template.name, html: template.html },
    });
  };

  const handleSelectSavedLayout = (template: Template) => {
    onSelectionChange({
      ...selection,
      layout: { type: "saved", id: template.id, name: template.name },
    });
  };

  const handleClearTheme = () => {
    onSelectionChange({ ...selection, theme: null });
  };

  const handleClearLayout = () => {
    onSelectionChange({ ...selection, layout: null });
  };

  const getButtonLabel = () => {
    const parts: string[] = [];
    if (selection.theme) parts.push(selection.theme.name);
    if (selection.layout) parts.push(selection.layout.name);
    if (parts.length > 0) return parts.join(" + ");
    return null;
  };

  const hasSelection = selection.theme || selection.layout;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        title="Select theme & layout"
        onClick={() => setIsDialogOpen(true)}
      >
        {hasSelection ? (
          <div className="flex items-center gap-2">
            {selection.theme && (
              <div className="flex gap-0.5">
                {(selection.theme.colors || []).slice(0, 3).map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
            <span className="max-w-[160px] truncate">{getButtonLabel()}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        ) : (
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
            </svg>
            Theme & Layout
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        )}
      </Button>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} className="w-[560px] max-w-[90vw]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Theme & Layout</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsDialogOpen(false)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
          </div>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            {/* Tab switcher */}
            <div className="flex rounded-lg border p-1">
              <button
                onClick={() => setActiveTab("theme")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "theme"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Theme
              </button>
              <button
                onClick={() => setActiveTab("layout")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "layout"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Layout
              </button>
            </div>

            {/* Current selections summary */}
            {hasSelection && (
              <div className="flex flex-wrap gap-2">
                {selection.theme && (
                  <div className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
                    <div className="flex gap-0.5">
                      {(selection.theme.colors || []).slice(0, 2).map((color, i) => (
                        <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <span className="font-medium">{selection.theme.name}</span>
                    <button onClick={handleClearTheme} className="ml-0.5 text-muted-foreground hover:text-foreground">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}
                {selection.layout && (
                  <div className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
                    </svg>
                    <span className="font-medium">{selection.layout.name}</span>
                    <button onClick={handleClearLayout} className="ml-0.5 text-muted-foreground hover:text-foreground">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "theme" ? (
              /* Theme Tab — color palettes & fonts */
              isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {themes.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm text-muted-foreground mb-2">No themes yet</p>
                      <Link href="/themes" className="text-sm text-primary hover:underline">
                        Create your first theme
                      </Link>
                    </div>
                  ) : (
                    themes.map((theme) => (
                      <div
                        key={theme.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selection.theme?.id === theme.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleSelectTheme(theme)}
                      >
                        {theme.screenshot ? (
                          <img src={theme.screenshot} alt={theme.name} className="w-16 h-12 rounded object-cover border" />
                        ) : (
                          <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <circle cx="8.5" cy="8.5" r="1.5" />
                              <path d="m21 15-5-5L5 21" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{theme.name}</p>
                            {theme.is_default && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 rounded">Default</span>
                            )}
                          </div>
                          <div className="flex gap-1 mt-1">
                            {(theme.colors || []).slice(0, 5).map((color, i) => (
                              <div key={i} className="w-4 h-4 rounded-sm border border-border" style={{ backgroundColor: color }} />
                            ))}
                          </div>
                        </div>
                        {selection.theme?.id === theme.id && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )
            ) : (
              /* Layout Tab */
              <div className="space-y-3">
                {/* Category filter */}
                <div className="flex gap-1.5">
                  {(["all", "slides", "report"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setLayoutFilter(f)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        layoutFilter === f
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f === "all" ? "All" : f === "slides" ? "Slides" : "Reports"}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-[380px] overflow-y-auto">
                  {STARTER_TEMPLATES
                    .filter((t) => layoutFilter === "all" || t.category === layoutFilter)
                    .map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleSelectStarterLayout(template)}
                        className={`group relative flex flex-col overflow-hidden rounded-xl text-left transition-all ${
                          selection.layout?.id === template.id
                            ? "ring-2 ring-primary shadow-sm"
                            : "ring-1 ring-border hover:ring-primary/40 hover:shadow-sm"
                        }`}
                      >
                        <div className="relative">
                          <LayoutPreview template={template} />
                          {/* Category badge overlaid on preview */}
                          <span className={`absolute top-1.5 left-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-sm ${
                            template.category === "slides"
                              ? "bg-indigo-500/90 text-white"
                              : "bg-emerald-500/90 text-white"
                          }`}>
                            {template.category === "slides" ? "Slides" : "Report"}
                          </span>
                          {/* Selected checkmark */}
                          {selection.layout?.id === template.id && (
                            <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="px-2.5 py-2">
                          <span className="text-xs font-medium leading-tight line-clamp-1">{template.name}</span>
                        </div>
                      </button>
                    ))}

                  {/* Saved templates as cards */}
                  {savedTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectSavedLayout(template)}
                      className={`group relative flex flex-col overflow-hidden rounded-xl text-left transition-all ${
                        selection.layout?.id === template.id
                          ? "ring-2 ring-primary shadow-sm"
                          : "ring-1 ring-border hover:ring-primary/40 hover:shadow-sm"
                      }`}
                    >
                      <div className="relative h-24 bg-muted flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                        <span className="absolute top-1.5 left-1.5 rounded-md bg-muted-foreground/20 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                          Saved
                        </span>
                        {selection.layout?.id === template.id && (
                          <div className="absolute top-1.5 right-1.5 bg-primary text-primary-foreground rounded-full p-0.5">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="px-2.5 py-2">
                        <span className="text-xs font-medium leading-tight line-clamp-1">{template.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <Link
                href="/themes"
                className="flex items-center gap-2 w-full p-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                onClick={() => setIsDialogOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Manage Themes
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
