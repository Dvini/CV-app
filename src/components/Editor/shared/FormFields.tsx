import React, { useId } from 'react';
import { useCVAppearance } from '../../../context/hooks';
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

/** Ids that tie a field to its label and error message for assistive technology. */
function useFieldIds(id: string | undefined, error: string | undefined) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  return {
    fieldId,
    errorId,
    a11yProps: error ? { 'aria-invalid': true, 'aria-describedby': errorId } : {},
  };
}

export function Input({ label, error, id, ...props }: InputProps) {
  const lang = useLang();
  const { fieldId, errorId, a11yProps } = useFieldIds(id, error);
  return (
    <div className="field">
      {label && <label className="field-label" htmlFor={fieldId}>{label}</label>}
      <input
        id={fieldId}
        className={`field-input ${error ? 'field-input--error' : ''}`}
        lang={lang}
        spellCheck
        {...a11yProps}
        {...props}
      />
      {error && <span id={errorId} className="field-error">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, id, ...props }: TextareaProps) {
  const lang = useLang();
  const { fieldId, errorId, a11yProps } = useFieldIds(id, error);
  return (
    <div className="field">
      {label && <label className="field-label" htmlFor={fieldId}>{label}</label>}
      <textarea
        id={fieldId}
        className={`field-textarea ${error ? 'field-input--error' : ''}`}
        lang={lang}
        spellCheck
        {...a11yProps}
        {...props}
      />
      {error && <span id={errorId} className="field-error">{error}</span>}
    </div>
  );
}

export function Select({ label, options, hideEmptyOption, id, ...props }: SelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  return (
    <div className="field">
      {label && <label className="field-label" htmlFor={fieldId}>{label}</label>}
      <select id={fieldId} className="field-select" {...props}>
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

interface RangeFieldProps {
  label: string;
  /** Current value as shown next to the label, e.g. "45% / 55%". */
  valueText: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Space below the slider; omit for the last slider in a group. */
  marginBottom?: string;
}

/** Labelled slider used in the appearance panel. */
export function RangeField({ label, valueText, value, min, max, step, onChange, marginBottom }: RangeFieldProps) {
  const id = useId();
  return (
    <>
      <label htmlFor={id} className="appearance-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{label}</span>
        <span>{valueText}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input"
        style={{ width: '100%', marginBottom }}
      />
    </>
  );
}
