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
import type { BrandProfile, Template } from "@/types/database";

export interface ThemeSelection {
  // Full theme mode: same source for style and layout
  theme: BrandProfile | null;
  // Mix & match mode
  styleSource: BrandProfile | null;
  layoutSource: { type: "brand" | "template"; id: string; name: string } | null;
  mode: "full" | "mix";
}

interface ThemeSelectorProps {
  selection: ThemeSelection;
  onSelectionChange: (selection: ThemeSelection) => void;
}

export function ThemeSelector({
  selection,
  onSelectionChange,
}: ThemeSelectorProps) {
  const [themes, setThemes] = useState<BrandProfile[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"full" | "mix">(selection.mode);

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
        // Auto-select default theme if none selected
        if (!selection.theme && selection.mode === "full") {
          const defaultTheme = data.brands?.find((b: BrandProfile) => b.is_default);
          if (defaultTheme) {
            onSelectionChange({ ...selection, theme: defaultTheme });
          }
        }
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
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

  const handleSelectFullTheme = (theme: BrandProfile) => {
    onSelectionChange({
      theme,
      styleSource: null,
      layoutSource: null,
      mode: "full",
    });
    setIsDialogOpen(false);
  };

  const handleSelectStyleSource = (theme: BrandProfile) => {
    onSelectionChange({
      ...selection,
      styleSource: theme,
      mode: "mix",
    });
  };

  const handleSelectLayoutSource = (source: { type: "brand" | "template"; id: string; name: string }) => {
    onSelectionChange({
      ...selection,
      layoutSource: source,
      mode: "mix",
    });
  };

  const handleClear = () => {
    onSelectionChange({
      theme: null,
      styleSource: null,
      layoutSource: null,
      mode: "full",
    });
    setIsDialogOpen(false);
  };

  const getButtonLabel = () => {
    if (selection.mode === "full" && selection.theme) {
      return selection.theme.name;
    }
    if (selection.mode === "mix") {
      const parts = [];
      if (selection.styleSource) parts.push(`Style: ${selection.styleSource.name}`);
      if (selection.layoutSource) parts.push(`Layout: ${selection.layoutSource.name}`);
      if (parts.length > 0) return parts.join(" | ");
    }
    return null;
  };

  const hasSelection = selection.theme || selection.styleSource || selection.layoutSource;

  // Filter themes that have layout data for layout selection
  const themesWithLayout = themes.filter((t) => t.styles?.layoutHtml);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        title="Select theme"
        onClick={() => setIsDialogOpen(true)}
      >
        {hasSelection ? (
          <div className="flex items-center gap-2">
            {selection.mode === "full" && selection.theme && (
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
            <span className="max-w-[120px] truncate">{getButtonLabel()}</span>
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
            Theme
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        )}
      </Button>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Choose Theme</DialogTitle>
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
                onClick={() => setActiveTab("full")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "full"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Full Theme
              </button>
              <button
                onClick={() => setActiveTab("mix")}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "mix"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mix & Match
              </button>
            </div>

            {hasSelection && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={handleClear} className="h-6 text-xs">
                  Clear Selection
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : activeTab === "full" ? (
              /* Full Theme Tab */
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
                        selection.mode === "full" && selection.theme?.id === theme.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleSelectFullTheme(theme)}
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
                      {selection.mode === "full" && selection.theme?.id === theme.id && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              /* Mix & Match Tab */
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {/* Style Source */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Style (colors & fonts)</p>
                  <div className="space-y-2">
                    {themes.map((theme) => (
                      <div
                        key={theme.id}
                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                          selection.styleSource?.id === theme.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleSelectStyleSource(theme)}
                      >
                        <div className="flex gap-1">
                          {(theme.colors || []).slice(0, 4).map((color, i) => (
                            <div key={i} className="w-4 h-4 rounded-sm border border-border" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <span className="text-sm font-medium truncate flex-1">{theme.name}</span>
                        {selection.styleSource?.id === theme.id && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary shrink-0">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Layout Source */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Layout (structure)</p>
                  <div className="space-y-2">
                    {themesWithLayout.length === 0 && templates.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No layouts available</p>
                    ) : (
                      <>
                        {themesWithLayout.map((theme) => (
                          <div
                            key={theme.id}
                            className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                              selection.layoutSource?.id === theme.id && selection.layoutSource?.type === "brand"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => handleSelectLayoutSource({ type: "brand", id: theme.id, name: theme.name })}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground shrink-0">
                              <rect x="3" y="3" width="7" height="7" />
                              <rect x="14" y="3" width="7" height="7" />
                              <rect x="14" y="14" width="7" height="7" />
                              <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            <span className="text-sm font-medium truncate flex-1">{theme.name}</span>
                            {selection.layoutSource?.id === theme.id && selection.layoutSource?.type === "brand" && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary shrink-0">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        ))}
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                              selection.layoutSource?.id === template.id && selection.layoutSource?.type === "template"
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => handleSelectLayoutSource({ type: "template", id: template.id, name: template.name })}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground shrink-0">
                              <rect x="3" y="3" width="18" height="18" rx="2" />
                              <path d="M3 9h18" />
                              <path d="M9 21V9" />
                            </svg>
                            <span className="text-sm font-medium truncate flex-1">{template.name}</span>
                            {selection.layoutSource?.id === template.id && selection.layoutSource?.type === "template" && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary shrink-0">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
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
