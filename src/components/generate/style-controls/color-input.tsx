"use client";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function normalizeColor(value: string): string {
  if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)") {
    return "#000000";
  }
  if (value.startsWith("#")) return value;

  // Parse rgb/rgba strings to hex
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  return "#000000";
}

export function ColorInput({ label, value, onChange }: ColorInputProps) {
  const hex = normalizeColor(value);

  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <input
        type="color"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
      />
      <span className="flex-1">{label}</span>
      <input
        type="text"
        value={hex}
        onChange={(e) => {
          const v = e.target.value;
          if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
        }}
        className="w-20 rounded border border-border bg-input px-2 py-1 text-xs text-foreground font-mono"
        maxLength={7}
      />
    </label>
  );
}
