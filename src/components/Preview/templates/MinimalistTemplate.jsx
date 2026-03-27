import React from 'react';
import { useCV } from '../../../context/CVContext';
import { renderCVSection } from '../sections/CVSections';
import '../CVPreview.css';

export function MinimalistTemplate() {
  const { data, sectionOrder, getMarginStyle, themeColor } = useCV();
  const showClauseFooter = data.showClause && !!data.clause;

  return (
    <div className="cv-page template-minimalist" style={getMarginStyle('container', showClauseFooter)}>
      {/* Header */}
      <header className="cv-header cv-header--minimalist">
        {data.personal.showPhoto && data.personal.photo && (
          <img src={data.personal.photo} alt="" className="cv-header-photo cv-header-photo--minimalist" />
        )}
        <h1 className="cv-name cv-name--minimalist">
          {data.personal.fullName || 'Imię Nazwisko'}
        </h1>
        <div className="cv-title" style={{ color: themeColor }}>
          {data.personal.title}
        </div>
        <div className="cv-contact cv-contact--center">
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.location && <span>{data.personal.location}</span>}
          {data.personal.linkedin && (
            <a href={data.personal.linkedin.startsWith('http') ? data.personal.linkedin : `https://${data.personal.linkedin}`} target="_blank" rel="noopener noreferrer">
              {data.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </a>
          )}
          {data.personal.github && (
            <a href={data.personal.github.startsWith('http') ? data.personal.github : `https://${data.personal.github}`} target="_blank" rel="noopener noreferrer">
              {data.personal.github.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
            </a>
          )}
        </div>
      </header>

      {/* Sections */}
      <div className="cv-body">
        {sectionOrder.map((section) => renderCVSection(section, 'full'))}
      </div>

    </div>
  );
}
