import { describe, expect, it } from 'vitest';
import {
  normalizeCVData,
  normalizeProfiles,
  normalizeSectionColumns,
  normalizeSectionOrder,
  parseSnapshotJSON,
} from './cvSchema';
import { DEFAULT_SNAPSHOT, defaultSectionOrder } from '../constants/defaults';

describe('parseSnapshotJSON', () => {
  it('rejects text that is not JSON', () => {
    const result = parseSnapshotJSON('{oops');
    expect(result).toEqual({ ok: false, error: 'To nie jest poprawny plik JSON.' });
  });

  it('rejects JSON without CV data', () => {
    const result = parseSnapshotJSON('{"name":"some-package"}');
    expect(result.ok).toBe(false);
  });

  it('round-trips the default snapshot, including every appearance field', () => {
    const result = parseSnapshotJSON(JSON.stringify(DEFAULT_SNAPSHOT));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot).toEqual(DEFAULT_SNAPSHOT);
  });

  it('repairs a structurally valid but malformed file instead of rejecting it', () => {
    const result = parseSnapshotJSON(JSON.stringify({
      data: {
        personal: { fullName: 42, photo: 'https://tracker.example/pixel.png' },
        experience: {},
        education: [{ school: { nested: true }, degree: 5 }, 'junk'],
      },
      template: 'nonexistent',
      themeColor: 'red;background:url(x)',
      twoColSidebarWidth: 40,
      creativeHeaderImage: 'https://example.com/header.png',
      sectionOrder: ['skills', 'skills', 'bogus'],
    }));

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const { snapshot } = result;
    expect(snapshot.data!.personal.fullName).toBe('42');
    expect(snapshot.data!.personal.photo).toBeNull();
    expect(snapshot.data!.experience).toEqual([]);
    expect(snapshot.data!.education).toEqual([
      { id: 'education-0', school: '', degree: '5', startDate: '', endDate: '' },
    ]);
    expect(snapshot.template).toBeUndefined();
    expect(snapshot.themeColor).toBeUndefined();
    expect(snapshot.twoColSidebarWidth).toBe(40);
    expect(snapshot.creativeHeaderImage).toBeNull();
    expect(snapshot.sectionOrder![0]).toBe('skills');
    expect(snapshot.sectionOrder).toHaveLength(defaultSectionOrder.length);
  });

  it('leaves out appearance fields absent from older files', () => {
    const result = parseSnapshotJSON(JSON.stringify({ data: {}, template: 'compact' }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.template).toBe('compact');
    expect('twoColSidebarWidth' in result.snapshot).toBe(false);
    expect('sectionOrder' in result.snapshot).toBe(false);
  });
});

describe('normalizeCVData', () => {
  it('returns defaults for non-object input', () => {
    expect(normalizeCVData(null)).toEqual(DEFAULT_SNAPSHOT.data);
    expect(normalizeCVData('x')).toEqual(DEFAULT_SNAPSHOT.data);
  });

  it('migrates the legacy single-role experience format to positions[]', () => {
    const data = normalizeCVData({
      experience: [{ id: 'e1', company: 'A', role: 'Dev', startDate: '2020', endDate: '2021' }],
    });
    expect(data.experience[0].positions).toEqual([
      { id: 'e1-pos-migrated', title: 'Dev', startDate: '2020', endDate: '2021' },
    ]);
  });

  it('keeps embedded photos', () => {
    const photo = 'data:image/jpeg;base64,AAAA';
    expect(normalizeCVData({ personal: { photo } }).personal.photo).toBe(photo);
  });

  it('coerces text fields stored with the wrong type', () => {
    const data = normalizeCVData({ skills: 7, clause: null, showClause: 'yes' });
    expect(data.skills).toBe('7');
    expect(data.clause).toBe('');
    expect(data.showClause).toBe(DEFAULT_SNAPSHOT.data.showClause);
  });
});

describe('section layout', () => {
  it('appends missing sections and drops unknown ones', () => {
    const order = normalizeSectionOrder(['custom', 'nope']);
    expect(order[0]).toBe('custom');
    expect(new Set(order)).toEqual(new Set(defaultSectionOrder));
  });

  it('keeps valid column assignments only', () => {
    const columns = normalizeSectionColumns({ skills: 'main', experience: 'left' });
    expect(columns.skills).toBe('main');
    expect(columns.experience).toBe(DEFAULT_SNAPSHOT.sectionColumns.experience);
  });
});

describe('normalizeProfiles', () => {
  it('drops malformed and duplicate profiles', () => {
    expect(normalizeProfiles([{ id: 'a', name: 'A' }, { id: 'a' }, 'x', { name: 'no id' }])).toEqual([
      { id: 'a', name: 'A' },
    ]);
  });

  it('returns undefined when nothing usable is left', () => {
    expect(normalizeProfiles('x')).toBeUndefined();
    expect(normalizeProfiles([])).toBeUndefined();
  });
});
