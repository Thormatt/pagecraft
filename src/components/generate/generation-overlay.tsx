"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const STEPS = [
  "Analyzing your prompt",
  "Designing layout",
  "Writing HTML & CSS",
  "Polishing details",
];

interface GenerationOverlayProps {
  isGenerating: boolean;
}

export function GenerationOverlay({ isGenerating }: GenerationOverlayProps) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setActiveStep(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 3200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-20 flex items-center justify-center bg-background"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            {/* Animated icon with subtle ring */}
            <div className="relative mb-7">
              {/* Outer breathing ring */}
              <motion.div
                className="absolute -inset-4 rounded-full border border-primary/15"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Inner glow */}
              <motion.div
                className="absolute -inset-2 rounded-full bg-primary/8"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Icon box */}
              <motion.div
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/[0.06]"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-primary"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" opacity="0.15" />
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </motion.div>
            </div>

            {/* Title */}
            <motion.p
              className="text-sm font-semibold text-foreground mb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              Crafting your page
            </motion.p>

            {/* Step list */}
            <div className="flex flex-col gap-2.5 mb-7">
              {STEPS.map((label, i) => {
                const isDone = i < activeStep;
                const isActive = i === activeStep;
                return (
                  <motion.div
                    key={label}
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: isDone ? 0.4 : isActive ? 1 : 0.25, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.35 }}
                  >
                    {/* Step indicator */}
                    <div className="relative flex h-5 w-5 items-center justify-center">
                      {isDone ? (
                        <motion.svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none"
                          className="text-primary"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </motion.svg>
                      ) : isActive ? (
                        <motion.div
                          className="h-2 w-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      ) : (
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                    <span className={`text-xs ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                    {/* Animated dots for active step */}
                    {isActive && (
                      <div className="flex gap-0.5 ml-0.5">
                        {[0, 1, 2].map((d) => (
                          <motion.div
                            key={d}
                            className="h-[3px] w-[3px] rounded-full bg-primary/60"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="h-[3px] w-44 overflow-hidden rounded-full bg-border/60">
              <motion.div
                className="h-full rounded-full bg-primary/50"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: "40%" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
