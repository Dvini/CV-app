import React from 'react';
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
}

export function ContactLink({ url, className }: ContactLinkProps) {
  if (!url) return null;
  return (
    <a href={formatUrl(url)} target="_blank" rel="noopener noreferrer" className={className}>
      {displayUrl(url)}
    </a>
  );
}

interface ContactInfoProps {
  personal: Personal;
  className?: string;
  linkClassName?: string;
}

export function ContactInfo({ personal, className, linkClassName }: ContactInfoProps) {
  const spanClass = linkClassName || className;
  return (
    <>
      {personal.email && <span className={spanClass}>{personal.email}</span>}
      {personal.phone && <span className={spanClass}>{personal.phone}</span>}
      {personal.location && <span className={spanClass}>{personal.location}</span>}
      {personal.linkedin && <ContactLink url={personal.linkedin} className={linkClassName} />}
      {personal.github && <ContactLink url={personal.github} className={linkClassName} />}
      {personal.website && <ContactLink url={personal.website} className={linkClassName} />}
    </>
  );
}
