"use client";

import { useCallback, useRef, useState } from "react";

export type HighlightColor = "yellow" | "green" | "pink";

export interface HighlightEntry {
  id: string;
  color: HighlightColor;
  text: string;
}

const COLOR_MAP: Record<HighlightColor, string> = {
  yellow: "#fce53b",
  green: "#53fd8f",
  pink: "#f83950",
};

let _uid = 0;
function uid() {
  return `hl-${++_uid}-${Date.now()}`;
}

/**
 * useHighlight
 * ─────────────────────────────────────────────────────────────────
 * Wraps selected text inside a passage container in <mark> spans.
 * Highlights are stored in React state so they can be listed / removed.
 *
 * Usage:
 *   const { highlights, activeColor, setActiveColor, applyHighlight, removeHighlight } = useHighlight();
 *
 *   // on the passage container:
 *   <div ref={passageRef} onMouseUp={applyHighlight}>...</div>
 */
export function useHighlight() {
  const [highlights, setHighlights] = useState<HighlightEntry[]>([]);
  const [activeColor, setActiveColor] = useState<HighlightColor | null>(null);

  const applyHighlight = useCallback(() => {
    if (!activeColor) return;

    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);

    // Abort if selection spans across multiple block-level elements
    // (surroundContents throws if the range partially selects a node)
    try {
      const id = uid();
      const mark = document.createElement("mark");
      mark.dataset.highlightId = id;
      mark.style.backgroundColor = COLOR_MAP[activeColor];
      mark.style.borderRadius = "2px";
      mark.style.cursor = "pointer";
      mark.style.padding = "0 1px";
      mark.title = "Click to remove highlight";

      mark.addEventListener("click", () => {
        // Unwrap the mark node on click
        const parent = mark.parentNode;
        if (!parent) return;
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
        setHighlights((prev) => prev.filter((h) => h.id !== id));
      });

      range.surroundContents(mark);

      setHighlights((prev) => [
        ...prev,
        { id, color: activeColor, text: mark.textContent ?? "" },
      ]);
    } catch {
      // Ignore — selection crossed element boundaries
    }

    sel.removeAllRanges();
  }, [activeColor]);

  const removeHighlight = useCallback((id: string) => {
    const mark = document.querySelector(
      `mark[data-highlight-id="${id}"]`,
    ) as HTMLElement | null;
    if (mark) {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
      }
    }
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const clearAllHighlights = useCallback(() => {
    document.querySelectorAll("mark[data-highlight-id]").forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });
    setHighlights([]);
  }, []);

  return {
    highlights,
    activeColor,
    setActiveColor,
    applyHighlight,
    removeHighlight,
    clearAllHighlights,
    COLOR_MAP,
  };
}
