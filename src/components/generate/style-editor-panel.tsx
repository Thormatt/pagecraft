"use client";

import { useMemo, useState } from "react";
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

const CONTAINER_TAGS = new Set([
  "div", "section", "article", "main", "aside", "header", "footer", "nav", "form",
]);

const INSERT_OPTIONS = [
  { label: "Heading", html: '<h2 style="margin:0">New Heading</h2>' },
  { label: "Text", html: "<p>New text paragraph. Double-click to edit.</p>" },
  { label: "Link", html: '<a href="#" style="color:inherit">Link text</a>' },
  { label: "Image", html: '<img src="https://placehold.co/600x400" alt="Placeholder" style="max-width:100%;height:auto" />' },
  { label: "Button", html: '<a href="#" style="display:inline-block;padding:10px 24px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">Button</a>' },
  { label: "Divider", html: '<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0" />' },
];

interface StyleEditorPanelProps {
  html: string;
  selectedElement: ElementInfo | null;
  onStyleChange: (cssPath: string, property: string, value: string) => void;
  onAttributeChange?: (cssPath: string, attribute: string, value: string) => void;
  onAiEdit?: (cssPath: string, instruction: string) => Promise<void>;
  onInsertElement?: (parentCssPath: string, childHtml: string) => void;
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

function AiEditInput({
  cssPath,
  onSubmit,
}: {
  cssPath: string;
  onSubmit: (cssPath: string, instruction: string) => Promise<void>;
}) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = instruction.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    try {
      await onSubmit(cssPath, trimmed);
      setInstruction("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-b border-border px-3 py-2">
      <label className="text-[10px] font-medium text-muted-foreground mb-1 block">
        AI Edit
      </label>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="e.g. make border pink gradient"
          disabled={loading}
          className="flex-1 rounded border border-border bg-input px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground/50 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!instruction.trim() || loading}
          className="shrink-0 rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? (
            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function StyleEditorPanel({
  html,
  selectedElement,
  onStyleChange,
  onAttributeChange,
  onAiEdit,
  onInsertElement,
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

            {onAiEdit && <AiEditInput cssPath={selectedElement.cssPath} onSubmit={onAiEdit} />}

            {onInsertElement && CONTAINER_TAGS.has(selectedElement.tagName) && (
              <div className="border-b border-border px-3 py-2">
                <label className="text-[10px] font-medium text-muted-foreground mb-1.5 block">
                  Insert Element
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {INSERT_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => onInsertElement(selectedElement.cssPath, opt.html)}
                      className="rounded border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            {/* Link attributes for <a> elements */}
            {selectedElement.tagName === "a" && selectedElement.attributes && (
              <SectionHeader title="Link" defaultOpen>
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span>URL (href)</span>
                  <input
                    type="text"
                    value={selectedElement.attributes.href || ""}
                    onChange={(e) => onAttributeChange?.(selectedElement.cssPath, "href", e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded border border-border bg-input px-2 py-1 text-xs text-foreground"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex-1">Target</span>
                  <select
                    value={selectedElement.attributes.target || ""}
                    onChange={(e) => onAttributeChange?.(selectedElement.cssPath, "target", e.target.value)}
                    className="w-32 rounded border border-border bg-input px-2 py-1 text-xs text-foreground"
                  >
                    <option value="">Same tab</option>
                    <option value="_blank">New tab</option>
                  </select>
                </label>
              </SectionHeader>
            )}

            {/* Image attributes for <img> elements */}
            {selectedElement.tagName === "img" && selectedElement.attributes && (
              <SectionHeader title="Image" defaultOpen>
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span>Source (src)</span>
                  <input
                    type="text"
                    value={selectedElement.attributes.src || ""}
                    onChange={(e) => onAttributeChange?.(selectedElement.cssPath, "src", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded border border-border bg-input px-2 py-1 text-xs text-foreground"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  <span>Alt text</span>
                  <input
                    type="text"
                    value={selectedElement.attributes.alt || ""}
                    onChange={(e) => onAttributeChange?.(selectedElement.cssPath, "alt", e.target.value)}
                    placeholder="Describe the image"
                    className="w-full rounded border border-border bg-input px-2 py-1 text-xs text-foreground"
                  />
                </label>
              </SectionHeader>
            )}
          </>
        )}
      </div>
    </div>
  );
}
