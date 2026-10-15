/** Ensures a user-entered link is absolute, so it works in the exported PDF. */
export function formatUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Strips protocol, `www.` and trailing slash for a cleaner on-page label. */
export function displayUrl(url: string): string {
  return url.trim().replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
}
