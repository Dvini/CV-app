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
  disableTopMarginPush?: boolean;
  isColumnTemplate?: boolean;
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
  disableTopMarginPush = false,
  isColumnTemplate = false,
  deps = [],
}: UsePaginationOptions) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [pageCount, setPageCount] = useState(1);
  const [pageSpacers, setPageSpacers] = useState<SpacerEdit[]>([]);

  const footerTextHeightPx = showClauseFooter ? FOOTER_TEXT_HEIGHT_PX : 0;
  const visualContentHeight = A4_HEIGHT_PX - footerTextHeightPx;
  const marginVPx = Math.round(marginVMm * MM_TO_PX);
  const effectiveMarginVPx = disableTopMarginPush ? 0 : marginVPx;
  const engineContentHeight =
    A4_HEIGHT_PX - Math.max(footerTextHeightPx, effectiveMarginVPx);

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

    // The spacer algorithm is tuned for single-column flow.
    // For column templates we only paginate by clipping, without injecting spacer margins.
    if (disableTopMarginPush) {
      const totalHeight = measureContainer.scrollHeight;
      const pages = Math.max(
        1,
        Math.ceil((totalHeight - 5) / visualContentHeight),
      );
      setPageCount((prev) => (prev !== pages ? pages : prev));
      setPageSpacers((prev) => (prev.length ? [] : prev));
      return;
    }

    for (let index = 0; index < breakables.length; index++) {
      const el = breakables[index];
      const elRect = el.getBoundingClientRect();
      const containerRect = measureContainer.getBoundingClientRect();

      const topRelative = elRect.top - containerRect.top;
      const bottomRelative = elRect.bottom - containerRect.top;

      // startPage: which page this element's top edge is currently on.
      // We intentionally do NOT add epsilon (+1) here — that caused a dead zone
      // for small margins where elements near the page boundary escaped both conditions.
      const startPage = Math.floor(topRelative / visualContentHeight);
      const pageTextLimit =
        startPage * visualContentHeight + engineContentHeight;

      const pageTopLimit = startPage * visualContentHeight;
      const pageSafeTop = startPage * visualContentHeight + effectiveMarginVPx;

      let needsPush = false;
      let targetY = 0;

      // Condition 1: Element crosses the bottom margin of the page
      if (bottomRelative > pageTextLimit) {
        needsPush = true;
        targetY = (startPage + 1) * visualContentHeight + effectiveMarginVPx;
      }
      // Condition 2: Element natively falls exactly in the top margin padding of a new page
      else if (
        !disableTopMarginPush &&
        startPage > 0 &&
        topRelative >= pageTopLimit &&
        topRelative < pageSafeTop
      ) {
        needsPush = true;
        targetY = pageSafeTop;
      }

      // Condition 3: Orphaned heading — this element is already on page N+1 but
      // its preceding heading (data-keep-with-next) is still stranded on page N.
      // Only check when Condition 1/2 didn't fire (element is in the content area).
      if (!needsPush && !disableTopMarginPush && startPage > 0) {
        const prev = index > 0 ? breakables[index - 1] : null;
        if (prev && prev.hasAttribute("data-keep-with-next")) {
          const prevRect = prev.getBoundingClientRect();
          const prevTopRelative = prevRect.top - containerRect.top;
          const prevPage = Math.floor(prevTopRelative / visualContentHeight);

          // prev is on a different (earlier) page than el → orphaned heading
          if (prevPage < startPage) {
            // Push prev to join el on this page
            targetY = startPage * visualContentHeight + effectiveMarginVPx;
            needsPush = true;
          }
        }
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
            const prevRect = prev.getBoundingClientRect();
            const prevTopRelative = prevRect.top - containerRect.top;

            // For single-column: only drag heading if it's in the same cv-section.
            // For column templates: always allow it — the heading may be in a
            // sibling column's DOM node (different .cv-section ancestor).
            const sameSection =
              isColumnTemplate ||
              prev.closest(".cv-section") === el.closest(".cv-section");

            if (sameSection) {
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

    // Column sync pass: for two-column/creative templates, ensure each column's
    // first visible element on every continuation page starts at the margin position.
    // The main spacer loop processes both columns independently and can leave them
    // starting at different heights on page 2+.
    if (isColumnTemplate) {
      const colSelectors = [
        ".cv-twocol-side, .cv-creative-side",
        ".cv-twocol-main, .cv-creative-main",
      ];
      const containerRect = measureContainer.getBoundingClientRect();

      for (const selector of colSelectors) {
        const colEl = measureContainer.querySelector(selector);
        if (!colEl) continue;

        const colBreakables = Array.from(
          colEl.querySelectorAll<HTMLElement>(".cv-breakable"),
        );

        for (let p = 1; p <= 20; p++) {
          const pageStart = p * visualContentHeight;
          const targetTop = pageStart + effectiveMarginVPx;

          // Only look at elements that are already on page 2+ (top >= pageStart).
          // Using pageStart - X caused elements still on page 1 to be incorrectly
          // grabbed and pushed onto page 2, especially visible for margins 0–2mm.
          const firstOnPage = colBreakables.find((el) => {
            const top = el.getBoundingClientRect().top - containerRect.top;
            return top >= pageStart;
          });

          if (!firstOnPage) break;

          const currentTop =
            firstOnPage.getBoundingClientRect().top - containerRect.top;

          // Stop if this element is already on a later page
          if (currentTop >= pageStart + visualContentHeight) break;

          const gap = targetTop - currentTop;

          if (gap > 0) {
            const computedMargin =
              parseFloat(window.getComputedStyle(firstOnPage).marginTop) || 0;
            const newMargin = computedMargin + gap;
            firstOnPage.style.marginTop = `${newMargin}px`;

            const globalIndex = breakables.indexOf(firstOnPage);
            if (globalIndex !== -1) {
              const existingEdit = edits.find((e) => e.index === globalIndex);
              if (existingEdit) {
                existingEdit.newMargin = newMargin;
              } else {
                edits.push({ index: globalIndex, newMargin });
              }
            }
          }
        }
      }
    }

    // Orphaned-heading fix pass: run after main loop + column sync so that
    // we can detect headings stranded on a different page than their content.
    // This handles edge cases that slip through the single-pass main loop,
    // especially with very small margins (1–2mm).
    {
      const containerRect = measureContainer.getBoundingClientRect();
      for (let i = 0; i < breakables.length - 1; i++) {
        const heading = breakables[i];
        if (!heading.hasAttribute("data-keep-with-next")) continue;

        const next = breakables[i + 1];
        const headingTop = heading.getBoundingClientRect().top - containerRect.top;
        const nextTop = next.getBoundingClientRect().top - containerRect.top;

        const headingPage = Math.floor(headingTop / visualContentHeight);
        const nextPage = Math.floor(nextTop / visualContentHeight);

        // Orphaned: heading is on an earlier page than its following element
        if (headingPage < nextPage) {
          const targetTop = nextPage * visualContentHeight + effectiveMarginVPx;
          const gap = targetTop - headingTop;

          if (gap > 0) {
            const computedMargin =
              parseFloat(window.getComputedStyle(heading).marginTop) || 0;
            const newMargin = computedMargin + gap;
            heading.style.marginTop = `${newMargin}px`;

            const existingEdit = edits.find((e) => e.index === i);
            if (existingEdit) {
              existingEdit.newMargin = newMargin;
            } else {
              edits.push({ index: i, newMargin });
            }
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
  }, [
    visualContentHeight,
    engineContentHeight,
    effectiveMarginVPx,
    disableTopMarginPush,
    isColumnTemplate,
  ]);

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
