import React from 'react';
import { useCV } from '../../../context/CVContext';
import { renderCVSection } from '../sections/CVSections';
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
              {data.personal.website && (
                <a href={data.personal.website.startsWith('http') ? data.personal.website : `https://${data.personal.website}`} target="_blank" rel="noopener noreferrer">
                  {data.personal.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </a>
              )}
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
