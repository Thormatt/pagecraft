"use client";

import { Button } from "@/components/ui/button";
import { ImageCard, ImageCardSkeleton } from "./image-card";
import { CONCEPT_DIRECTIONS, type ConceptOption, type LayoutOption } from "@/types/moodboard";

interface StepConceptsProps {
  selectedLayout: LayoutOption;
  concepts: ConceptOption[];
  selectedConcept: ConceptOption | null;
  onSelectConcept: (concept: ConceptOption) => void;
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
  loadingProgress: { completed: number; total: number };
}

export function StepConcepts({
  selectedLayout,
  concepts,
  selectedConcept,
  onSelectConcept,
  onBack,
  onNext,
  isLoading,
  loadingProgress,
}: StepConceptsProps) {
  const isGenerating = isLoading && concepts.length < CONCEPT_DIRECTIONS.length;

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
            <h2 className="text-lg font-semibold">Choose a Style</h2>
            <p className="text-sm text-muted-foreground">
              {isGenerating
                ? `Generating concepts... (${loadingProgress.completed}/${loadingProgress.total})`
                : `Visual styles for your ${selectedLayout.name} layout`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Show loaded concepts */}
          {concepts.map((concept) => (
            <ImageCard
              key={concept.id}
              imageUrl={concept.imageUrl}
              name={concept.name}
              description={concept.description}
              isSelected={selectedConcept?.id === concept.id}
              onClick={() => onSelectConcept(concept)}
              isLoading={isLoading}
            />
          ))}

          {/* Show skeletons for concepts still loading */}
          {isGenerating &&
            CONCEPT_DIRECTIONS.slice(concepts.length).map((direction) => (
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
          disabled={!selectedConcept || isLoading}
          className="w-full"
        >
          {isLoading && !isGenerating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Building Your Page...
            </>
          ) : (
            <>
              Build with {selectedConcept?.name || "Selected Style"}
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
