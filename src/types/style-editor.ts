export interface ElementInfo {
  cssPath: string;
  tagName: string;
  textContent: string;
  styles: Record<string, string>;
  attributes?: Record<string, string>;
}

export interface HoverInfo {
  cssPath: string;
  tagName: string;
  rect: { top: number; left: number; width: number; height: number };
}

export interface PageSection {
  cssPath: string;
  tagName: string;
  label: string;
  depth: number;
  children: PageSection[];
}

export interface StyleChange {
  cssPath: string;
  property: string;
  value: string;
}

export interface LayoutSection {
  tag: string;
  role: string;
  layout: string;
  childCount: number;
  hasImage?: boolean;
}

export interface LayoutMap {
  sections: LayoutSection[];
  patterns: Record<string, string>;
}

export interface LayoutSource {
  type: "brand" | "template";
  id: string;
  name: string;
  screenshot: string | null;
  thumbnail?: string | null;
}
