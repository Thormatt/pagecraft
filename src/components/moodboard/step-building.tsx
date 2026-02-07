"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { LayoutOption, ConceptOption } from "@/types/moodboard";

interface StepBuildingProps {
  selectedLayout: LayoutOption;
  selectedConcept: ConceptOption;
  isLoading: boolean;
  error: string | null;
  onStartOver: () => void;
}

const BUILD_STAGES = [
  { message: "Analyzing your design...", detail: "Extracting colors, layout, and typography" },
  { message: "Reading text content...", detail: "Capturing headlines, copy, and navigation" },
  { message: "Building HTML structure...", detail: "Generating sections and components" },
  { message: "Applying styles...", detail: "Matching colors, fonts, and spacing" },
  { message: "Polishing details...", detail: "Fine-tuning the final output" },
];

export function StepBuilding({
  selectedLayout,
  selectedConcept,
  isLoading,
  error,
  onStartOver,
}: StepBuildingProps) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setStageIndex(0);
      return;
    }

    const timers = [
      setTimeout(() => setStageIndex(1), 6000),
      setTimeout(() => setStageIndex(2), 15000),
      setTimeout(() => setStageIndex(3), 25000),
      setTimeout(() => setStageIndex(4), 40000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  const stage = BUILD_STAGES[stageIndex];

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Building Your Page</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generating HTML from your selections
        </p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Reference image */}
        <div className="rounded-lg overflow-hidden border mb-4">
          <div className="aspect-video w-full bg-muted">
            <img
              src={selectedConcept.imageUrl}
              alt={selectedConcept.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50">
            Reference: {selectedConcept.name} &middot; {selectedLayout.name}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && !error && (
          <div className="space-y-4">
            {/* Stage progress */}
            <div className="space-y-2">
              {BUILD_STAGES.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-500 ${
                    i < stageIndex
                      ? "opacity-50"
                      : i === stageIndex
                        ? "bg-primary/10"
                        : "opacity-30"
                  }`}
                >
                  <div className="shrink-0">
                    {i < stageIndex ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : i === stageIndex ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${i === stageIndex ? "text-foreground" : ""}`}>
                      {s.message}
                    </p>
                    {i === stageIndex && (
                      <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${((stageIndex + 1) / BUILD_STAGES.length) * 90}%` }}
              />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium text-destructive">Build Failed</p>
              <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Success state */}
        {!isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <p className="font-medium">Page Generated!</p>
              <p className="text-sm text-muted-foreground">
                Check the preview panel on the right
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t">
        <Button
          onClick={onStartOver}
          variant="outline"
          className="w-full"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Start Over
        </Button>
      </div>
    </div>
  );
}
