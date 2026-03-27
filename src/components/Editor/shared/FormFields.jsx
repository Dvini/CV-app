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

export function Select({ label, options, ...props }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <select className="field-select" {...props}>
        <option value="">— Wybierz —</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
