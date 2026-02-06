"use client";

import { ColorInput } from "./color-input";
import { NumericInput } from "./numeric-input";

interface BorderControlsProps {
  styles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
}

export function BorderControls({ styles, onStyleChange }: BorderControlsProps) {
  return (
    <div className="space-y-2">
      <NumericInput
        label="Border Radius"
        value={styles["border-radius"] || "0px"}
        onChange={(v) => onStyleChange("border-radius", v)}
      />
      <NumericInput
        label="Border Width"
        value={styles["border-width"] || "0px"}
        onChange={(v) => onStyleChange("border-width", v)}
      />
      <ColorInput
        label="Border Color"
        value={styles["border-color"] || "#000000"}
        onChange={(v) => onStyleChange("border-color", v)}
      />
    </div>
  );
}
