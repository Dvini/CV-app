import React from 'react';
import { useCVData, useCVAppearance } from '../../../context/CVContext';
import { renderCVSection } from '../sections/CVSections';
import { ContactInfo } from './shared';
import { getPhotoStyle } from '../../../utils/photoUtils';
import '../CVPreview.css';

export const CreativeTemplate = React.memo(function CreativeTemplate() {
  const { data, sectionOrder, sectionColumns } = useCVData();
  const { getMarginStyle, creativeHeaderBg, showContactIcons } = useCVAppearance();
  const showClauseFooter = data.showClause && !!data.clause;

  const sideSections = sectionOrder.filter((s) => sectionColumns[s] === 'side');
  const mainSections = sectionOrder.filter((s) => sectionColumns[s] === 'main');

  const containerStyle = getMarginStyle('container', true);

  return (
    <div className="cv-page template-creative">
      {/* Colored header band */}
      <header className="cv-header--creative" style={{ background: creativeHeaderBg }}>
        <div
          className="cv-header-creative-inner"
          style={{
            padding: `${containerStyle.paddingTop} ${containerStyle.paddingRight} 1rem ${containerStyle.paddingLeft}`,
          }}
        >
          <div className="cv-header-creative-row">
            {data.personal.showPhoto && data.personal.photo && (
              <img
                src={data.personal.photo}
                alt={`Zdjęcie profilowe — ${data.personal.fullName || ''}`}
                className="cv-header-photo cv-header-photo--creative"
                style={{ ...getPhotoStyle(data.personal), border: '3px solid rgba(255,255,255,0.5)' }}
              />
            )}
            <div className="cv-header-creative-text">
              <h1 className="cv-name cv-name--creative">{data.personal.fullName || 'Imię Nazwisko'}</h1>
              <div className="cv-title cv-title--creative">{data.personal.title}</div>
              <div className="cv-contact cv-contact--creative">
                <ContactInfo personal={data.personal} linkClassName="cv-contact-creative-link" showIcons={showContactIcons} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Two-column body */}
      <div className="cv-creative-body">
        <div
          className="cv-creative-side"
          style={{
            paddingLeft: getMarginStyle('container', showClauseFooter).paddingLeft,
            paddingTop: '1rem',
            paddingBottom: showClauseFooter ? '0' : getMarginStyle('container', false).paddingBottom,
            paddingRight: '0.75rem',
          }}
        >
          {sideSections.map((section) => renderCVSection(section, 'side'))}
        </div>
        <div
          className="cv-creative-main"
          style={{
            paddingRight: getMarginStyle('container', showClauseFooter).paddingRight,
            paddingTop: '1rem',
            paddingBottom: showClauseFooter ? '0' : getMarginStyle('container', false).paddingBottom,
            paddingLeft: '0.75rem',
          }}
        >
          {mainSections.map((section) => renderCVSection(section, 'main'))}
        </div>
      </div>
    </div>
  );
});
