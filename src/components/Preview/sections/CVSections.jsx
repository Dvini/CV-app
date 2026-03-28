import React from 'react';
import { useCV } from '../../../context/CVContext';
import { cvTranslations } from '../../../constants/translations';
import './sections.css';

/* Shared heading class logic */
function useHeading() {
  const { template, themeColor, cvLanguage } = useCV();
  const t = cvTranslations[cvLanguage] || cvTranslations['pl'];

  const headingClass =
    template === 'minimalist'
      ? 'cv-heading cv-heading--minimalist cv-breakable'
      : 'cv-heading cv-heading--classic cv-breakable';

  return { headingClass, themeColor, t, template };
}

/* Personal / Summary */
export function SummarySection({ columnType }) {
  const { data, template } = useCV();
  const { headingClass, themeColor, t } = useHeading();
  if (!data.personal.summary) return null;

  return (
    <div className="cv-section">
      {template === 'twocolumn' && (
        <h2 className={headingClass} style={{ color: themeColor }} data-keep-with-next="true">{t.summary}</h2>
      )}
      <p className={`cv-text cv-breakable ${template !== 'twocolumn' ? 'cv-text--mt' : ''}`}>
        {data.personal.summary}
      </p>
    </div>
  );
}

/* Experience */
export function ExperienceSection({ columnType }) {
  const { data } = useCV();
  const { headingClass, themeColor, t } = useHeading();
  if (data.experience.length === 0) return null;

  const isSide = columnType === 'side';

  return (
    <div className="cv-section">
      <h2 className={headingClass} style={{ color: themeColor }} data-keep-with-next="true">{t.experience}</h2>
      <div className="cv-items">
        {data.experience.map((exp) => (
          <div key={exp.id} className="cv-item cv-breakable">
            <div className={`cv-item-header ${isSide ? 'cv-item-header--stacked' : ''}`}>
              <h3 className="cv-item-title">{exp.role}</h3>
              <span className={`cv-item-date ${isSide ? 'cv-item-date--stacked' : ''}`}>
                {exp.startDate} – {exp.endDate}
              </span>
            </div>
            <div className="cv-item-subtitle">{exp.company}</div>
            {exp.description && (
              <p className="cv-text cv-text--pre">{exp.description}</p>
            )}
            {exp.skills && (
              <p className="cv-tech">
                <span className="cv-tech-label">{t.tech} </span>
                {exp.skills}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Education */
export function EducationSection({ columnType }) {
  const { data } = useCV();
  const { headingClass, themeColor, t } = useHeading();
  if (data.education.length === 0) return null;

  const isSide = columnType === 'side';

  return (
    <div className="cv-section">
      <h2 className={headingClass} style={{ color: themeColor }} data-keep-with-next="true">{t.education}</h2>
      <div className="cv-items">
        {data.education.map((edu) => (
          <div key={edu.id} className="cv-item cv-breakable">
            <div className={`cv-item-header ${isSide ? 'cv-item-header--stacked' : ''}`}>
              <h3 className="cv-item-title">{edu.degree}</h3>
              <span className={`cv-item-date ${isSide ? 'cv-item-date--stacked' : ''}`}>
                {edu.startDate} – {edu.endDate}
              </span>
            </div>
            <div className="cv-item-subtitle">{edu.school}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Courses */
export function CoursesSection({ columnType }) {
  const { data } = useCV();
  const { headingClass, themeColor, t } = useHeading();
  if (data.courses.length === 0) return null;

  const isSide = columnType === 'side';

  return (
    <div className="cv-section">
      <h2 className={headingClass} style={{ color: themeColor }} data-keep-with-next="true">{t.courses}</h2>
      <div className="cv-items">
        {data.courses.map((course) => (
          <div key={course.id} className="cv-item cv-breakable">
            <div className={`cv-item-header ${isSide ? 'cv-item-header--stacked' : ''}`}>
              <h3 className="cv-item-title">{course.name}</h3>
              <span className={`cv-item-date ${isSide ? 'cv-item-date--stacked' : ''}`}>
                {course.startDate}
                {course.endDate ? ` – ${course.endDate}` : ''}
              </span>
            </div>
            <div className="cv-item-subtitle">{course.organizer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Skills */
export function SkillsSection() {
  const { data } = useCV();
  const { headingClass, themeColor, t } = useHeading();
  const skillsArray = data.skills
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');
  if (skillsArray.length === 0) return null;

  return (
    <div className="cv-section">
      <h2 className={headingClass} style={{ color: themeColor }} data-keep-with-next="true">{t.skills}</h2>
      <ul className="cv-skills-list">
        {skillsArray.map((skill, i) => (
          <li key={i} className="cv-breakable">{skill}</li>
        ))}
      </ul>
    </div>
  );
}

/* Languages */
export function LanguagesSection() {
  const { data } = useCV();
  const { headingClass, themeColor, t } = useHeading();
  if (!data.languages || data.languages.length === 0) return null;

  return (
    <div className="cv-section">
      <h2 className={headingClass} style={{ color: themeColor }} data-keep-with-next="true">{t.languages}</h2>
      <div className="cv-languages">
        {data.languages.map((lang) => (
          <div key={lang.id} className="cv-lang-row cv-breakable">
            <span className="cv-lang-name">{lang.name}</span>
            <span className="cv-lang-level">{lang.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Projects */
export function ProjectsSection({ columnType }) {
  const { data } = useCV();
  const { headingClass, themeColor, t } = useHeading();
  if (!data.projects || data.projects.length === 0) return null;

  const isSide = columnType === 'side';

  return (
    <div className="cv-section">
      <h2 className={headingClass} style={{ color: themeColor }} data-keep-with-next="true">{t.projects}</h2>
      <div className="cv-items">
        {data.projects.map((proj) => (
          <div key={proj.id} className="cv-item cv-breakable">
            <div className={`cv-item-header ${isSide ? 'cv-item-header--stacked' : ''}`}>
              <h3 className="cv-item-title">{proj.name}</h3>
              {proj.link && (
                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="cv-item-link">
                  {proj.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
            {proj.description && (
              <p className="cv-text cv-text--pre">{proj.description}</p>
            )}
            {proj.skills && (
              <p className="cv-tech">
                <span className="cv-tech-label">{t.tech} </span>
                {proj.skills}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Interests */
export function InterestsSection() {
  const { data } = useCV();
  const { headingClass, themeColor, t } = useHeading();
  const interestsArray = (data.interests || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');
  if (interestsArray.length === 0) return null;

  return (
    <div className="cv-section">
      <h2 className={headingClass} style={{ color: themeColor }} data-keep-with-next="true">{t.interests}</h2>
      <ul className="cv-skills-list">
        {interestsArray.map((interest, i) => (
          <li key={i} className="cv-breakable">{interest}</li>
        ))}
      </ul>
    </div>
  );
}

/* Clause */
export function ClauseSection() {
  const { data } = useCV();
  if (!data.showClause || !data.clause) return null;

  return (
    <div className="cv-clause">
      <p>{data.clause}</p>
    </div>
  );
}

/* Section dispatcher */
export function renderCVSection(sectionKey, columnType = 'full') {
  switch (sectionKey) {
    case 'personal': return <SummarySection key={sectionKey} columnType={columnType} />;
    case 'experience': return <ExperienceSection key={sectionKey} columnType={columnType} />;
    case 'education': return <EducationSection key={sectionKey} columnType={columnType} />;
    case 'courses': return <CoursesSection key={sectionKey} columnType={columnType} />;
    case 'skills': return <SkillsSection key={sectionKey} />;
    case 'languages': return <LanguagesSection key={sectionKey} />;
    case 'projects': return <ProjectsSection key={sectionKey} columnType={columnType} />;
    case 'interests': return <InterestsSection key={sectionKey} />;
    default: return null;
  }
}
