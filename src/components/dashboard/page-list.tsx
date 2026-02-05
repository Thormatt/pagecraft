"use client";

import { PageCard } from "./page-card";
import type { Page } from "@/types";

interface PageListProps {
  pages: Page[];
}

export function PageList({ pages }: PageListProps) {
  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <svg className="h-12 w-12 text-muted-foreground/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <h3 className="mt-4 font-medium">No pages yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate your first page to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pages.map((page) => (
        <PageCard key={page.id} page={page} />
      ))}
    </div>
  );
}
