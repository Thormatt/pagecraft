"use client";

import { ColorInput } from "./color-input";
import { NumericInput } from "./numeric-input";

const FONT_FAMILIES = [
  { label: "System Default", value: "system-ui, sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier", value: "'Courier New', monospace" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
];

const FONT_WEIGHTS = [
  { label: "Light", value: "300" },
  { label: "Normal", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "Extra Bold", value: "800" },
];

const TEXT_ALIGNMENTS = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Justify", value: "justify" },
];

interface TypographyControlsProps {
  styles: Record<string, string>;
  onStyleChange: (property: string, value: string) => void;
}

export function TypographyControls({ styles, onStyleChange }: TypographyControlsProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex-1">Font Family</span>
        <select
          value={styles["font-family"] || ""}
          onChange={(e) => onStyleChange("font-family", e.target.value)}
          className="w-32 rounded border border-border bg-input px-2 py-1 text-xs text-foreground"
        >
          <option value="">Inherited</option>
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <NumericInput
        label="Font Size"
        value={styles["font-size"] || "16px"}
        onChange={(v) => onStyleChange("font-size", v)}
        min={8}
        max={120}
      />

      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex-1">Weight</span>
        <select
          value={styles["font-weight"] || "400"}
          onChange={(e) => onStyleChange("font-weight", e.target.value)}
          className="w-32 rounded border border-border bg-input px-2 py-1 text-xs text-foreground"
        >
          {FONT_WEIGHTS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </label>

      <ColorInput
        label="Text Color"
        value={styles["color"] || "#000000"}
        onChange={(v) => onStyleChange("color", v)}
      />

      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="flex-1">Align</span>
        <div className="flex rounded border border-border overflow-hidden">
          {TEXT_ALIGNMENTS.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => onStyleChange("text-align", a.value)}
              className={`px-2 py-1 text-[10px] transition-colors ${
                styles["text-align"] === a.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-input text-muted-foreground hover:bg-muted"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </label>

      <NumericInput
        label="Line Height"
        value={styles["line-height"] || "1.5"}
        unit=""
        onChange={(v) => onStyleChange("line-height", v)}
        min={0.5}
        max={4}
        step={0.1}
      />
    </div>
  );
}
