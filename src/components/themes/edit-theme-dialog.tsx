"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { BrandProfile } from "@/types/database";

interface EditThemeDialogProps {
  theme: BrandProfile;
  onClose: () => void;
  onThemeUpdated: (theme: BrandProfile) => void;
  onThemeDeleted: (themeId: string) => void;
}

export function EditThemeDialog({
  theme,
  onClose,
  onThemeUpdated,
  onThemeDeleted,
}: EditThemeDialogProps) {
  const [name, setName] = useState(theme.name);
  const [isDefault, setIsDefault] = useState(theme.is_default);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasChanges = name !== theme.name || isDefault !== theme.is_default;

  const handleSave = async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/brands/${theme.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, is_default: isDefault }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update theme");
      }

      const data = await res.json();
      onThemeUpdated(data.brand);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this theme?")) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/brands/${theme.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete theme");
      }
      onThemeDeleted(theme.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>Edit Theme</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </div>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          {/* Screenshot preview */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {theme.screenshot ? (
              <img
                src={theme.screenshot}
                alt={theme.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-muted-foreground/50"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* Name input */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving || isDeleting}
            />
          </div>

          {/* Source URL */}
          {theme.source_url && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Source</label>
              <p className="text-sm text-muted-foreground">
                {theme.source_url}
              </p>
            </div>
          )}

          {/* Colors */}
          {theme.colors && theme.colors.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Colors</label>
              <div className="flex flex-wrap gap-2">
                {theme.colors.map((color, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-border"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-muted-foreground font-mono">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fonts */}
          {theme.fonts && theme.fonts.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Fonts</label>
              <div className="flex flex-wrap gap-2">
                {theme.fonts.map((font, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-muted rounded text-sm"
                  >
                    {font}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Default toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Set as Default</p>
              <p className="text-xs text-muted-foreground">
                Use this theme by default in new generations
              </p>
            </div>
            <button
              onClick={() => setIsDefault(!isDefault)}
              disabled={isSaving || isDeleting}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isDefault ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  isDefault ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || !name.trim() || isSaving || isDeleting}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
