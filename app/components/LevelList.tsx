"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import LevelCard from "./LevelCard";
import { initialLevels, type LevelData } from "../data/levels";

interface LevelListProps {
  levels?: LevelData[];
}

export default function LevelList({ levels = initialLevels }: LevelListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);

    const cardWidth = el.firstElementChild
      ? (el.firstElementChild as HTMLElement).offsetWidth + 16
      : 1;
    const currIndex = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.min(levels.length - 1, Math.max(0, currIndex)));
  }, [levels.length]);

  useEffect(() => {
    checkScroll();
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scrollByCard = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;

    const card = el.firstElementChild as HTMLElement | null;
    const scrollAmount = card ? card.offsetWidth + 16 : 320;

    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    const el = containerRef.current;
    if (!el) return;

    const card = el.children[index] as HTMLElement | null;
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }
  };

  return (
    <div className="relative space-y-4">
      {/* Controls header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
            Sector Levels
          </span>
          <span className="rounded-full bg-accent-secondary/50 border border-panel-border px-2 py-0.5 text-[10px] font-mono text-accent-primary">
            {levels.length} Total
          </span>
        </div>

        {/* Carousel buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByCard("left")}
            disabled={!canScrollLeft}
            aria-label="Previous level"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-panel-border bg-panel text-foreground shadow-sm transition hover:border-accent-primary/40 hover:text-accent-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollByCard("right")}
            disabled={!canScrollRight}
            aria-label="Next level"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-panel-border bg-panel text-foreground shadow-sm transition hover:border-accent-primary/40 hover:text-accent-primary disabled:opacity-30 disabled:pointer-events-none"
          >
            →
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-4 pt-1 snap-x snap-mandatory scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]"
        style={{ scrollbarWidth: "none" }}
      >
        {levels.map((lvl) => (
          <div
            key={lvl.name}
            className="w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-start"
          >
            <LevelCard
              levelNumber={lvl.levelNumber}
              name={lvl.name}
              description={lvl.description}
              current={lvl.current}
              total={lvl.total}
              difficulty={lvl.difficulty}
              category={lvl.category}
              href={lvl.href}
            />
          </div>
        ))}
      </div>

      {/* Pagination Indicator Dots */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {levels.map((lvl, index) => (
          <button
            key={lvl.name}
            type="button"
            onClick={() => scrollToIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === index
                ? "w-6 bg-accent-primary"
                : "w-1.5 bg-panel-border hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
