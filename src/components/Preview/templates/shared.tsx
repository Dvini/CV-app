import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, Globe } from 'lucide-react';
import type { Personal } from '../../../types/cv';

function formatUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`;
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

interface ContactLinkProps {
  url: string;
  className?: string;
  icon?: React.ReactNode;
}

export function ContactLink({ url, className, icon }: ContactLinkProps) {
  if (!url) return null;
  return (
    <a href={formatUrl(url)} target="_blank" rel="noopener noreferrer" className={className}>
      {icon}
      {displayUrl(url)}
    </a>
  );
}

interface ContactInfoProps {
  personal: Personal;
  className?: string;
  linkClassName?: string;
  /** When true, shows small icons before each contact item */
  showIcons?: boolean;
}

export function ContactInfo({ personal, className, linkClassName, showIcons = false }: ContactInfoProps) {
  const spanClass = linkClassName || className;
  const iconProps = { size: 11, style: { flexShrink: 0, marginRight: '0.2em', verticalAlign: 'middle', position: 'relative' as const, top: '-0.05em' } };

  return (
    <>
      {personal.email && (
        <span className={spanClass}>
          {showIcons && <Mail {...iconProps} />}
          {personal.email}
        </span>
      )}
      {personal.phone && (
        <span className={spanClass}>
          {showIcons && <Phone {...iconProps} />}
          {personal.phone}
        </span>
      )}
      {personal.location && (
        <span className={spanClass}>
          {showIcons && <MapPin {...iconProps} />}
          {personal.location}
        </span>
      )}
      {personal.linkedin && (
        <ContactLink
          url={personal.linkedin}
          className={linkClassName}
          icon={showIcons ? <ExternalLink {...iconProps} /> : undefined}
        />
      )}
      {personal.github && (
        <ContactLink
          url={personal.github}
          className={linkClassName}
          icon={showIcons ? <ExternalLink {...iconProps} /> : undefined}
        />
      )}
      {personal.website && (
        <ContactLink
          url={personal.website}
          className={linkClassName}
          icon={showIcons ? <Globe {...iconProps} /> : undefined}
        />
      )}
    </>
  );
}
