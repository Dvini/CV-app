import React from 'react';

function formatUrl(url) {
  return url.startsWith('http') ? url : `https://${url}`;
}

function displayUrl(url) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

export function ContactLink({ url, className }) {
  if (!url) return null;
  return (
    <a href={formatUrl(url)} target="_blank" rel="noopener noreferrer" className={className}>
      {displayUrl(url)}
    </a>
  );
}

export function ContactInfo({ personal, className, linkClassName }) {
  return (
    <>
      {personal.email && <span className={linkClassName}>{personal.email}</span>}
      {personal.phone && <span>{personal.phone}</span>}
      {personal.location && <span>{personal.location}</span>}
      {personal.linkedin && <ContactLink url={personal.linkedin} className={linkClassName} />}
      {personal.github && <ContactLink url={personal.github} className={linkClassName} />}
      {personal.website && <ContactLink url={personal.website} className={linkClassName} />}
    </>
  );
}
