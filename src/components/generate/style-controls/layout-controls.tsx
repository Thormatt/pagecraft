"use client";

import { NumericInput } from "./numeric-input";

interface LayoutControlsProps {
  styles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
}

export function LayoutControls({ styles, onStyleChange }: LayoutControlsProps) {
  return (
    <div className="space-y-2">
      <NumericInput
        label="Padding Top"
        value={styles["padding-top"] || "0px"}
        onChange={(v) => onStyleChange("padding-top", v)}
      />
      <NumericInput
        label="Padding Right"
        value={styles["padding-right"] || "0px"}
        onChange={(v) => onStyleChange("padding-right", v)}
      />
      <NumericInput
        label="Padding Bottom"
        value={styles["padding-bottom"] || "0px"}
        onChange={(v) => onStyleChange("padding-bottom", v)}
      />
      <NumericInput
        label="Padding Left"
        value={styles["padding-left"] || "0px"}
        onChange={(v) => onStyleChange("padding-left", v)}
      />

      <div className="h-px bg-border my-1" />

      <NumericInput
        label="Margin Top"
        value={styles["margin-top"] || "0px"}
        onChange={(v) => onStyleChange("margin-top", v)}
      />
      <NumericInput
        label="Margin Right"
        value={styles["margin-right"] || "0px"}
        onChange={(v) => onStyleChange("margin-right", v)}
      />
      <NumericInput
        label="Margin Bottom"
        value={styles["margin-bottom"] || "0px"}
        onChange={(v) => onStyleChange("margin-bottom", v)}
      />
      <NumericInput
        label="Margin Left"
        value={styles["margin-left"] || "0px"}
        onChange={(v) => onStyleChange("margin-left", v)}
      />
    </div>
  );
}
