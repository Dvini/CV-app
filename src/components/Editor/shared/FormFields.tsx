import React from 'react';
import { useCVAppearance } from '../../../context/CVContext';
import './shared.css';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

type SelectOption = string | { value: string; label: string };

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: SelectOption[];
  hideEmptyOption?: boolean;
};

function useLang(): string {
  const { cvLanguage } = useCVAppearance();
  return cvLanguage === 'en' ? 'en' : 'pl';
}

export function Input({ label, error, ...props }: InputProps) {
  const lang = useLang();
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <input className={`field-input ${error ? 'field-input--error' : ''}`} lang={lang} spellCheck {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, ...props }: TextareaProps) {
  const lang = useLang();
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <textarea className={`field-textarea ${error ? 'field-input--error' : ''}`} lang={lang} spellCheck {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function Select({ label, options, hideEmptyOption, ...props }: SelectProps) {
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
