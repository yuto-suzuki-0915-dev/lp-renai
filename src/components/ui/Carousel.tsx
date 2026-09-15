"use client";

import { Children, useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./Carousel.module.css";

type CarouselProps = { label: string; children: ReactNode };

export default function Carousel({ label, children }: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const total = Children.count(children);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [visibleRange, setVisibleRange] = useState({ start: 1, end: 1 });

  const updateControls = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    setAtStart(viewport.scrollLeft <= 6);
    setAtEnd(viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 6);

    const items = Array.from(viewport.querySelectorAll<HTMLElement>("[data-carousel-item]"));
    const viewportStart = viewport.scrollLeft;
    const viewportEnd = viewportStart + viewport.clientWidth;
    const centeredItems = items
      .map((item, index) => ({ center: item.offsetLeft + item.offsetWidth / 2, index }))
      .filter((item) => item.center >= viewportStart && item.center <= viewportEnd);

    if (centeredItems.length > 0) {
      setVisibleRange({ start: centeredItems[0].index + 1, end: centeredItems.at(-1)!.index + 1 });
    }
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    updateControls();
    const observer = new ResizeObserver(updateControls);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [updateControls]);

  const move = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    const item = viewport?.querySelector<HTMLElement>("[data-carousel-item]");
    if (!viewport || !item) return;
    const gap = Number.parseFloat(getComputedStyle(viewport).columnGap || "0");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollBy({ left: direction * (item.offsetWidth + gap), behavior: reduceMotion ? "auto" : "smooth" });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
  };

  return (
    <div className={styles.carousel}>
      <div className={styles.controls} aria-label={`${label}のスライド操作`}>
        <button type="button" onClick={() => move(-1)} disabled={atStart} aria-label="前のカードへ">←</button>
        <button type="button" onClick={() => move(1)} disabled={atEnd} aria-label="次のカードへ">→</button>
      </div>
      <div ref={viewportRef} className={styles.viewport} role="region" aria-label={label} tabIndex={0} onScroll={updateControls} onKeyDown={handleKeyDown}>
        {children}
      </div>
      <p className={styles.progress} aria-live="polite">
        <span>{String(visibleRange.start).padStart(2, "0")}</span>
        {visibleRange.start !== visibleRange.end && <><i>–</i><span>{String(visibleRange.end).padStart(2, "0")}</span></>}
        <small>/ {String(total).padStart(2, "0")}</small>
      </p>
    </div>
  );
}
