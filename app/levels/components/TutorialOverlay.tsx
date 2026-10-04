"use client";

import React, { useEffect, useState, useCallback, useLayoutEffect } from "react";

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
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;

export default function TutorialOverlay({ steps, active, onFinish }: TutorialOverlayProps) {
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
      tooltipStyle.left = Math.max(16, rect.left - 340);
    } else {
      tooltipStyle.top = rect.top;
      tooltipStyle.left = rect.left + rect.width + 12;
    }
  }

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
            className="pointer-events-none absolute rounded-xl ring-2 ring-emerald-400 shadow-[0_0_0_4000px_rgba(0,0,0,0.0)] transition-all duration-200"
            style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}

      {/* Tooltip */}
      <div
        className="absolute w-[320px] rounded-xl border border-emerald-500/40 bg-zinc-900 p-4 shadow-2xl"
        style={rect ? tooltipStyle : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Step {stepIndex + 1} of {steps.length}
        </div>
        <h3 className="mb-2 text-base font-bold text-zinc-100">{step.title}</h3>
        <p className="mb-4 text-sm text-zinc-300">{step.body}</p>
        <div className="flex items-center justify-between">
          <button
            onClick={skip}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-300"
          >
            Skip tutorial
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                onClick={back}
                className="rounded-full bg-zinc-800 px-4 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
