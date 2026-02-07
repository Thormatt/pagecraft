"use client";

import { Button } from "@/components/ui/button";
import { ImageCard, ImageCardSkeleton } from "./image-card";
import { LAYOUT_DIRECTIONS, type LayoutOption } from "@/types/moodboard";

interface StepLayoutsProps {
  layouts: LayoutOption[];
  selectedLayout: LayoutOption | null;
  onSelectLayout: (layout: LayoutOption) => void;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
  loadingProgress: { completed: number; total: number };
}

export function StepLayouts({
  layouts,
  selectedLayout,
  onSelectLayout,
  onBack,
  onNext,
  isLoading,
  loadingProgress,
}: StepLayoutsProps) {
  const isGenerating = isLoading && layouts.length < LAYOUT_DIRECTIONS.length;

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="rounded-md p-1 hover:bg-muted transition-colors"
            disabled={isLoading}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-semibold">Choose a Layout</h2>
            <p className="text-sm text-muted-foreground">
              {isGenerating
                ? `Generating layouts... (${loadingProgress.completed}/${loadingProgress.total})`
                : "Select the layout structure that fits your vision"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Show loaded layouts */}
          {layouts.map((layout) => (
            <ImageCard
              key={layout.id}
              imageUrl={layout.imageUrl}
              name={layout.name}
              description={layout.description}
              isSelected={selectedLayout?.id === layout.id}
              onClick={() => onSelectLayout(layout)}
              isLoading={isLoading}
            />
          ))}

          {/* Show skeletons for layouts still loading */}
          {isGenerating &&
            LAYOUT_DIRECTIONS.slice(layouts.length).map((direction) => (
              <ImageCardSkeleton
                key={direction.id}
                name={direction.name}
                description={direction.description}
              />
            ))}
        </div>
      </div>

      <div className="p-4 border-t">
        <Button
          onClick={onNext}
          disabled={!selectedLayout || isLoading}
          className="w-full"
        >
          {isLoading && !isGenerating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating Concepts...
            </>
          ) : (
            <>
              Continue with {selectedLayout?.name || "Selected Layout"}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
