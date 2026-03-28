// @ts-nocheck
import React from 'react';
import { useCVAppearance } from '../../../context/CVContext';
import './shared.css';

const LANG_MAP = { pl: 'pl', en: 'en' };

function useLang() {
  const { cvLanguage } = useCVAppearance();
  return LANG_MAP[cvLanguage] || 'pl';
}

export function Input({ label, error, ...props }) {
  const lang = useLang();
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <input className={`field-input ${error ? 'field-input--error' : ''}`} lang={lang} spellCheck {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, ...props }) {
  const lang = useLang();
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <textarea className={`field-textarea ${error ? 'field-input--error' : ''}`} lang={lang} spellCheck {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function Select({ label, options, hideEmptyOption, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <select className="field-select" {...props}>
        {!hideEmptyOption && <option value="">— Wybierz —</option>}
        {options.map((opt) => {
          const isObj = typeof opt === 'object';
          const val = isObj ? opt.value : opt;
          const lbl = isObj ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
    </div>
  );
}

