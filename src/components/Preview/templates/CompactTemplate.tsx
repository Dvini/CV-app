import React from 'react';
import { useCVData, useCVAppearance } from '../../../context/hooks';
import { CVSection } from '../sections/CVSections';
import { ContactInfo } from './shared';
import { getPhotoStyle } from '../../../utils/photoUtils';
import { useCVTranslation } from '../../../hooks/useCVTranslation';
import '../CVPreview.css';

export const CompactTemplate = React.memo(function CompactTemplate() {
  const { data, sectionOrder } = useCVData();
  const t = useCVTranslation();
  const { getMarginStyle, themeColor, showContactIcons } = useCVAppearance();
  const showClauseFooter = data.showClause && !!data.clause;

  return (
    <div className="cv-page template-compact" style={getMarginStyle('container', showClauseFooter)}>
      <header className="cv-header cv-header--compact">
        <div className="cv-header-compact-top">
          {data.personal.showPhoto && data.personal.photo && (
            <img
              src={data.personal.photo}
              alt={[t.photoAlt, data.personal.fullName].filter(Boolean).join(' — ')}
              className="cv-header-photo cv-header-photo--compact"
              style={{ ...getPhotoStyle(data.personal), maxWidth: '60px', maxHeight: '60px' }}
            />
          )}
          <div className="cv-header-compact-info">
            <h1 className="cv-name cv-name--compact">{data.personal.fullName || t.namePlaceholder}</h1>
            <div className="cv-title cv-title--compact" style={{ color: themeColor }}>
              {data.personal.title}
            </div>
          </div>
        </div>
        <div className="cv-contact cv-contact--compact">
          <ContactInfo personal={data.personal} showIcons={showContactIcons} />
        </div>
      </header>

      <div className="cv-body cv-body--compact">
        {sectionOrder.map((section) => <CVSection key={section} sectionKey={section} columnType="full" />)}
      </div>
    </div>
  );
});
