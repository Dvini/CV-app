import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useCV } from '../../context/CVContext';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { TwoColumnTemplate } from './templates/TwoColumnTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';
import './CVPreview.css';

const A4_HEIGHT_MM = 297;
const MM_TO_PX = 96 / 25.4; // 1mm ≈ 3.7795px at 96dpi
const A4_HEIGHT_PX = Math.round(A4_HEIGHT_MM * MM_TO_PX); // ~1123px
const MIN_FOOTER_PX = 24; // absolute minimum for the footer bar

export function CVPreview() {
  const { template, fontFamily, fontSizeHeading, fontSizeText, margins, customMargin, data, getMarginValues } = useCV();
  const contentRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);
  const [pageSpacers, setPageSpacers] = useState([]);

  useEffect(() => {
    if (fontFamily !== 'sans' && fontFamily !== 'serif') {
      const linkId = `font-${fontFamily.replace(/\s+/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, [fontFamily]);

  const getFontFamilyValue = () => {
    switch (fontFamily) {
      case 'sans': return 'Inter, system-ui, sans-serif';
      case 'serif': return 'Merriweather, Georgia, serif';
      case 'Roboto': return 'Roboto, sans-serif';
      case 'Open Sans': return '"Open Sans", sans-serif';
      case 'Montserrat': return 'Montserrat, sans-serif';
      case 'Lato': return 'Lato, sans-serif';
      case 'Playfair Display': return '"Playfair Display", serif';
      default: return 'Inter, system-ui, sans-serif';
    }
  };

  const showClauseFooter = data.showClause && data.clause;

  const { v: marginV, h: marginH } = getMarginValues(); // mm
  const marginVPx = Math.round(marginV * MM_TO_PX);
  
  // Footer visual height (allow more space for 2 lines)
  const footerTextHeightPx = showClauseFooter ? 36 : 0; 

  // How much of the CV page is visually sliced for this sheet
  // This dictates where the gray backgrounds are cut off.
  const visualContentHeight = A4_HEIGHT_PX - footerTextHeightPx;

  // The bottom limit for text. Text should never flow below the physical margin!
  const engineContentHeight = A4_HEIGHT_PX - Math.max(footerTextHeightPx, marginVPx);

  // 1. Measuring Engine
  useEffect(() => {
    if (!contentRef.current) return;

    const calculatePages = () => {
      const measureContainer = contentRef.current;
      
      // Reset all margins in measureContainer FIRST
      measureContainer.querySelectorAll('.cv-breakable').forEach(el => {
        el.style.marginTop = '';
      });
      
      const breakables = Array.from(measureContainer.querySelectorAll('.cv-breakable'));
      const marginVPx = Math.round(marginV * MM_TO_PX);
      const edits = [];

      for (let index = 0; index < breakables.length; index++) {
        const el = breakables[index];
        const elRect = el.getBoundingClientRect();
        const containerRect = measureContainer.getBoundingClientRect();
        
        const topRelative = elRect.top - containerRect.top;
        const bottomRelative = elRect.bottom - containerRect.top;
        
        const startPage = Math.floor((topRelative + 1) / visualContentHeight);
        const pageTextLimit = startPage * visualContentHeight + engineContentHeight;
        
        const pageTopLimit = startPage * visualContentHeight;
        const pageSafeTop = startPage * visualContentHeight + marginVPx;
        
        let needsPush = false;
        let targetY = 0;

        // Condition 1: Element crosses the bottom margin of the page
        if (bottomRelative - 1 > pageTextLimit && elRect.height < engineContentHeight) {
          needsPush = true;
          targetY = (startPage + 1) * visualContentHeight + marginVPx;
        } 
        // Condition 2: Element natively falls exactly in the top margin padding of a new page
        else if (startPage > 0 && topRelative >= pageTopLimit && topRelative < pageSafeTop) {
          needsPush = true;
          targetY = pageSafeTop;
        }
        
        if (needsPush) {
          let elementToPush = el;
          let pushAmount = targetY - topRelative;
          let pushIndex = index;

          // Check if previous element is a heading that we should drag along
          const prev = index > 0 ? breakables[index - 1] : null;

          if (prev && prev.hasAttribute('data-keep-with-next')) {
            // Ensure they belong to the same parent section wrapper
            if (prev.closest('.cv-section') === el.closest('.cv-section')) {
              const prevRect = prev.getBoundingClientRect();
              const prevTopRelative = prevRect.top - containerRect.top;
              
              elementToPush = prev;
              pushAmount = targetY - prevTopRelative;
              pushIndex = index - 1;
            }
          }
          
          if (pushAmount > 0) {
            const computedMargin = parseFloat(window.getComputedStyle(elementToPush).marginTop) || 0;
            const newMargin = computedMargin + pushAmount;
            elementToPush.style.marginTop = `${newMargin}px`;
            
            // Record the edit
            const existingEdit = edits.find(e => e.index === pushIndex);
            if (existingEdit) {
              existingEdit.newMargin = newMargin;
            } else {
              edits.push({ index: pushIndex, newMargin });
            }
          }
        }
      }

      const totalHeight = measureContainer.scrollHeight;
      const pages = Math.max(1, Math.ceil((totalHeight - 5) / visualContentHeight));
      if (pages !== pageCount) setPageCount(pages);

      const editsStr = JSON.stringify(edits);
      setPageSpacers(prev => JSON.stringify(prev) !== editsStr ? edits : prev);
    };

    const timer = setTimeout(calculatePages, 100);
    const observer = new ResizeObserver(() => setTimeout(calculatePages, 50));
    observer.observe(contentRef.current);
    const mutationObserver = new MutationObserver(() => setTimeout(calculatePages, 50));
    mutationObserver.observe(contentRef.current, { childList: true, subtree: true, characterData: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [template, margins, customMargin, visualContentHeight, engineContentHeight, marginV, data]);

  // 2. Clone Synchronization (runs after every render)
  useEffect(() => {
    const cloneContainers = document.querySelectorAll('.cv-preview-container .cv-content-offset');
    cloneContainers.forEach(container => {
      const breakables = container.querySelectorAll('.cv-breakable');
      
      // Reset first
      breakables.forEach(el => el.style.marginTop = '');
      
      // Apply calculated spacers
      pageSpacers.forEach(spacer => {
        if (breakables[spacer.index]) {
          breakables[spacer.index].style.marginTop = `${spacer.newMargin}px`;
        }
      });
    });
  });

  const renderTemplate = () => {
    switch (template) {
      case 'twocolumn':
        return <TwoColumnTemplate />;
      case 'minimalist':
        return <MinimalistTemplate />;
      case 'classic':
      default:
        return <ClassicTemplate />;
    }
  };

  return (
    <main className="preview-area" style={{
      '--cv-font-family': getFontFamilyValue(),
      '--cv-heading-scale': fontSizeHeading,
      '--cv-text-scale': fontSizeText
    }}>
      <div className="preview-scroll">
        <div className="cv-pages-stack">
          {/* Hidden measuring container */}
          <div
            className="cv-measure-container cv-dynamic-fonts"
            ref={contentRef}
            aria-hidden="true"
          >
            {renderTemplate()}
          </div>

          {/* Visible pages */}
          {Array.from({ length: pageCount }, (_, pageIndex) => (
            <div key={pageIndex} className="cv-page-sheet">
              <div className="cv-page-sheet-label">
                Strona {pageIndex + 1} z {pageCount}
              </div>
              <div
                className="cv-preview-container cv-dynamic-fonts"
                id={pageIndex === 0 ? 'cv-preview-container' : undefined}
                style={{ height: `${A4_HEIGHT_PX}px` }}
              >
                {/* Content area — clipped to visual height */}
                <div
                  className="cv-page-content-clip"
                  style={{ height: `${visualContentHeight}px` }}
                >
                  <div
                    className="cv-content-offset"
                    style={{
                      transform: `translateY(-${pageIndex * visualContentHeight}px)`,
                      height: `${pageCount * visualContentHeight}px`,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {renderTemplate()}
                  </div>
                </div>

                {/* Sibling Footer block */}
                {showClauseFooter && (
                  <div
                    className="cv-page-footer-bar"
                    style={{ height: `${footerTextHeightPx}px` }}
                  >
                    <div 
                      className="cv-page-footer-inner"
                      style={{ margin: `0 ${marginH}mm` }}
                    >
                      <p className="cv-page-footer-text">{data.clause}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Page count badge */}
        <div className="page-count-badge">
          {pageCount} {pageCount === 1 ? 'strona' : pageCount < 5 ? 'strony' : 'stron'}
        </div>
      </div>

      {/* Hidden print-only footer */}
      {showClauseFooter && (
        <div className="cv-print-footer" style={{ display: 'none' }}>
          {data.clause}
        </div>
      )}
    </main>
  );
}
