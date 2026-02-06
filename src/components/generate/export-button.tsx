"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  html: string;
  title?: string;
  disabled?: boolean;
}

type ExportFormat = "a4" | "letter" | "landscape";

export function ExportButton({ html, title = "page", disabled }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const exportToPdf = async (format: ExportFormat) => {
    if (!html || isExporting) return;

    setIsExporting(true);
    setShowMenu(false);

    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, title, format }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      // Get the PDF blob and trigger download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert(error instanceof Error ? error.message : "Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions: { format: ExportFormat; label: string }[] = [
    { format: "a4", label: "PDF (A4 Portrait)" },
    { format: "letter", label: "PDF (Letter)" },
    { format: "landscape", label: "PDF (Landscape)" },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isExporting || !html}
        onClick={() => setShowMenu(!showMenu)}
        className="gap-2"
      >
        {isExporting ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
            <svg className="h-3 w-3 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </>
        )}
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-md border border-border bg-background p-1 shadow-md">
          {formatOptions.map(({ format, label }) => (
            <button
              key={format}
              onClick={() => exportToPdf(format)}
              className="flex w-full items-center rounded-sm px-3 py-2 text-sm hover:bg-muted text-left"
              disabled={isExporting}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
