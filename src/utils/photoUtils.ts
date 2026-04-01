import type { Personal } from '../types/cv';

/**
 * Returns the CSS style object for the CV photo based on personal data settings.
 * Pure function — no side effects, no context dependency.
 */
export function getPhotoStyle(personal: Personal): React.CSSProperties {
  const shape = personal.photoShape || 'round';
  const size = personal.photoSize || 80;

  let borderRadius = '50%';
  let aspectRatio = '1 / 1';

  if (shape === 'square') {
    borderRadius = '8px';
  } else if (shape === 'rectangle-portrait') {
    borderRadius = '8px';
    aspectRatio = '3 / 4';
  } else if (shape === 'rectangle-landscape') {
    borderRadius = '8px';
    aspectRatio = '4 / 3';
  }

  return {
    width: `${size}px`,
    height: 'auto',
    aspectRatio,
    borderRadius,
    objectFit: 'cover',
  };
}
