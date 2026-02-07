"use client";

import { useState, useCallback } from "react";
import { StepDescription } from "./step-description";
import { StepLayouts } from "./step-layouts";
import { StepConcepts } from "./step-concepts";
import { StepBuilding } from "./step-building";
import { extractHtml, type IconStyle, type ImageMode } from "@/lib/ai/prompt";
import type {
  MoodboardStep,
  WebsiteType,
  LayoutOption,
  ConceptOption,
  LayoutSSEEvent,
  ConceptSSEEvent,
} from "@/types/moodboard";
import type { PromptMessage } from "@/types";

interface MoodboardWizardProps {
  onHtmlUpdate: (html: string) => void;
  onMessagesUpdate: (messages: PromptMessage[]) => void;
}

export function MoodboardWizard({
  onHtmlUpdate,
  onMessagesUpdate,
}: MoodboardWizardProps) {
  const [step, setStep] = useState<MoodboardStep>("description");
  const [description, setDescription] = useState("");
  const [websiteType, setWebsiteType] = useState<WebsiteType>("landing");
  const [layouts, setLayouts] = useState<LayoutOption[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<LayoutOption | null>(null);
  const [concepts, setConcepts] = useState<ConceptOption[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<ConceptOption | null>(null);
  const [iconStyle] = useState<IconStyle>("svg");
  const [imageMode] = useState<ImageMode>("stock");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layoutProgress, setLayoutProgress] = useState({ completed: 0, total: 5 });
  const [conceptProgress, setConceptProgress] = useState({ completed: 0, total: 5 });

  const generateLayouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLayouts([]);
    setLayoutProgress({ completed: 0, total: 5 });

    try {
      const response = await fetch("/api/moodboard/layouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, websiteType }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate layouts: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6)) as LayoutSSEEvent;
              if (event.type === "layout") {
                setLayouts((prev) => [...prev, event.layout]);
                setLayoutProgress((prev) => ({ ...prev, completed: event.completed }));
              } else if (event.type === "progress") {
                setLayoutProgress({ completed: event.completed, total: event.total });
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

      setStep("layouts");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate layouts");
    } finally {
      setIsLoading(false);
    }
  }, [description, websiteType]);

  const generateConcepts = useCallback(async () => {
    if (!selectedLayout) return;

    setIsLoading(true);
    setError(null);
    setConcepts([]);
    setConceptProgress({ completed: 0, total: 5 });

    try {
      const response = await fetch("/api/moodboard/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, websiteType, selectedLayout }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate concepts: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6)) as ConceptSSEEvent;
              if (event.type === "concept") {
                setConcepts((prev) => [...prev, event.concept]);
                setConceptProgress((prev) => ({ ...prev, completed: event.completed }));
              } else if (event.type === "progress") {
                setConceptProgress({ completed: event.completed, total: event.total });
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }

      setStep("concepts");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate concepts");
    } finally {
      setIsLoading(false);
    }
  }, [description, websiteType, selectedLayout]);

  const buildPage = useCallback(async () => {
    if (!selectedLayout || !selectedConcept) return;

    setIsLoading(true);
    setError(null);
    setStep("building");

    try {
      const response = await fetch("/api/moodboard/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          websiteType,
          selectedLayout,
          selectedConcept,
          icon_style: iconStyle,
          image_mode: imageMode,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Build failed (${response.status}): ${errorText}`);
      }

      // Simple: get the full text response (no streaming protocol)
      const fullText = await response.text();

      if (!fullText.trim()) {
        throw new Error("Build produced no content");
      }

      const html = extractHtml(fullText);
      onHtmlUpdate(html);
      onMessagesUpdate([
        { role: "user", content: description },
        { role: "assistant", content: fullText },
      ]);
    } catch (e) {
      console.error("[Moodboard Build] Error:", e);
      setError(e instanceof Error ? e.message : "Failed to build page");
    } finally {
      setIsLoading(false);
    }
  }, [description, websiteType, selectedLayout, selectedConcept, iconStyle, imageMode, onHtmlUpdate, onMessagesUpdate]);

  const startOver = useCallback(() => {
    setStep("description");
    setDescription("");
    setWebsiteType("landing");
    setLayouts([]);
    setSelectedLayout(null);
    setConcepts([]);
    setSelectedConcept(null);
    setError(null);
    onHtmlUpdate("");
  }, [onHtmlUpdate]);

  const handleLayoutNext = useCallback(() => {
    if (selectedLayout) {
      generateConcepts();
    }
  }, [selectedLayout, generateConcepts]);

  const handleConceptNext = useCallback(() => {
    if (selectedConcept) {
      buildPage();
    }
  }, [selectedConcept, buildPage]);

  return (
    <div className="flex h-full flex-col">
      {step === "description" && (
        <StepDescription
          description={description}
          websiteType={websiteType}
          onDescriptionChange={setDescription}
          onWebsiteTypeChange={setWebsiteType}
          onNext={generateLayouts}
          isLoading={isLoading}
        />
      )}

      {step === "layouts" && (
        <StepLayouts
          layouts={layouts}
          selectedLayout={selectedLayout}
          onSelectLayout={setSelectedLayout}
          onBack={() => setStep("description")}
          onNext={handleLayoutNext}
          isLoading={isLoading}
          loadingProgress={layoutProgress}
        />
      )}

      {step === "concepts" && selectedLayout && (
        <StepConcepts
          selectedLayout={selectedLayout}
          concepts={concepts}
          selectedConcept={selectedConcept}
          onSelectConcept={setSelectedConcept}
          onBack={() => setStep("layouts")}
          onNext={handleConceptNext}
          isLoading={isLoading}
          loadingProgress={conceptProgress}
        />
      )}

      {step === "building" && selectedLayout && selectedConcept && (
        <StepBuilding
          selectedLayout={selectedLayout}
          selectedConcept={selectedConcept}
          isLoading={isLoading}
          error={error}
          onStartOver={startOver}
        />
      )}
    </div>
  );
}
