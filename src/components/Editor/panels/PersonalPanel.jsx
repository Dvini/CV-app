import React, { useRef } from 'react';
import { User, Camera, X } from 'lucide-react';
import { useCV } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input, Textarea, Select } from '../shared/FormFields';

export function PersonalPanel({ isOpen, onToggle }) {
  const { data, handlePersonalChange } = useCV();
  const photoInputRef = useRef(null);
  const p = data.personal;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      handlePersonalChange('photo', ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  const removePhoto = () => {
    handlePersonalChange('photo', null);
  };

  const handleChange = (e) => {
    handlePersonalChange(e.target.name, e.target.value);
  };

  return (
    <Panel title="Dane Osobowe" icon={User} isOpen={isOpen} onToggle={onToggle}>
      {/* Photo toggle & upload */}
      <div className="photo-section">
        <label className="toggle-row">
          <span className="toggle-label">Zdjęcie profilowe</span>
          <input
            type="checkbox"
            className="toggle-checkbox"
            checked={p.showPhoto || false}
            onChange={() => handlePersonalChange('showPhoto', !p.showPhoto)}
          />
          <span className="toggle-slider" />
        </label>

        {p.showPhoto && (
          <div className="photo-upload-area">
            {p.photo ? (
              <div className="photo-preview-wrap">
                <img src={p.photo} alt="Zdjęcie" className="photo-preview-img" />
                <button className="photo-remove-btn" onClick={removePhoto} title="Usuń zdjęcie">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button className="photo-upload-btn" onClick={() => photoInputRef.current?.click()}>
                <Camera size={20} />
                <span>Dodaj zdjęcie</span>
              </button>
            )}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            {p.photo && (
              <button
                className="btn-secondary btn-sm"
                onClick={() => photoInputRef.current?.click()}
                style={{ marginTop: '0.5rem' }}
              >
                Zmień zdjęcie
              </button>
            )}

            {p.photo && (
              <div className="photo-settings" style={{ marginTop: '1rem', width: '100%' }}>
                <Select
                  label="Kształt zdjęcia"
                  name="photoShape"
                  value={p.photoShape || 'round'}
                  onChange={handleChange}
                  hideEmptyOption={true}
                  options={[
                    { value: 'round', label: 'Okrągłe' },
                    { value: 'square', label: 'Kwadratowe' },
                    { value: 'rectangle-portrait', label: 'Prostokątne (portretowe)' },
                    { value: 'rectangle-landscape', label: 'Prostokątne (poziome)' }
                  ]}
                />
                
                <div className="field photo-slider-field" style={{ marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <label className="field-label">Rozmiar</label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.photoSize || 80}px</span>
                  </div>
                  <input
                    type="range"
                    name="photoSize"
                    min="40"
                    max="180"
                    value={p.photoSize || 80}
                    onChange={(e) => handlePersonalChange('photoSize', parseInt(e.target.value, 10))}
                    style={{ width: '100%', cursor: 'pointer' }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Input label="Imię i nazwisko" name="fullName" value={p.fullName} onChange={handleChange} />
      <Input label="Tytuł zawodowy" name="title" value={p.title} onChange={handleChange} />
      <div className="field-row">
        <Input label="Email" name="email" type="email" value={p.email} onChange={handleChange} />
        <Input label="Telefon" name="phone" value={p.phone} onChange={handleChange} />
      </div>
      <div className="field-row">
        <Input label="Lokalizacja" name="location" value={p.location} onChange={handleChange} />
        <Input label="LinkedIn" name="linkedin" value={p.linkedin || ''} placeholder="linkedin.com/in/..." onChange={handleChange} />
      </div>
      <div className="field-row">
        <Input label="GitHub" name="github" value={p.github || ''} placeholder="github.com/..." onChange={handleChange} />
        <Input label="Strona WWW" name="website" value={p.website || ''} placeholder="https://..." onChange={handleChange} />
      </div>
      <Textarea label="Podsumowanie zawodowe" name="summary" value={p.summary} onChange={handleChange} />
    </Panel>
  );
}
