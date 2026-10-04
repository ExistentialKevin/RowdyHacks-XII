"use client";

import React, { useEffect, useState, useCallback, useLayoutEffect } from "react";
import SpeakingMascot from "@/app/components/mascot/SpeakingMascot";

export interface TutorialStep {
  target: React.RefObject<HTMLElement | null>;
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  active: boolean;
  onFinish: () => void;
  /** Have Lil the mascot "speak" each step instead of a plain tooltip. */
  mascot?: boolean;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const PLAIN_WIDTH = 320;
const MASCOT_WIDTH = 440;

export default function TutorialOverlay({ steps, active, onFinish, mascot = false }: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const step = steps[stepIndex];

  const measure = useCallback(() => {
    const el = step?.target.current;
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - PADDING,
      left: r.left - PADDING,
      width: r.width + PADDING * 2,
      height: r.height + PADDING * 2,
    });
  }, [step]);

  useLayoutEffect(() => {
    if (!active) return;
    measure();
  }, [active, measure, stepIndex]);

  useEffect(() => {
    if (!active) return;
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, measure]);

  useEffect(() => {
    if (!active) setStepIndex(0);
  }, [active]);

  if (!active || !step) return null;

  const isLast = stepIndex === steps.length - 1;

  const next = () => {
    if (isLast) {
      onFinish();
    } else {
      setStepIndex((i) => i + 1);
    }
  };
  const back = () => setStepIndex((i) => Math.max(0, i - 1));
  const skip = () => onFinish();

  const placement = step.placement ?? "bottom";
  const tooltipWidth = mascot ? MASCOT_WIDTH : PLAIN_WIDTH;
  const tooltipStyle: React.CSSProperties = {};
  if (rect) {
    if (placement === "bottom") {
      tooltipStyle.top = rect.top + rect.height + 12;
      tooltipStyle.left = Math.max(16, rect.left);
    } else if (placement === "top") {
      tooltipStyle.top = Math.max(16, rect.top - 140);
      tooltipStyle.left = Math.max(16, rect.left);
    } else if (placement === "left") {
      tooltipStyle.top = rect.top;
      tooltipStyle.left = Math.max(16, rect.left - tooltipWidth - 20);
    } else {
      tooltipStyle.top = rect.top;
      tooltipStyle.left = rect.left + rect.width + 12;
    }
    // Keep the tooltip on-screen horizontally.
    if (typeof window !== "undefined" && typeof tooltipStyle.left === "number") {
      tooltipStyle.left = Math.max(16, Math.min(tooltipStyle.left, window.innerWidth - tooltipWidth - 16));
    }
  }

  const stepLabel = (
    <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-primary">
      Step {stepIndex + 1} of {steps.length}
    </div>
  );

  const controls = (
    <div className="flex items-center justify-between">
      <button
        onClick={skip}
        className="text-xs font-medium text-dim hover:text-foreground"
      >
        Skip tutorial
      </button>
      <div className="flex items-center gap-2">
        {stepIndex > 0 && (
          <button
            onClick={back}
            className="border border-line bg-panel px-4 py-1.5 text-xs font-semibold text-foreground hover:border-accent-primary/50"
          >
            Back
          </button>
        )}
        <button
          onClick={next}
          className="bg-accent-primary px-4 py-1.5 text-xs font-semibold text-accent-primary-foreground hover:brightness-110"
        >
          {isLast ? "Done" : "Next"}
        </button>
      </div>
    </div>
  );

  const positionStyle: React.CSSProperties = rect
    ? tooltipStyle
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dimmed backdrop split into 4 panels around the highlighted rect, so the hole never blocks clicks/scroll inside it */}
      {rect ? (
        <>
          <div
            className="absolute bg-black/70 transition-all duration-200"
            style={{ top: 0, left: 0, width: "100%", height: Math.max(0, rect.top) }}
          />
          <div
            className="absolute bg-black/70 transition-all duration-200"
            style={{ top: rect.top + rect.height, left: 0, width: "100%", bottom: 0 }}
          />
          <div
            className="absolute bg-black/70 transition-all duration-200"
            style={{ top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height }}
          />
          <div
            className="absolute bg-black/70 transition-all duration-200"
            style={{ top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height }}
          />
          <div
            className="pointer-events-none absolute ring-2 ring-accent-primary shadow-[0_0_0_4000px_rgba(0,0,0,0.0)] transition-all duration-200"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}

      {/* Tooltip */}
      {mascot ? (
        <div className="absolute" style={{ ...positionStyle, width: tooltipWidth }}>
          <SpeakingMascot
            header={stepLabel}
            title={step.title}
            text={step.body}
            size={88}
            className="drop-shadow-2xl"
          >
            {controls}
          </SpeakingMascot>
        </div>
      ) : (
        <div
          className="absolute border border-panel-border-hover bg-panel-muted p-4 shadow-2xl"
          style={{ ...positionStyle, width: tooltipWidth }}
        >
          {stepLabel}
          <h3 className="mb-2 text-base font-bold text-foreground">{step.title}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{step.body}</p>
          {controls}
        </div>
      )}
    </div>
  );
}
