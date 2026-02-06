export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  category: "slides" | "report";
  tags: string[];
  previewColors: string[];
  html: string;
}

import { consultingDeckHtml } from "./consulting-deck";
import { darkExecutiveHtml } from "./dark-executive";
import { dataStoryHtml } from "./data-story";
import { brandKeynoteHtml } from "./brand-keynote";
import { annualReportHtml } from "./annual-report";
import { interactiveMicrositeHtml } from "./interactive-microsite";
import { minimalistReportHtml } from "./minimalist-report";
import { cultureMagazineHtml } from "./culture-magazine";

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "consulting-deck",
    name: "Consulting Deck",
    description: "McKinsey-inspired slide deck with clean typography, blue accents, and data-driven layouts",
    category: "slides",
    tags: ["professional", "business", "data", "presentation"],
    previewColors: ["#1e3a5f", "#2563eb", "#f8fafc"],
    html: consultingDeckHtml,
  },
  {
    id: "dark-executive",
    name: "Dark Executive",
    description: "Dramatic alternating dark/light slides with bold statistics and high-contrast typography",
    category: "slides",
    tags: ["executive", "dark", "dramatic", "corporate"],
    previewColors: ["#0a0f1a", "#f59e0b", "#ffffff"],
    html: darkExecutiveHtml,
  },
  {
    id: "data-story",
    name: "Data Story",
    description: "Stats-forward slides where each page presents one bold metric with supporting charts",
    category: "slides",
    tags: ["data", "statistics", "charts", "storytelling"],
    previewColors: ["#ffffff", "#10b981", "#1e293b"],
    html: dataStoryHtml,
  },
  {
    id: "brand-keynote",
    name: "Brand Keynote",
    description: "Apple-inspired minimal slides with gradient backgrounds and large typography",
    category: "slides",
    tags: ["minimal", "brand", "keynote", "modern"],
    previewColors: ["#7c3aed", "#ec4899", "#06b6d4"],
    html: brandKeynoteHtml,
  },
  {
    id: "annual-report",
    name: "Annual Report",
    description: "Magazine-style scrollable page with hero section, metrics strip, and content blocks",
    category: "report",
    tags: ["report", "corporate", "annual", "professional"],
    previewColors: ["#111827", "#2563eb", "#ffffff"],
    html: annualReportHtml,
  },
  {
    id: "interactive-microsite",
    name: "Interactive Microsite",
    description: "Scroll-driven page with sticky navigation, accordions, and animated sections",
    category: "report",
    tags: ["interactive", "microsite", "scroll", "modern"],
    previewColors: ["#0f172a", "#8b5cf6", "#f1f5f9"],
    html: interactiveMicrositeHtml,
  },
  {
    id: "minimalist-report",
    name: "Minimalist Report",
    description: "Stark black-and-white layout with single accent color and crisp data visualization",
    category: "report",
    tags: ["minimal", "clean", "data", "IBM-style"],
    previewColors: ["#ffffff", "#0f172a", "#0ea5e9"],
    html: minimalistReportHtml,
  },
  {
    id: "culture-magazine",
    name: "Culture Magazine",
    description: "Bold colors, chunky typography, and asymmetric grids for a vibrant editorial feel",
    category: "report",
    tags: ["creative", "magazine", "bold", "colorful"],
    previewColors: ["#f43f5e", "#fbbf24", "#8b5cf6"],
    html: cultureMagazineHtml,
  },
];
