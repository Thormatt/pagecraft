"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ThemeCard } from "@/components/themes/theme-card";
import { ThemeRow } from "@/components/themes/theme-row";
import { ViewToggle } from "@/components/themes/view-toggle";
import { AddThemeDialog } from "@/components/themes/add-theme-dialog";
import { EditThemeDialog } from "@/components/themes/edit-theme-dialog";
import type { BrandProfile } from "@/types/database";

const VIEW_STORAGE_KEY = "themes-view";

export default function ThemesPage() {
  const [themes, setThemes] = useState<BrandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<BrandProfile | null>(null);

  useEffect(() => {
    try {
      const savedView = localStorage.getItem(VIEW_STORAGE_KEY);
      if (savedView === "grid" || savedView === "list") {
        setView(savedView);
      }
    } catch { /* localStorage unavailable */ }
  }, []);

  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView);
    try { localStorage.setItem(VIEW_STORAGE_KEY, newView); } catch { /* ignore */ }
  };

  const fetchThemes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/brands");
      if (res.ok) {
        const data = await res.json();
        setThemes(data.brands || []);
      }
    } catch (err) {
      console.error("Failed to fetch themes:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const handleThemeCreated = (theme: BrandProfile) => {
    setThemes((prev) => [theme, ...prev]);
    setIsAddDialogOpen(false);
  };

  const handleThemeUpdated = (theme: BrandProfile) => {
    setThemes((prev) =>
      prev.map((t) => {
        if (t.id === theme.id) return theme;
        if (theme.is_default && t.is_default) return { ...t, is_default: false };
        return t;
      })
    );
    setEditingTheme(null);
  };

  const handleThemeDeleted = (themeId: string) => {
    setThemes((prev) => prev.filter((t) => t.id !== themeId));
    setEditingTheme(null);
  };

  return (
    <div className="flex-1 p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Themes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your design themes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={handleViewChange} />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Add Theme
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : themes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">No themes yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Extract design themes from any website - includes colors, fonts, and layout structure.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            Add Your First Theme
          </Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {themes.map((theme) => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              onClick={() => setEditingTheme(theme)}
            />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left text-sm font-medium px-4 py-3">Name</th>
                <th className="text-left text-sm font-medium px-4 py-3">Source</th>
                <th className="text-left text-sm font-medium px-4 py-3">Colors</th>
                <th className="text-left text-sm font-medium px-4 py-3">Created</th>
                <th className="text-right text-sm font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {themes.map((theme) => (
                <ThemeRow
                  key={theme.id}
                  theme={theme}
                  onClick={() => setEditingTheme(theme)}
                  onDelete={handleThemeDeleted}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddThemeDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onThemeCreated={handleThemeCreated}
      />

      {editingTheme && (
        <EditThemeDialog
          theme={editingTheme}
          onClose={() => setEditingTheme(null)}
          onThemeUpdated={handleThemeUpdated}
          onThemeDeleted={handleThemeDeleted}
        />
      )}
    </div>
  );
}
