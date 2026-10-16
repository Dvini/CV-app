import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useCVData, useCVAppearance } from '../../context/hooks';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { TwoColumnTemplate } from './templates/TwoColumnTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';
import { CompactTemplate } from './templates/CompactTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { usePagination } from '../../hooks/usePagination';
import { A4_HEIGHT_PX, A4_WIDTH_PX, MM_TO_PX, FOOTER_TEXT_HEIGHT_PX, isColumnTemplate } from '../../constants/layout';
import { FONT_LOADERS, FONT_STACKS } from '../../constants/fonts';
import type { TemplateName } from '../../types/cv';
import './CVPreview.css';

function renderTemplate(template: TemplateName): React.ReactNode {
  switch (template) {
    case 'twocolumn':
      return <TwoColumnTemplate />;
    case 'minimalist':
      return <MinimalistTemplate />;
    case 'compact':
      return <CompactTemplate />;
    case 'creative':
      return <CreativeTemplate />;
    case 'classic':
    default:
      return <ClassicTemplate />;
  }
}

export function CVPreview({ className }: { className?: string }) {
  const { data } = useCVData();
  const appearance = useCVAppearance();
  const { template, fontFamily, fontSizeHeading, fontSizeText, getMarginValues, sectionGap, itemGap, cvLanguage } = appearance;
  const hasColumns = isColumnTemplate(template);

  useEffect(() => {
    // Font files load asynchronously; pagination re-measures when the layout changes size
    FONT_LOADERS[fontFamily]?.().catch(() => {
      /* offline or failed chunk — the fallback in the font stack is used */
    });
  }, [fontFamily]);

  // Pages keep the real A4 width (so the preview paginates like the PDF) and are scaled
  // down to fit narrower preview areas, e.g. on phones or next to a wide editor
  const scrollRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // ResizeObserver also reports the initial size right after observe()
    const observer = new ResizeObserver(() => {
      const style = getComputedStyle(el);
      const available = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      // 0 while the preview is hidden on mobile — keep the last scale until it is shown
      if (available > 0) setPreviewScale(Math.min(1, Math.floor((available / A4_WIDTH_PX) * 1000) / 1000));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fontFamilyValue = FONT_STACKS[fontFamily] ?? FONT_STACKS.sans;
  const showClauseFooter = !!(data.showClause && data.clause);
  const { v: marginV, h: marginH } = getMarginValues();
  const marginVPx = Math.round(marginV * MM_TO_PX);
  // Use the shared constant — single source of truth for footer height
  const footerHeightPx = showClauseFooter ? FOOTER_TEXT_HEIGHT_PX : 0;

  // Any appearance change re-splits the pages: it can move content inside one column (gaps,
  // column width, font size) without changing the total height the observers react to
  const recalcToken = useMemo(() => ({ appearance, data }), [appearance, data]);
  const { contentRef, pageCount, visualContentHeight } = usePagination({
    showClauseFooter,
    marginVMm: marginV,
    isColumnTemplate: hasColumns,
    recalcToken,
  });

  const renderedTemplate = renderTemplate(template);

  return (
    <main
      className={`preview-area${className ? ` ${className}` : ''}`}
      style={{
        '--cv-font-family': fontFamilyValue,
        '--cv-heading-scale': fontSizeHeading,
        '--cv-text-scale': fontSizeText,
        '--cv-section-gap': `${sectionGap}rem`,
        '--cv-item-gap': `${itemGap}rem`,
        '--cv-preview-scale': previewScale,
      } as React.CSSProperties}
    >
      <div className="preview-scroll" ref={scrollRef}>
        <div className="cv-pages-stack" lang={cvLanguage}>
          {/* Hidden measuring container */}
          <div
            className="cv-measure-container cv-dynamic-fonts"
            ref={contentRef}
            aria-hidden="true"
          >
            {renderedTemplate}
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
                  {pageIndex > 0 && marginVPx > 0 && !hasColumns && (
                    <div className="cv-page-top-margin" style={{ height: `${marginVPx}px` }} />
                  )}
                  <div
                    className="cv-content-offset"
                    style={{
                      transform: `translateY(-${pageIndex * visualContentHeight}px)`,
                      height: `${pageCount * visualContentHeight}px`,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {renderedTemplate}
                  </div>
                </div>

                {/* Footer block */}
                {showClauseFooter && (
                  <div
                    className="cv-page-footer-bar"
                    style={{ height: `${footerHeightPx}px` }}
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
