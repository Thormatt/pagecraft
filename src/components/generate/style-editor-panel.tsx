"use client";

import { useMemo } from "react";
import { SectionHeader } from "./style-controls/section-header";
import { ColorInput } from "./style-controls/color-input";
import { NumericInput } from "./style-controls/numeric-input";
import { TypographyControls } from "./style-controls/typography-controls";
import { LayoutControls } from "./style-controls/layout-controls";
import { BackgroundControls } from "./style-controls/background-controls";
import { BorderControls } from "./style-controls/border-controls";
import { getPageSections, getPageStyles } from "@/lib/style-editor/html-mutator";
import type { ElementInfo, PageSection } from "@/types/style-editor";

const FONT_FAMILIES = [
  { label: "System Default", value: "system-ui, sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Courier", value: "'Courier New', monospace" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
];

interface StyleEditorPanelProps {
  html: string;
  selectedElement: ElementInfo | null;
  onStyleChange: (cssPath: string, property: string, value: string) => void;
  onSelectElement: (cssPath: string) => void;
  onClearSelection: () => void;
}

function SectionTreeItem({
  section,
  selectedCssPath,
  onSelect,
}: {
  section: PageSection;
  selectedCssPath: string | null;
  onSelect: (cssPath: string) => void;
}) {
  const isSelected = selectedCssPath === section.cssPath;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(section.cssPath)}
        className={`w-full text-left px-2 py-1 text-xs rounded transition-colors truncate ${
          isSelected
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
        style={{ paddingLeft: `${section.depth * 12 + 8}px` }}
        title={section.label}
      >
        <span className="text-[10px] text-muted-foreground mr-1.5">
          {"<"}{section.tagName}{">"}
        </span>
        {section.label !== section.tagName ? section.label.replace(`${section.tagName}: `, "").replace(`${section.tagName}.`, ".").replace(`${section.tagName}#`, "#") : ""}
      </button>
      {section.children.map((child) => (
        <SectionTreeItem
          key={child.cssPath}
          section={child}
          selectedCssPath={selectedCssPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

export function StyleEditorPanel({
  html,
  selectedElement,
  onStyleChange,
  onSelectElement,
  onClearSelection,
}: StyleEditorPanelProps) {
  const pageStyles = useMemo(() => getPageStyles(html), [html]);
  const sections = useMemo(() => getPageSections(html), [html]);

  const handlePageStyleChange = (property: string, value: string) => {
    onStyleChange("body", property, value);
  };

  const handleElementStyleChange = (property: string, value: string) => {
    if (!selectedElement) return;
    onStyleChange(selectedElement.cssPath, property, value);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden border-r bg-background">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="text-xs font-semibold text-foreground">Style Editor</h2>
        {selectedElement && (
          <button
            type="button"
            onClick={onClearSelection}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {/* Page-level styles */}
        <SectionHeader title="Page Styles" defaultOpen>
          <ColorInput
            label="Background"
            value={pageStyles["background-color"] || "#ffffff"}
            onChange={(v) => handlePageStyleChange("background-color", v)}
          />
          <ColorInput
            label="Text Color"
            value={pageStyles["color"] || "#000000"}
            onChange={(v) => handlePageStyleChange("color", v)}
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex-1">Font Family</span>
            <select
              value={pageStyles["font-family"] || ""}
              onChange={(e) => handlePageStyleChange("font-family", e.target.value)}
              className="w-32 rounded border border-border bg-input px-2 py-1 text-xs text-foreground"
            >
              <option value="">Default</option>
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <NumericInput
            label="Font Size"
            value={pageStyles["font-size"] || "16px"}
            onChange={(v) => handlePageStyleChange("font-size", v)}
            min={10}
            max={32}
          />
        </SectionHeader>

        {/* Section navigator */}
        <SectionHeader title="Page Sections" defaultOpen>
          {sections.length > 0 ? (
            <div className="space-y-0.5">
              {sections.map((section) => (
                <SectionTreeItem
                  key={section.cssPath}
                  section={section}
                  selectedCssPath={selectedElement?.cssPath ?? null}
                  onSelect={onSelectElement}
                />
              ))}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground">
              No semantic sections found
            </p>
          )}
        </SectionHeader>

        {/* Selected element controls */}
        {selectedElement && (
          <>
            <div className="border-b border-border px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  {"<"}{selectedElement.tagName}{">"}
                </span>
                <span className="text-xs text-foreground truncate">
                  {selectedElement.textContent.slice(0, 40)}
                  {selectedElement.textContent.length > 40 ? "..." : ""}
                </span>
              </div>
            </div>

            <SectionHeader title="Typography" defaultOpen>
              <TypographyControls
                styles={selectedElement.styles}
                onStyleChange={handleElementStyleChange}
              />
            </SectionHeader>

            <SectionHeader title="Background" defaultOpen>
              <BackgroundControls
                styles={selectedElement.styles}
                onStyleChange={handleElementStyleChange}
              />
            </SectionHeader>

            <SectionHeader title="Layout" defaultOpen={false}>
              <LayoutControls
                styles={selectedElement.styles}
                onStyleChange={handleElementStyleChange}
              />
            </SectionHeader>

            <SectionHeader title="Border" defaultOpen={false}>
              <BorderControls
                styles={selectedElement.styles}
                onStyleChange={handleElementStyleChange}
              />
            </SectionHeader>
          </>
        )}
      </div>
    </div>
  );
}
