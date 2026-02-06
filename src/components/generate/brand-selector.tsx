"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { BrandProfile } from "@/types/database";

interface BrandSelectorProps {
  selectedBrand: BrandProfile | null;
  onBrandChange: (brand: BrandProfile | null) => void;
}

export function BrandSelector({
  selectedBrand,
  onBrandChange,
}: BrandSelectorProps) {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractUrl, setExtractUrl] = useState("");
  const [extractName, setExtractName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/brands");
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleExtract = async () => {
    if (!extractUrl.trim()) return;

    setIsExtracting(true);
    setError(null);

    try {
      const res = await fetch("/api/brands/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: extractUrl,
          name: extractName || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extract brand");
      }

      const data = await res.json();
      setBrands((prev) => [data.brand, ...prev]);
      onBrandChange(data.brand);
      setExtractUrl("");
      setExtractName("");
      setIsDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDelete = async (brandId: string) => {
    try {
      const res = await fetch(`/api/brands/${brandId}`, { method: "DELETE" });
      if (res.ok) {
        setBrands((prev) => prev.filter((b) => b.id !== brandId));
        if (selectedBrand?.id === brandId) {
          onBrandChange(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete brand:", err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        title="Select brand"
        onClick={() => setIsDialogOpen(true)}
      >
        {selectedBrand ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {(selectedBrand.colors || []).slice(0, 3).map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="max-w-[100px] truncate">
              {selectedBrand.name}
            </span>
          </div>
        ) : (
          <span className="flex items-center gap-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
              <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
              <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
              <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
            </svg>
            Brand
          </span>
        )}
      </Button>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>Brand Profiles</DialogTitle>
        </DialogHeader>
        <DialogContent>

          <div className="space-y-4">
            {/* Extract new brand */}
            <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium">Extract from URL</h4>
              <Input
                placeholder="https://example.com"
                value={extractUrl}
                onChange={(e) => setExtractUrl(e.target.value)}
                disabled={isExtracting}
              />
              <Input
                placeholder="Brand name (optional)"
                value={extractName}
                onChange={(e) => setExtractName(e.target.value)}
                disabled={isExtracting}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                onClick={handleExtract}
                disabled={isExtracting || !extractUrl.trim()}
                size="sm"
                className="w-full"
              >
                {isExtracting ? "Extracting..." : "Extract Brand"}
              </Button>
            </div>

            {/* Brand list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Your Brands</h4>
                {selectedBrand && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onBrandChange(null)}
                    className="h-6 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {isLoading ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Loading...
                </p>
              ) : brands.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No brand profiles yet. Extract one from a URL above.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedBrand?.id === brand.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        onBrandChange(brand);
                        setIsDialogOpen(false);
                      }}
                    >
                      {brand.screenshot ? (
                        <img
                          src={brand.screenshot}
                          alt={brand.name}
                          className="w-12 h-8 rounded object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-8 rounded bg-muted flex items-center justify-center">
                          <svg
                            width="16"
                            height="16"
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {brand.name}
                        </p>
                        <div className="flex gap-1 mt-1">
                          {(brand.colors || []).slice(0, 5).map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-sm border border-border"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(brand.id);
                        }}
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
