"use client";

import { ColorInput } from "./color-input";

interface BackgroundControlsProps {
  styles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
}

export function BackgroundControls({ styles, onStyleChange }: BackgroundControlsProps) {
  return (
    <div className="space-y-2">
      <ColorInput
        label="Background Color"
        value={styles["background-color"] || "#ffffff"}
        onChange={(v) => onStyleChange("background-color", v)}
      />
    </div>
  );
}
