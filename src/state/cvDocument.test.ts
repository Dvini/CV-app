import { beforeEach, describe, expect, it } from 'vitest';
import { applySnapshot, documentToSnapshot, loadDocument } from './cvDocument';
import { DEFAULT_SNAPSHOT, defaultAppearance } from '../constants/defaults';

beforeEach(() => {
  localStorage.clear();
});

describe('loadDocument', () => {
  it('returns defaults when nothing is stored', () => {
    expect(documentToSnapshot(loadDocument())).toEqual(DEFAULT_SNAPSHOT);
  });

  it('migrates appearance from the legacy per-setting keys', () => {
    localStorage.setItem('cv_template', '"creative"');
    localStorage.setItem('cv_twoColSidebarWidth', '40');
    localStorage.setItem('cv_language', '"en"');
    localStorage.setItem('cv_fontFamily', '123'); // invalid → default
    const { appearance } = loadDocument();
    expect(appearance.template).toBe('creative');
    expect(appearance.twoColSidebarWidth).toBe(40);
    expect(appearance.cvLanguage).toBe('en');
    expect(appearance.fontFamily).toBe(defaultAppearance.fontFamily);
  });

  it('prefers the combined appearance key over legacy keys', () => {
    localStorage.setItem('cv_template', '"creative"');
    localStorage.setItem('cv_appearance', JSON.stringify({ template: 'compact' }));
    const { appearance } = loadDocument();
    expect(appearance.template).toBe('compact');
    expect(appearance.twoColSidebarWidth).toBe(defaultAppearance.twoColSidebarWidth);
  });

  it('normalizes corrupted data', () => {
    localStorage.setItem('cv_data', JSON.stringify({ experience: {}, skills: 7 }));
    localStorage.setItem('cv_sectionOrder', '"x"');
    const doc = loadDocument();
    expect(doc.data.experience).toEqual([]);
    expect(doc.data.skills).toBe('7');
    expect(doc.sectionOrder).toEqual(DEFAULT_SNAPSHOT.sectionOrder);
  });
});

describe('applySnapshot', () => {
  it('keeps current values for fields the snapshot lacks', () => {
    const current = loadDocument();
    const next = applySnapshot(current, { template: 'twocolumn', twoColSidebarWidth: 45 });
    expect(next.appearance.template).toBe('twocolumn');
    expect(next.appearance.twoColSidebarWidth).toBe(45);
    expect(next.appearance.themeColor).toBe(current.appearance.themeColor);
    expect(next.data).toBe(current.data);
  });

  it('round-trips through documentToSnapshot', () => {
    const doc = applySnapshot(loadDocument(), { template: 'compact', showContactIcons: true });
    expect(applySnapshot(loadDocument(), documentToSnapshot(doc))).toEqual(doc);
  });
});
