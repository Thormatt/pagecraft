"use client";

import { useState } from "react";

interface SectionHeaderProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SectionHeader({
  title,
  defaultOpen = true,
  children,
}: SectionHeaderProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
      >
        <span>{title}</span>
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 4.5L6 7.5L9 4.5" />
        </svg>
      </button>
      {open && <div className="px-3 pb-3 space-y-2">{children}</div>}
    </div>
  );
}
