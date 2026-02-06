"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BrandProfile } from "@/types/database";

interface ThemeRowProps {
  theme: BrandProfile;
  onClick: () => void;
  onDelete: (themeId: string) => void;
}

export function ThemeRow({ theme, onClick, onDelete }: ThemeRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this theme?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/brands/${theme.id}`, { method: "DELETE" });
      if (res.ok) {
        onDelete(theme.id);
      }
    } catch (err) {
      console.error("Failed to delete theme:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <tr
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {theme.screenshot ? (
            <img
              src={theme.screenshot}
              alt={theme.name}
              className="w-10 h-7 rounded object-cover border"
            />
          ) : (
            <div className="w-10 h-7 rounded bg-muted flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{theme.name}</span>
            {theme.is_default && (
              <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded">
                Default
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {theme.source_url ? getHostname(theme.source_url) : "—"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          {(theme.colors || []).slice(0, 5).map((color, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-sm border border-border"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          {(theme.colors || []).length > 5 && (
            <div className="w-5 h-5 rounded-sm bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
              +{(theme.colors || []).length - 5}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-muted-foreground">
          {formatDate(theme.created_at)}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </Button>
      </td>
    </tr>
  );
}
