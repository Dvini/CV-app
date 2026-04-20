import React from 'react';
import { useCVData, useCVAppearance } from '../../../context/CVContext';
import { cvTranslations } from '../../../constants/translations';
import {
  User, Briefcase, GraduationCap, BookOpen, Code2, Globe,
  FolderOpen, Heart, Award, Users, FileText, HandHeart, SquarePen
} from 'lucide-react';
import type { SectionKey } from '../../../types/cv';
import './sections.css';

type ColumnType = 'full' | 'main' | 'side';

type CvTranslation = typeof cvTranslations['pl'];

const SECTION_ICONS: Record<SectionKey, React.FC<{ size?: number; className?: string }>> = {
  personal: User,
  experience: Briefcase,
  education: GraduationCap,
  courses: BookOpen,
  skills: Code2,
  languages: Globe,
  projects: FolderOpen,
  interests: Heart,
  certificates: Award,
  references: Users,
  publications: FileText,
  volunteer: HandHeart,
  custom: SquarePen,
};

/* Shared heading context */
function useHeading() {
  const { template, themeColor, cvLanguage, showSectionIcons } = useCVAppearance();
  const t: CvTranslation = cvTranslations[cvLanguage] || cvTranslations['pl'];

  const headingClass =
    template === 'minimalist'
      ? 'cv-heading cv-heading--minimalist cv-breakable'
      : 'cv-heading cv-heading--classic cv-breakable';

  return { headingClass, themeColor, t, template, showSectionIcons };
}

interface SectionHeadingProps {
  sectionKey: SectionKey;
  titleOverride?: string;
  headingClass: string;
  themeColor: string;
  t: CvTranslation;
  showSectionIcons: boolean;
}

function SectionHeading({ sectionKey, titleOverride, headingClass, themeColor, t, showSectionIcons }: SectionHeadingProps) {
  const title = titleOverride || t[sectionKey as keyof CvTranslation] || sectionKey;
  const Icon = showSectionIcons ? SECTION_ICONS[sectionKey] : null;
  return (
    <h2 className={`${headingClass} cv-breakable`} style={{ color: themeColor }} data-keep-with-next="true">
      {Icon && <Icon size={14} className="cv-heading-icon" />}
      {title}
    </h2>
  );
}

/* Personal / Summary */
export function SummarySection({ columnType }: { columnType?: ColumnType }) {
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons, template } = useHeading();
  if (!data.personal.summary) return null;

  return (
    <div className="cv-section">
      {template === 'twocolumn' && (
        <SectionHeading sectionKey="personal" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
      )}
      <p className={`cv-text cv-breakable ${template !== 'twocolumn' ? 'cv-text--mt' : ''}`}>
        {data.personal.summary}
      </p>
    </div>
  );
}

/* Experience */
export function ExperienceSection({ columnType }: { columnType?: ColumnType }) {
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  if (data.experience.length === 0) return null;

  const isSide = columnType === 'side';

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="experience" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
      <div className="cv-items">
        {data.experience.map((exp) => {
          const positions = exp.positions || [];
          return (
            <div key={exp.id} className="cv-item cv-breakable">
              {/* Company name */}
              <div className="cv-item-subtitle cv-company-name">{exp.company}</div>

              {/* Positions list */}
              {positions.length > 0 && (
                <div className={`cv-positions ${positions.length > 1 ? 'cv-positions--multi' : ''}`}>
                  {positions.map((pos) => (
                    <div key={pos.id} className={`cv-position-row ${isSide ? 'cv-position-row--stacked' : ''}`}>
                      <h3 className="cv-item-title">{pos.title}</h3>
                      <span className={`cv-item-date ${isSide ? 'cv-item-date--stacked' : ''}`}>
                        {pos.startDate} – {pos.endDate}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Shared description */}
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
          );
        })}
      </div>
    </div>
  );
}

/* Education */
export function EducationSection({ columnType }: { columnType?: ColumnType }) {
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  if (data.education.length === 0) return null;

  const isSide = columnType === 'side';

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="education" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
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
export function CoursesSection({ columnType }: { columnType?: ColumnType }) {
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  if (data.courses.length === 0) return null;

  const isSide = columnType === 'side';

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="courses" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
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
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  const skillsArray = data.skills
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');
  if (skillsArray.length === 0) return null;

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="skills" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
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
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  if (!data.languages || data.languages.length === 0) return null;

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="languages" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
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
export function ProjectsSection({ columnType }: { columnType?: ColumnType }) {
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  if (!data.projects || data.projects.length === 0) return null;

  const isSide = columnType === 'side';

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="projects" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
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
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  const interestsArray = (data.interests || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');
  if (interestsArray.length === 0) return null;

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="interests" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
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
  const { data } = useCVData();
  if (!data.showClause || !data.clause) return null;

  return (
    <div className="cv-clause">
      <p>{data.clause}</p>
    </div>
  );
}

/* Certificates */
export function CertificatesSection({ columnType }: { columnType?: ColumnType }) {
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  if (!data.certificates || data.certificates.length === 0) return null;

  const isSide = columnType === 'side';

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="certificates" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
      <div className="cv-items">
        {data.certificates.map((cert) => (
          <div key={cert.id} className="cv-item cv-breakable">
            <div className={`cv-item-header ${isSide ? 'cv-item-header--stacked' : ''}`}>
              <h3 className="cv-item-title">{cert.name}</h3>
              {cert.date && <span className={`cv-item-date ${isSide ? 'cv-item-date--stacked' : ''}`}>{cert.date}</span>}
            </div>
            {cert.issuer && <div className="cv-item-subtitle">{cert.issuer}</div>}
            {cert.credentialUrl && (
              <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="cv-item-link">
                {cert.credentialUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* References */
export function ReferencesSection({ columnType }: { columnType?: ColumnType }) {
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  if (!data.references || data.references.length === 0) return null;

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="references" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
      <div className="cv-items">
        {data.references.map((ref) => (
          <div key={ref.id} className="cv-item cv-breakable">
            <h3 className="cv-item-title">{ref.name}</h3>
            {ref.position && <div className="cv-item-subtitle">{ref.position}{ref.company ? `, ${ref.company}` : ''}</div>}
            {ref.contact && <div className="cv-text">{ref.contact}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Publications */
export function PublicationsSection({ columnType }: { columnType?: ColumnType }) {
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  if (!data.publications || data.publications.length === 0) return null;

  const isSide = columnType === 'side';

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="publications" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
      <div className="cv-items">
        {data.publications.map((pub) => (
          <div key={pub.id} className="cv-item cv-breakable">
            <div className={`cv-item-header ${isSide ? 'cv-item-header--stacked' : ''}`}>
              <h3 className="cv-item-title">{pub.title}</h3>
              {pub.date && <span className={`cv-item-date ${isSide ? 'cv-item-date--stacked' : ''}`}>{pub.date}</span>}
            </div>
            {pub.publisher && <div className="cv-item-subtitle">{pub.publisher}</div>}
            {pub.url && (
              <a href={pub.url} target="_blank" rel="noopener noreferrer" className="cv-item-link">
                {pub.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Volunteer */
export function VolunteerSection({ columnType }: { columnType?: ColumnType }) {
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  if (!data.volunteer || data.volunteer.length === 0) return null;

  const isSide = columnType === 'side';

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="volunteer" headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
      <div className="cv-items">
        {data.volunteer.map((vol) => (
          <div key={vol.id} className="cv-item cv-breakable">
            <div className={`cv-item-header ${isSide ? 'cv-item-header--stacked' : ''}`}>
              <h3 className="cv-item-title">{vol.role}</h3>
              <span className={`cv-item-date ${isSide ? 'cv-item-date--stacked' : ''}`}>
                {vol.startDate}{vol.endDate ? ` – ${vol.endDate}` : ''}
              </span>
            </div>
            {vol.organization && <div className="cv-item-subtitle">{vol.organization}</div>}
            {vol.description && <p className="cv-text cv-text--pre">{vol.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Custom section */
export function CustomSection({ columnType }: { columnType?: ColumnType }) {
  const { data } = useCVData();
  const { headingClass, themeColor, t, showSectionIcons } = useHeading();
  if (!data.custom || data.custom.length === 0) return null;

  const isSide = columnType === 'side';
  const sectionTitle = data.customSectionTitle || t.custom;

  return (
    <div className="cv-section">
      <SectionHeading sectionKey="custom" titleOverride={sectionTitle} headingClass={headingClass} themeColor={themeColor} t={t} showSectionIcons={showSectionIcons} />
      <div className="cv-items">
        {data.custom.map((item) => (
          <div key={item.id} className="cv-item cv-breakable">
            <div className={`cv-item-header ${isSide ? 'cv-item-header--stacked' : ''}`}>
              <h3 className="cv-item-title">{item.title}</h3>
              {item.date && <span className={`cv-item-date ${isSide ? 'cv-item-date--stacked' : ''}`}>{item.date}</span>}
            </div>
            {item.subtitle && <div className="cv-item-subtitle">{item.subtitle}</div>}
            {item.description && <p className="cv-text cv-text--pre">{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Section dispatcher */
export function renderCVSection(sectionKey: SectionKey, columnType: ColumnType = 'full'): React.ReactNode {
  switch (sectionKey) {
    case 'personal': return <SummarySection key={sectionKey} columnType={columnType} />;
    case 'experience': return <ExperienceSection key={sectionKey} columnType={columnType} />;
    case 'education': return <EducationSection key={sectionKey} columnType={columnType} />;
    case 'courses': return <CoursesSection key={sectionKey} columnType={columnType} />;
    case 'skills': return <SkillsSection key={sectionKey} />;
    case 'languages': return <LanguagesSection key={sectionKey} />;
    case 'projects': return <ProjectsSection key={sectionKey} columnType={columnType} />;
    case 'interests': return <InterestsSection key={sectionKey} />;
    case 'certificates': return <CertificatesSection key={sectionKey} columnType={columnType} />;
    case 'references': return <ReferencesSection key={sectionKey} columnType={columnType} />;
    case 'publications': return <PublicationsSection key={sectionKey} columnType={columnType} />;
    case 'volunteer': return <VolunteerSection key={sectionKey} columnType={columnType} />;
    case 'custom': return <CustomSection key={sectionKey} columnType={columnType} />;
    default: return null;
  }
}
