import React from 'react';
import { useCVData, useCVAppearance } from '../../../context/CVContext';
import { renderCVSection } from '../sections/CVSections';
import { ContactInfo } from './shared';
import '../CVPreview.css';

export const MinimalistTemplate = React.memo(function MinimalistTemplate() {
  const { data, sectionOrder, getPhotoStyle } = useCVData();
  const { getMarginStyle, themeColor } = useCVAppearance();
  const showClauseFooter = data.showClause && !!data.clause;

  return (
    <div className="cv-page template-minimalist" style={getMarginStyle('container', showClauseFooter)}>
      {/* Header */}
      <header className="cv-header cv-header--minimalist">
        {data.personal.showPhoto && data.personal.photo && (
          <img src={data.personal.photo} alt={`Zdjęcie profilowe — ${data.personal.fullName || ''}`} className="cv-header-photo cv-header-photo--minimalist" style={{ ...getPhotoStyle(), marginBottom: '0.75rem' }} />
        )}
        <h1 className="cv-name cv-name--minimalist">
          {data.personal.fullName || 'Imię Nazwisko'}
        </h1>
        <div className="cv-title" style={{ color: themeColor }}>
          {data.personal.title}
        </div>
        <div className="cv-contact cv-contact--center">
          <ContactInfo personal={data.personal} />
        </div>
      </header>

      {/* Sections */}
      <div className="cv-body">
        {sectionOrder.map((section) => renderCVSection(section, 'full'))}
      </div>

    </div>
  );
});
