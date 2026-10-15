import React from 'react';
import { useCVData, useCVAppearance } from '../../../context/hooks';
import { CVSection } from '../sections/CVSections';
import { ContactInfo } from './shared';
import { getPhotoStyle } from '../../../utils/photoUtils';
import { useCVTranslation } from '../../../hooks/useCVTranslation';
import '../CVPreview.css';

export const MinimalistTemplate = React.memo(function MinimalistTemplate() {
  const { data, sectionOrder } = useCVData();
  const t = useCVTranslation();
  const { getMarginStyle, themeColor, showContactIcons } = useCVAppearance();
  const showClauseFooter = data.showClause && !!data.clause;

  return (
    <div className="cv-page template-minimalist" style={getMarginStyle('container', showClauseFooter)}>
      <header className="cv-header cv-header--minimalist">
        {data.personal.showPhoto && data.personal.photo && (
          <img
            src={data.personal.photo}
            alt={[t.photoAlt, data.personal.fullName].filter(Boolean).join(' — ')}
            className="cv-header-photo cv-header-photo--minimalist"
            style={{ ...getPhotoStyle(data.personal), marginBottom: '0.75rem' }}
          />
        )}
        <h1 className="cv-name cv-name--minimalist">
          {data.personal.fullName || t.namePlaceholder}
        </h1>
        <div className="cv-title" style={{ color: themeColor }}>
          {data.personal.title}
        </div>
        <div className="cv-contact cv-contact--center">
          <ContactInfo personal={data.personal} showIcons={showContactIcons} />
        </div>
      </header>

      <div className="cv-body">
        {sectionOrder.map((section) => <CVSection key={section} sectionKey={section} columnType="full" />)}
      </div>
    </div>
  );
});
