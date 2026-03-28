import React from 'react';
import './shared.css';

export function Input({ label, error, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <input className={`field-input ${error ? 'field-input--error' : ''}`} {...props} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <textarea className={`field-textarea ${error ? 'field-input--error' : ''}`} {...props} />
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
