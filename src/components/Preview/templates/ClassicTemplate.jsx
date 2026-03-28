import React from 'react';
import { useCV } from '../../../context/CVContext';
import { renderCVSection } from '../sections/CVSections';
import { ContactInfo } from './shared';
import '../CVPreview.css';

export function ClassicTemplate() {
  const { data, sectionOrder, getMarginStyle, getPhotoStyle, themeColor } = useCV();
  const showClauseFooter = data.showClause && !!data.clause;

  return (
    <div className="cv-page template-classic" style={getMarginStyle('container', showClauseFooter)}>
      {/* Header */}
      <header className="cv-header">
        <div className="cv-header-content">
          {data.personal.showPhoto && data.personal.photo && (
            <img src={data.personal.photo} alt={`Zdjęcie profilowe — ${data.personal.fullName || ''}`} className="cv-header-photo" style={{ ...getPhotoStyle() }} />
          )}
          <div className="cv-header-text">
            <h1 className="cv-name">{data.personal.fullName || 'Imię Nazwisko'}</h1>
            <div className="cv-title" style={{ color: themeColor }}>{data.personal.title}</div>
            <div className="cv-contact">
              <ContactInfo personal={data.personal} />
            </div>
          </div>
        </div>
      </header>

      {/* Sections */}
      <div className="cv-body">
        {sectionOrder.map((section) => renderCVSection(section, 'full'))}
      </div>

    </div>
  );
}
