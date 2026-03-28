// @ts-nocheck
const LT_API = 'https://api.languagetool.org/v2/check';
const LT_LANG_MAP = { pl: 'pl-PL', en: 'en-US' };

export function extractTexts(data) {
  const texts = [];
  const add = (label, value) => {
    if (value && typeof value === 'string' && value.trim()) {
      texts.push({ label, text: value.trim() });
    }
  };

  const p = data.personal || {};
  add('Imię i nazwisko', p.fullName);
  add('Tytuł zawodowy', p.title);
  add('Podsumowanie', p.summary);

  (data.experience || []).forEach((item, i) => {
    add(`Doświadczenie #${i + 1} — stanowisko`, item.position);
    add(`Doświadczenie #${i + 1} — firma`, item.company);
    add(`Doświadczenie #${i + 1} — opis`, item.description);
  });

  (data.education || []).forEach((item, i) => {
    add(`Edukacja #${i + 1} — uczelnia`, item.institution);
    add(`Edukacja #${i + 1} — kierunek`, item.degree);
    add(`Edukacja #${i + 1} — opis`, item.description);
  });

  (data.projects || []).forEach((item, i) => {
    add(`Projekt #${i + 1} — nazwa`, item.name);
    add(`Projekt #${i + 1} — opis`, item.description);
  });

  (data.courses || []).forEach((item, i) => {
    add(`Kurs #${i + 1} — nazwa`, item.name);
    add(`Kurs #${i + 1} — organizator`, item.organizer);
  });

  (data.custom || []).forEach((item, i) => {
    add(`Sekcja własna #${i + 1} — tytuł`, item.title);
    add(`Sekcja własna #${i + 1} — opis`, item.description);
  });

  add('Tytuł sekcji własnej', data.customSectionTitle);

  return texts;
}

export async function checkSpelling(texts, language = 'pl') {
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

  const result = await res.json();

  return (result.matches || []).map((m) => ({
    message: m.message,
    context: m.context?.text || '',
    offset: m.context?.offset || 0,
    length: m.context?.length || 0,
    replacements: (m.replacements || []).slice(0, 3).map((r) => r.value),
    rule: m.rule?.id,
  }));
}

