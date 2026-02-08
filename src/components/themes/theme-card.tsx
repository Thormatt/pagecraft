"use client";

import type { BrandProfile } from "@/types/database";

interface ThemeCardProps {
  theme: BrandProfile;
  onClick: () => void;
}

export function ThemeCard({ theme, onClick }: ThemeCardProps) {
  return (
    <div
      className="group border border-border/50 rounded-2xl overflow-hidden cursor-pointer card-glow"
      onClick={onClick}
    >
      {/* Screenshot / Placeholder */}
      <div className="aspect-video bg-muted relative">
        {theme.screenshot ? (
          <img
            src={theme.screenshot}
            alt={theme.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground/50"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        {theme.is_default && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            Default
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">{theme.name}</h3>
        {theme.source_url && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {(() => { try { return new URL(theme.source_url).hostname; } catch { return theme.source_url; } })()}
          </p>
        )}

        {/* Color swatches */}
        <div className="flex gap-1 mt-2">
          {(theme.colors || []).slice(0, 6).map((color, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border border-border"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          {(theme.colors || []).length > 6 && (
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
              +{(theme.colors || []).length - 6}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
