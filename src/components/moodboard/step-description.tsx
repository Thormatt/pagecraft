"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { WebsiteType } from "@/types/moodboard";

interface StepDescriptionProps {
  description: string;
  websiteType: WebsiteType;
  onDescriptionChange: (description: string) => void;
  onWebsiteTypeChange: (type: WebsiteType) => void;
  onNext: () => void;
  isLoading: boolean;
}

export function StepDescription({
  description,
  websiteType,
  onDescriptionChange,
  onWebsiteTypeChange,
  onNext,
  isLoading,
}: StepDescriptionProps) {
  const canProceed = description.trim().length >= 10;

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Describe Your Website</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us what kind of website you want to create
        </p>
      </div>

      <div className="flex-1 space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            What is your website about?
          </label>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="e.g., A landing page for a premium coffee subscription service. It should highlight the quality of beans, show subscription plans, and have a modern, sophisticated feel..."
            className="min-h-[120px] resize-none"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Be specific about your business, target audience, and desired tone
          </p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Website Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onWebsiteTypeChange("landing")}
              disabled={isLoading}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                websiteType === "landing"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="font-medium text-sm">Landing Page</div>
              <div className="text-xs text-muted-foreground mt-1">
                Single page with sections for conversion focus
              </div>
            </button>
            <button
              type="button"
              onClick={() => onWebsiteTypeChange("full")}
              disabled={isLoading}
              className={`rounded-lg border-2 p-4 text-left transition-all ${
                websiteType === "full"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <div className="font-medium text-sm">Full Website</div>
              <div className="text-xs text-muted-foreground mt-1">
                Multi-section homepage with more content
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t">
        <Button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating Layouts...
            </>
          ) : (
            <>
              Generate Layout Options
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
