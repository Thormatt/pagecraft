"use client";

import { cn } from "@/lib/utils";

interface ImageCardProps {
  imageUrl: string;
  name: string;
  description: string;
  isSelected: boolean;
  isLoading?: boolean;
  onClick: () => void;
}

export function ImageCard({
  imageUrl,
  name,
  description,
  isSelected,
  isLoading,
  onClick,
}: ImageCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "group relative overflow-hidden rounded-lg border-2 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected
          ? "border-primary ring-2 ring-primary ring-offset-2"
          : "border-border hover:border-muted-foreground",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        )}
      </div>
      <div className="p-3 text-left">
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
      {isSelected && (
        <div className="absolute right-2 top-2 rounded-full bg-primary p-1 text-primary-foreground">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </button>
  );
}

interface ImageCardSkeletonProps {
  name: string;
  description: string;
}

export function ImageCardSkeleton({ name, description }: ImageCardSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-lg border-2 border-border">
      <div className="aspect-video w-full bg-muted animate-pulse flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
}
