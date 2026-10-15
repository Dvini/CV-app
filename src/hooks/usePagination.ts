import { useEffect, useRef, useState, useCallback } from "react";
import {
  A4_HEIGHT_PX,
  MM_TO_PX,
  FOOTER_TEXT_HEIGHT_PX,
  PAGINATION_DEBOUNCE_MS,
} from "../constants/layout";

interface SpacerEdit {
  index: number;
  newMargin: number;
}

interface UsePaginationOptions {
  showClauseFooter: boolean;
  marginVMm: number;
  isColumnTemplate?: boolean;
  /**
   * Changing this value schedules a recalculation. DOM mutations and size changes are
   * observed anyway; this covers changes that only touch style attributes (e.g. margins).
   */
  recalcToken?: unknown;
}

/** Later passes ignore sub-pixel pushes so rounding can't keep the loop going. */
const MIN_REPEAT_PUSH_PX = 0.5;
const MAX_PASSES = 5;

/**
 * Custom hook that handles A4 page pagination for the CV preview.
 *
 * Measures CV content against A4 page boundaries and calculates
 * margin adjustments (spacers) to push elements to the next page
 * when they would otherwise cross a page boundary.
 *
 * @returns {{ contentRef, pageCount, pageSpacers, visualContentHeight }}
 */
export function usePagination({
  showClauseFooter,
  marginVMm,
  isColumnTemplate = false,
  recalcToken,
}: UsePaginationOptions) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [pageSpacers, setPageSpacers] = useState<SpacerEdit[]>([]);

  const footerTextHeightPx = showClauseFooter ? FOOTER_TEXT_HEIGHT_PX : 0;
  const visualContentHeight = A4_HEIGHT_PX - footerTextHeightPx;
  const marginVPx = Math.round(marginVMm * MM_TO_PX);
  const engineContentHeight = A4_HEIGHT_PX - Math.max(footerTextHeightPx, marginVPx);

  const calculatePages = useCallback(() => {
    const measureContainer = contentRef.current;
    if (!measureContainer) return;

    const breakables = Array.from(
      measureContainer.querySelectorAll<HTMLElement>(".cv-breakable"),
    );
    // Reset all spacer margins FIRST, then measure the natural layout
    breakables.forEach((el) => {
      el.style.marginTop = "";
    });

    const edits: SpacerEdit[] = [];
    const topOf = (el: Element) =>
      el.getBoundingClientRect().top - measureContainer.getBoundingClientRect().top;
    const pageOf = (top: number) => Math.floor(top / visualContentHeight);

    /** Adds `amount` px to the element's top margin and records it for the page clones. */
    const pushDown = (el: HTMLElement, index: number, amount: number) => {
      const computedMargin = parseFloat(window.getComputedStyle(el).marginTop) || 0;
      const newMargin = computedMargin + amount;
      el.style.marginTop = `${newMargin}px`;
      if (index === -1) return;
      const existingEdit = edits.find((e) => e.index === index);
      if (existingEdit) {
        existingEdit.newMargin = newMargin;
      } else {
        edits.push({ index, newMargin });
      }
    };

    /** Pass 1: push elements that cross a page's bottom limit or start inside its top margin. */
    const pushAcrossPageBreaks = (minPush: number): boolean => {
      let changed = false;
      for (let index = 0; index < breakables.length; index++) {
        const el = breakables[index];
        const elRect = el.getBoundingClientRect();
        const containerRect = measureContainer.getBoundingClientRect();

        const topRelative = elRect.top - containerRect.top;
        const bottomRelative = elRect.bottom - containerRect.top;

        // startPage: which page this element's top edge is currently on.
        // We intentionally do NOT add epsilon (+1) here — that caused a dead zone
        // for small margins where elements near the page boundary escaped both conditions.
        const startPage = pageOf(topRelative);
        const pageTextLimit = startPage * visualContentHeight + engineContentHeight;
        const pageTopLimit = startPage * visualContentHeight;
        const pageSafeTop = startPage * visualContentHeight + marginVPx;

        let needsPush = false;
        let targetY = 0;

        // Condition 1: Element crosses the bottom margin of the page
        if (bottomRelative > pageTextLimit) {
          needsPush = true;
          targetY = (startPage + 1) * visualContentHeight + marginVPx;
        }
        // Condition 2: Element natively falls exactly in the top margin padding of a new page
        else if (startPage > 0 && topRelative >= pageTopLimit && topRelative < pageSafeTop) {
          needsPush = true;
          targetY = pageSafeTop;
        }

        // Condition 3: Orphaned heading — this element is already on page N+1 but
        // its preceding heading (data-keep-with-next) is still stranded on page N.
        if (!needsPush && startPage > 0) {
          const prev = index > 0 ? breakables[index - 1] : null;
          if (prev && prev.hasAttribute("data-keep-with-next") && pageOf(topOf(prev)) < startPage) {
            targetY = startPage * visualContentHeight + marginVPx;
            needsPush = true;
          }
        }

        if (!needsPush) continue;

        let elementToPush = el;
        let pushAmount = targetY - topRelative;
        let pushIndex = index;

        // Drag the preceding heading along — except for oversized elements (taller
        // than a page), where moving the heading would waste a full page
        const isOversized = elRect.height >= engineContentHeight;
        const prev = index > 0 ? breakables[index - 1] : null;
        if (!isOversized && prev && prev.hasAttribute("data-keep-with-next")) {
          // For single-column: only drag heading if it's in the same cv-section.
          // For column templates: always allow it — the heading may be in a
          // sibling column's DOM node (different .cv-section ancestor).
          const sameSection =
            isColumnTemplate || prev.closest(".cv-section") === el.closest(".cv-section");
          if (sameSection) {
            elementToPush = prev;
            pushAmount = targetY - topOf(prev);
            pushIndex = index - 1;
          }
        }

        if (pushAmount > minPush) {
          pushDown(elementToPush, pushIndex, pushAmount);
          changed = true;
        }
      }
      return changed;
    };

    /**
     * Pass 2 (column templates): make each column's first element on every continuation
     * page start at the margin — pass 1 handles both columns independently and can leave
     * them starting at different heights on page 2+.
     */
    const alignColumnStarts = (minPush: number): boolean => {
      let changed = false;
      const colSelectors = [
        ".cv-twocol-side, .cv-creative-side",
        ".cv-twocol-main, .cv-creative-main",
      ];
      for (const selector of colSelectors) {
        const colEl = measureContainer.querySelector(selector);
        if (!colEl) continue;
        const colBreakables = Array.from(colEl.querySelectorAll<HTMLElement>(".cv-breakable"));

        for (let p = 1; p <= 20; p++) {
          const pageStart = p * visualContentHeight;
          // Only look at elements that are already on page 2+ (top >= pageStart).
          // Using pageStart - X caused elements still on page 1 to be incorrectly
          // grabbed and pushed onto page 2, especially visible for margins 0–2mm.
          const firstOnPage = colBreakables.find((el) => topOf(el) >= pageStart);
          if (!firstOnPage) break;

          const currentTop = topOf(firstOnPage);
          // Stop if this element is already on a later page
          if (currentTop >= pageStart + visualContentHeight) break;

          const gap = pageStart + marginVPx - currentTop;
          if (gap > minPush) {
            pushDown(firstOnPage, breakables.indexOf(firstOnPage), gap);
            changed = true;
          }
        }
      }
      return changed;
    };

    /** Pass 3: move headings stranded on an earlier page than the element they introduce. */
    const fixOrphanedHeadings = (minPush: number): boolean => {
      let changed = false;
      for (let i = 0; i < breakables.length - 1; i++) {
        const heading = breakables[i];
        if (!heading.hasAttribute("data-keep-with-next")) continue;

        const headingTop = topOf(heading);
        const nextPage = pageOf(topOf(breakables[i + 1]));
        if (pageOf(headingTop) < nextPage) {
          const gap = nextPage * visualContentHeight + marginVPx - headingTop;
          if (gap > minPush) {
            pushDown(heading, i, gap);
            changed = true;
          }
        }
      }
      return changed;
    };

    // Later passes can move elements that earlier checks already approved (e.g. aligning
    // a column start shifts everything below it), so repeat until the layout is stable.
    for (let pass = 0; pass < MAX_PASSES; pass++) {
      const minPush = pass === 0 ? 0 : MIN_REPEAT_PUSH_PX;
      let changed = pushAcrossPageBreaks(minPush);
      if (isColumnTemplate) changed = alignColumnStarts(minPush) || changed;
      changed = fixOrphanedHeadings(minPush) || changed;
      if (!changed) break;
    }

    const totalHeight = measureContainer.scrollHeight;
    const pages = Math.max(1, Math.ceil((totalHeight - 5) / visualContentHeight));
    setPageCount((prev) => (prev !== pages ? pages : prev));

    const editsStr = JSON.stringify(edits);
    setPageSpacers((prev) => (JSON.stringify(prev) !== editsStr ? edits : prev));
  }, [visualContentHeight, engineContentHeight, marginVPx, isColumnTemplate]);

  // Measuring engine: observe content and recalculate on changes
  useEffect(() => {
    if (!contentRef.current) return;

    let rafId: number | null = null;
    const scheduleRecalc = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(calculatePages);
    };

    const resizeObserver = new ResizeObserver(scheduleRecalc);
    resizeObserver.observe(contentRef.current);

    const mutationObserver = new MutationObserver(scheduleRecalc);
    mutationObserver.observe(contentRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [calculatePages]);

  // Debounced recalculation on mount and whenever the caller's token changes
  useEffect(() => {
    const timer = setTimeout(calculatePages, PAGINATION_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [calculatePages, recalcToken]);

  // Clone synchronization: apply spacers to visible page clones
  useEffect(() => {
    const cloneContainers = document.querySelectorAll(
      ".cv-preview-container .cv-content-offset",
    );
    cloneContainers.forEach((container) => {
      const breakables =
        container.querySelectorAll<HTMLElement>(".cv-breakable");

      // Reset first
      breakables.forEach((el) => (el.style.marginTop = ""));

      // Apply calculated spacers
      pageSpacers.forEach((spacer) => {
        if (breakables[spacer.index]) {
          breakables[spacer.index].style.marginTop = `${spacer.newMargin}px`;
        }
      });
    });
  });

  return { contentRef, pageCount, pageSpacers, visualContentHeight };
}
