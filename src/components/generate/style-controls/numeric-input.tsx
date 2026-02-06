"use client";

interface NumericInputProps {
  label: string;
  value: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: string) => void;
}

function parseNumericValue(value: string): { num: number; unit: string } {
  const match = value.match(/^([\d.]+)\s*(px|em|rem|%|pt|vh|vw)?$/);
  if (match) {
    return { num: parseFloat(match[1]), unit: match[2] || "px" };
  }
  return { num: 0, unit: "px" };
}

export function NumericInput({
  label,
  value,
  unit,
  min = 0,
  max = 999,
  step = 1,
  onChange,
}: NumericInputProps) {
  const parsed = parseNumericValue(value);
  const currentUnit = unit || parsed.unit;

  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="flex-1">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={parsed.num}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const num = parseFloat(e.target.value);
            if (Number.isFinite(num)) {
              onChange(`${num}${currentUnit}`);
            }
          }}
          className="w-16 rounded border border-border bg-input px-2 py-1 text-xs text-foreground text-right"
        />
        <span className="text-[10px] w-6 text-muted-foreground">{currentUnit}</span>
      </div>
    </label>
  );
}
