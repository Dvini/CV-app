import React from 'react';
import { useCVData, useCVAppearance } from '../../../context/CVContext';
import { renderCVSection } from '../sections/CVSections';
import { ContactInfo } from './shared';
import { getPhotoStyle } from '../../../utils/photoUtils';
import '../CVPreview.css';

export const TwoColumnTemplate = React.memo(function TwoColumnTemplate() {
  const { data, sectionOrder, sectionColumns } = useCVData();
  const {
    getMarginStyle, themeColor, showContactIcons,
    twoColLineWidth, twoColLineColor, twoColSidebarWidth,
    twoColSectionGap, twoColItemGap,
  } = useCVAppearance();
  const showClauseFooter = data.showClause && !!data.clause;
  const sideStyle = getMarginStyle('left-column', showClauseFooter);

  const sideSections = sectionOrder.filter((s) => sectionColumns[s] === 'side');
  const mainSections = sectionOrder.filter((s) => sectionColumns[s] === 'main');

  const cssVars = {
    '--tc-sidebar-w': `${twoColSidebarWidth}%`,
    '--tc-main-w': `${100 - twoColSidebarWidth}%`,
    '--tc-line-width': `${twoColLineWidth}px`,
    '--tc-line-color': twoColLineColor,
    '--tc-section-gap': `${twoColSectionGap}rem`,
    '--tc-item-gap': `${twoColItemGap}rem`,
  } as React.CSSProperties;

  return (
    <div className="cv-page template-twocolumn" style={cssVars}>
      <div className="cv-twocol">
        {/* Left (narrow) column */}
        <div className="cv-twocol-side" style={sideStyle}>
          {data.personal.showPhoto && data.personal.photo && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginLeft: `calc(-1 * ${sideStyle.paddingLeft})`,
                marginRight: `calc(-1 * ${sideStyle.paddingRight})`,
                marginBottom: '1.25rem',
              }}
            >
              <img
                src={data.personal.photo}
                alt={`Zdjęcie profilowe — ${data.personal.fullName || ''}`}
                className="cv-sidebar-photo"
                style={{ ...getPhotoStyle(data.personal) }}
              />
            </div>
          )}
          <h1 className="cv-name cv-name--small">{data.personal.fullName || 'Imię Nazwisko'}</h1>
          <div className="cv-title cv-title--small" style={{ color: themeColor }}>
            {data.personal.title}
          </div>

          <div className="cv-contact cv-contact--vertical">
            <ContactInfo personal={data.personal} linkClassName="cv-contact-break" showIcons={showContactIcons} />
          </div>

          <div className="cv-sidebar-sections">
            {sideSections.map((section) => renderCVSection(section, 'side'))}
          </div>
        </div>

        {/* Right (wider) column */}
        <div className="cv-twocol-main" style={getMarginStyle('right-column', showClauseFooter)}>
          {mainSections.map((section) => renderCVSection(section, 'main'))}
        </div>
      </div>
    </div>
  );
});
