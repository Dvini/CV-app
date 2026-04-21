import React, { useEffect } from 'react';
import { useCVData, useCVAppearance } from '../../context/CVContext';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { TwoColumnTemplate } from './templates/TwoColumnTemplate';
import { MinimalistTemplate } from './templates/MinimalistTemplate';
import { CompactTemplate } from './templates/CompactTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { usePagination } from '../../hooks/usePagination';
import { A4_HEIGHT_PX, MM_TO_PX, FOOTER_TEXT_HEIGHT_PX } from '../../constants/layout';
import type { TemplateName } from '../../types/cv';
import './CVPreview.css';

const FONT_FAMILY_MAP: Record<string, string> = {
  sans: 'Inter, system-ui, sans-serif',
  serif: 'Merriweather, Georgia, serif',
  Roboto: 'Roboto, sans-serif',
  'Open Sans': '"Open Sans", sans-serif',
  Montserrat: 'Montserrat, sans-serif',
  Lato: 'Lato, sans-serif',
  'Playfair Display': '"Playfair Display", serif',
};

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

export function CVPreview() {
  const { data } = useCVData();
  const { template, fontFamily, fontSizeHeading, fontSizeText, margins, customMargin, getMarginValues, sectionGap, itemGap } = useCVAppearance();
  const isColumnTemplate = template === 'twocolumn' || template === 'creative';

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

  const fontFamilyValue = FONT_FAMILY_MAP[fontFamily] || FONT_FAMILY_MAP.sans;
  const showClauseFooter = !!(data.showClause && data.clause);
  const { v: marginV, h: marginH } = getMarginValues();
  const marginVPx = Math.round(marginV * MM_TO_PX);
  // Use the shared constant — single source of truth for footer height
  const footerHeightPx = showClauseFooter ? FOOTER_TEXT_HEIGHT_PX : 0;

  const { contentRef, pageCount, visualContentHeight } = usePagination({
    showClauseFooter,
    marginVMm: marginV,
    isColumnTemplate,
    deps: [template, margins, customMargin, data],
  });

  const renderedTemplate = renderTemplate(template);

  return (
    <main
      className="preview-area"
      style={{
        '--cv-font-family': fontFamilyValue,
        '--cv-heading-scale': fontSizeHeading,
        '--cv-text-scale': fontSizeText,
        '--cv-section-gap': `${sectionGap}rem`,
        '--cv-item-gap': `${itemGap}rem`,
      } as React.CSSProperties}
    >
      <div className="preview-scroll">
        <div className="cv-pages-stack">
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
                  {pageIndex > 0 && marginVPx > 0 && !isColumnTemplate && (
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
