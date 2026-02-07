import type { IconStyle, ImageMode } from "@/lib/ai/prompt";

export type WebsiteType = "landing" | "full";

export interface LayoutOption {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface ConceptOption {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface LayoutAnalysis {
  sections: string[];
  patterns: string;
}

export interface ConceptAnalysis {
  colors: string[];
  fonts: string[];
  mood: string;
}

export type MoodboardStep = "description" | "layouts" | "concepts" | "building";

export interface MoodboardState {
  step: MoodboardStep;
  description: string;
  websiteType: WebsiteType;
  layouts: LayoutOption[];
  selectedLayout: LayoutOption | null;
  concepts: ConceptOption[];
  selectedConcept: ConceptOption | null;
  iconStyle: IconStyle;
  imageMode: ImageMode;
  isLoading: boolean;
  error: string | null;
}

// API request/response types
export interface LayoutsRequest {
  description: string;
  websiteType: WebsiteType;
}

export interface ConceptsRequest {
  description: string;
  websiteType: WebsiteType;
  selectedLayout: LayoutOption;
}

export interface BuildRequest {
  description: string;
  websiteType: WebsiteType;
  selectedLayout: LayoutOption;
  selectedConcept: ConceptOption;
  icon_style?: IconStyle;
  image_mode?: ImageMode;
}

// SSE event types
export interface ProgressEvent {
  type: "progress";
  completed: number;
  total: number;
}

export interface LayoutEvent {
  type: "layout";
  layout: LayoutOption;
  completed: number;
}

export interface ConceptEvent {
  type: "concept";
  concept: ConceptOption;
  completed: number;
}

export interface DoneEvent<T> {
  type: "done";
  items: T[];
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export type LayoutSSEEvent = ProgressEvent | LayoutEvent | DoneEvent<LayoutOption> | ErrorEvent;
export type ConceptSSEEvent = ProgressEvent | ConceptEvent | DoneEvent<ConceptOption> | ErrorEvent;

// Layout direction definitions
export const LAYOUT_DIRECTIONS = [
  {
    id: "clean-minimal",
    name: "Clean Minimal",
    description: "Generous whitespace, subtle shadows, elegant typography, simple navigation",
  },
  {
    id: "bold-hero",
    name: "Bold Hero",
    description: "Large hero image, strong typography, impactful above-the-fold design",
  },
  {
    id: "split-layout",
    name: "Split Layout",
    description: "Two-column design, professional feel, balanced content distribution",
  },
  {
    id: "grid-product",
    name: "Grid Product",
    description: "Card-based layout, e-commerce style, product-focused arrangement",
  },
  {
    id: "story-driven",
    name: "Story-Driven",
    description: "Full-width sections, narrative flow, immersive scrolling experience",
  },
] as const;

// Concept direction definitions
export const CONCEPT_DIRECTIONS = [
  {
    id: "bold-modern",
    name: "Bold & Modern",
    description: "Dark gradients, vibrant accent colors, contemporary feel",
  },
  {
    id: "clean-minimal",
    name: "Clean & Minimal",
    description: "Ample whitespace, muted color palette, refined elegance",
  },
  {
    id: "warm-organic",
    name: "Warm & Organic",
    description: "Earth tones, natural textures, inviting warmth",
  },
  {
    id: "tech-futuristic",
    name: "Tech & Futuristic",
    description: "Neon accents, geometric patterns, cutting-edge aesthetics",
  },
  {
    id: "premium-luxurious",
    name: "Premium & Luxurious",
    description: "Rich deep colors, gold accents, sophisticated opulence",
  },
] as const;
