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
  deps?: unknown[];
}

/**
 * Custom hook that handles A4 page pagination for the CV preview.
 *
 * Measures CV content against A4 page boundaries and calculates
 * margin adjustments (spacers) to push elements to the next page
 * when they would otherwise cross a page boundary.
 *
 * @param {Object} options
 * @param {boolean} options.showClauseFooter - Whether the RODO clause footer is shown
 * @param {number} options.marginVMm - Vertical margin in millimeters
 * @param {Array} options.deps - Additional dependencies to trigger recalculation
 * @returns {{ contentRef, pageCount, pageSpacers, visualContentHeight }}
 */
export function usePagination({
  showClauseFooter,
  marginVMm,
  deps = [],
}: UsePaginationOptions) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [pageSpacers, setPageSpacers] = useState<SpacerEdit[]>([]);

  const footerTextHeightPx = showClauseFooter ? FOOTER_TEXT_HEIGHT_PX : 0;
  const visualContentHeight = A4_HEIGHT_PX - footerTextHeightPx;
  const marginVPx = Math.round(marginVMm * MM_TO_PX);
  const engineContentHeight =
    A4_HEIGHT_PX - Math.max(footerTextHeightPx, marginVPx);

  const calculatePages = useCallback(() => {
    const measureContainer = contentRef.current;
    if (!measureContainer) return;

    // Reset all margins in measureContainer FIRST
    measureContainer
      .querySelectorAll<HTMLElement>(".cv-breakable")
      .forEach((el) => {
        el.style.marginTop = "";
      });

    const breakables = Array.from(
      measureContainer.querySelectorAll<HTMLElement>(".cv-breakable"),
    );
    const edits: SpacerEdit[] = [];

    for (let index = 0; index < breakables.length; index++) {
      const el = breakables[index];
      const elRect = el.getBoundingClientRect();
      const containerRect = measureContainer.getBoundingClientRect();

      const topRelative = elRect.top - containerRect.top;
      const bottomRelative = elRect.bottom - containerRect.top;

      const startPage = Math.floor((topRelative + 1) / visualContentHeight);
      const pageTextLimit =
        startPage * visualContentHeight + engineContentHeight;

      const pageTopLimit = startPage * visualContentHeight;
      const pageSafeTop = startPage * visualContentHeight + marginVPx;

      let needsPush = false;
      let targetY = 0;

      // Condition 1: Element crosses the bottom margin of the page
      if (bottomRelative - 1 > pageTextLimit) {
        needsPush = true;
        targetY = (startPage + 1) * visualContentHeight + marginVPx;
      }
      // Condition 2: Element natively falls exactly in the top margin padding of a new page
      else if (
        startPage > 0 &&
        topRelative >= pageTopLimit &&
        topRelative < pageSafeTop
      ) {
        needsPush = true;
        targetY = pageSafeTop;
      }

      // For oversized elements (taller than a page), don't drag the previous
      // heading along — just ensure the element itself starts at a page boundary
      const isOversized = elRect.height >= engineContentHeight;

      if (needsPush) {
        let elementToPush = el;
        let pushAmount = targetY - topRelative;
        let pushIndex = index;

        // Check if previous element is a heading that we should drag along
        // (skip for oversized elements — moving a heading would waste a full page)
        if (!isOversized) {
          const prev = index > 0 ? breakables[index - 1] : null;

          if (prev && prev.hasAttribute("data-keep-with-next")) {
            if (prev.closest(".cv-section") === el.closest(".cv-section")) {
              const prevRect = prev.getBoundingClientRect();
              const prevTopRelative = prevRect.top - containerRect.top;

              elementToPush = prev;
              pushAmount = targetY - prevTopRelative;
              pushIndex = index - 1;
            }
          }
        }

        if (pushAmount > 0) {
          const computedMargin =
            parseFloat(window.getComputedStyle(elementToPush).marginTop) || 0;
          const newMargin = computedMargin + pushAmount;
          elementToPush.style.marginTop = `${newMargin}px`;

          const existingEdit = edits.find((e) => e.index === pushIndex);
          if (existingEdit) {
            existingEdit.newMargin = newMargin;
          } else {
            edits.push({ index: pushIndex, newMargin });
          }
        }
      }
    }

    const totalHeight = measureContainer.scrollHeight;
    const pages = Math.max(
      1,
      Math.ceil((totalHeight - 5) / visualContentHeight),
    );
    setPageCount((prev) => (prev !== pages ? pages : prev));

    const editsStr = JSON.stringify(edits);
    setPageSpacers((prev) =>
      JSON.stringify(prev) !== editsStr ? edits : prev,
    );
  }, [visualContentHeight, engineContentHeight, marginVPx]);

  // Measuring engine: observe content and recalculate on changes
  useEffect(() => {
    if (!contentRef.current) return;

    const timer = setTimeout(calculatePages, PAGINATION_DEBOUNCE_MS);

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
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [calculatePages, ...deps]);

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
