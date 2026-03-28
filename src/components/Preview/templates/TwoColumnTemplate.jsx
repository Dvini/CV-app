import React from 'react';
import { useCV } from '../../../context/CVContext';
import { renderCVSection } from '../sections/CVSections';
import '../CVPreview.css';

export function TwoColumnTemplate() {
  const { data, sectionOrder, sectionColumns, getMarginStyle, getPhotoStyle, themeColor } = useCV();
  const showClauseFooter = data.showClause && !!data.clause;

  const sideSections = sectionOrder.filter((s) => sectionColumns[s] === 'side');
  const mainSections = sectionOrder.filter((s) => sectionColumns[s] === 'main');

  return (
    <div className="cv-page template-twocolumn">
      <div className="cv-twocol">
        {/* Left (narrow) column */}
        <div className="cv-twocol-side" style={getMarginStyle('left-column', showClauseFooter)}>
          {/* Personal info in sidebar */}
          {data.personal.showPhoto && data.personal.photo && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <img src={data.personal.photo} alt={`Zdjęcie profilowe — ${data.personal.fullName || ''}`} className="cv-sidebar-photo" style={{ ...getPhotoStyle() }} />
            </div>
          )}
          <h1 className="cv-name cv-name--small">{data.personal.fullName || 'Imię Nazwisko'}</h1>
          <div className="cv-title cv-title--small" style={{ color: themeColor }}>
            {data.personal.title}
          </div>

          <div className="cv-contact cv-contact--vertical">
            {data.personal.email && <span className="cv-contact-break">{data.personal.email}</span>}
            {data.personal.phone && <span>{data.personal.phone}</span>}
            {data.personal.location && <span>{data.personal.location}</span>}
            {data.personal.linkedin && (
              <a href={data.personal.linkedin.startsWith('http') ? data.personal.linkedin : `https://${data.personal.linkedin}`} target="_blank" rel="noopener noreferrer" className="cv-contact-break">
                {data.personal.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              </a>
            )}
            {data.personal.github && (
              <a href={data.personal.github.startsWith('http') ? data.personal.github : `https://${data.personal.github}`} target="_blank" rel="noopener noreferrer" className="cv-contact-break">
                {data.personal.github.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              </a>
            )}
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
}
