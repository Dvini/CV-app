import { describe, expect, it } from 'vitest';
import { displayUrl, formatUrl } from './url';
import { getPDFFileName } from './pdfExport';

describe('formatUrl', () => {
  it('adds https:// to bare domains', () => {
    expect(formatUrl('example.com/me')).toBe('https://example.com/me');
  });

  it('keeps existing http(s) links', () => {
    expect(formatUrl('http://example.com')).toBe('http://example.com');
    expect(formatUrl(' HTTPS://Example.com ')).toBe('HTTPS://Example.com');
  });

  it('does not treat a domain starting with "http" as a protocol', () => {
    expect(formatUrl('httpbin.org')).toBe('https://httpbin.org');
  });
});

describe('displayUrl', () => {
  it('strips protocol, www and trailing slash', () => {
    expect(displayUrl('https://www.linkedin.com/in/jan/')).toBe('linkedin.com/in/jan');
  });
});

describe('getPDFFileName', () => {
  it('builds the name from the full name', () => {
    expect(getPDFFileName('  Jan  Maria Kowalski ')).toBe('CV_Jan_Maria_Kowalski');
  });

  it('falls back to "CV"', () => {
    expect(getPDFFileName('')).toBe('CV');
    expect(getPDFFileName(undefined)).toBe('CV');
  });
});
