import type { CVData, CVLanguage } from '../types/cv';

const LT_API = 'https://api.languagetool.org/v2/check';
const LT_LANG_MAP: Record<CVLanguage, string> = { pl: 'pl-PL', en: 'en-US' };

export interface SpellText {
  label: string;
  text: string;
}

export interface SpellIssue {
  message: string;
  context: string;
  offset: number;
  length: number;
  replacements: string[];
  rule?: string;
}

/** Subset of the LanguageTool /v2/check response that we use. */
interface LTMatch {
  message: string;
  context?: { text?: string; offset?: number; length?: number };
  replacements?: { value: string }[];
  rule?: { id?: string };
}

export function extractTexts(data: CVData): SpellText[] {
  const texts: SpellText[] = [];
  const add = (label: string, value: string | undefined) => {
    if (value && value.trim()) {
      texts.push({ label, text: value.trim() });
    }
  };

  const p = data.personal || {};
  add('Imię i nazwisko', p.fullName);
  add('Tytuł zawodowy', p.title);
  add('Podsumowanie', p.summary);

  (data.experience || []).forEach((item, i) => {
    (item.positions || []).forEach((pos, j) => {
      add(`Doświadczenie #${i + 1} — stanowisko #${j + 1}`, pos.title);
    });
    add(`Doświadczenie #${i + 1} — firma`, item.company);
    add(`Doświadczenie #${i + 1} — opis`, item.description);
  });

  (data.education || []).forEach((item, i) => {
    add(`Edukacja #${i + 1} — uczelnia`, item.school);
    add(`Edukacja #${i + 1} — kierunek`, item.degree);
  });

  (data.projects || []).forEach((item, i) => {
    add(`Projekt #${i + 1} — nazwa`, item.name);
    add(`Projekt #${i + 1} — opis`, item.description);
  });

  (data.courses || []).forEach((item, i) => {
    add(`Kurs #${i + 1} — nazwa`, item.name);
    add(`Kurs #${i + 1} — organizator`, item.organizer);
  });

  (data.certificates || []).forEach((item, i) => {
    add(`Certyfikat #${i + 1} — nazwa`, item.name);
    add(`Certyfikat #${i + 1} — wydawca`, item.issuer);
  });

  (data.publications || []).forEach((item, i) => {
    add(`Publikacja #${i + 1} — tytuł`, item.title);
    add(`Publikacja #${i + 1} — wydawca`, item.publisher);
  });

  (data.volunteer || []).forEach((item, i) => {
    add(`Wolontariat #${i + 1} — rola`, item.role);
    add(`Wolontariat #${i + 1} — organizacja`, item.organization);
    add(`Wolontariat #${i + 1} — opis`, item.description);
  });

  (data.references || []).forEach((item, i) => {
    add(`Referencja #${i + 1} — stanowisko`, item.position);
  });

  (data.custom || []).forEach((item, i) => {
    add(`Sekcja własna #${i + 1} — tytuł`, item.title);
    add(`Sekcja własna #${i + 1} — podtytuł`, item.subtitle);
    add(`Sekcja własna #${i + 1} — opis`, item.description);
  });

  add('Zainteresowania', data.interests);

  add('Tytuł sekcji własnej', data.customSectionTitle);

  return texts;
}

export async function checkSpelling(texts: SpellText[], language: CVLanguage = 'pl'): Promise<SpellIssue[]> {
  const lang = LT_LANG_MAP[language] || 'pl-PL';
  const combined = texts.map((t) => t.text).join('\n\n');

  if (!combined.trim()) return [];

  const params = new URLSearchParams({
    text: combined,
    language: lang,
    enabledOnly: 'false',
  });

  const res = await fetch(LT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`LanguageTool API error: ${res.status}`);
  }

  const result: { matches?: LTMatch[] } = await res.json();

  return (result.matches || []).map((m) => ({
    message: m.message,
    context: m.context?.text || '',
    offset: m.context?.offset || 0,
    length: m.context?.length || 0,
    replacements: (m.replacements || []).slice(0, 3).map((r) => r.value),
    rule: m.rule?.id,
  }));
}

