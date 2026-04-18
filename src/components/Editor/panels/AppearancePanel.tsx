// @ts-nocheck
import React, { useCallback } from 'react';
import { Palette, Plus } from 'lucide-react';
import { useCVAppearance } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { presetColors } from '../../../constants/colors';

export function AppearancePanel({ isOpen, onToggle }) {
  const {
    cvLanguage, setCvLanguage,
    template, setTemplate,
    fontFamily, setFontFamily,
    themeColor, setThemeColor,
    margins, setMargins,
    customMargin, setCustomMargin,
    fontSizeHeading, setFontSizeHeading,
    fontSizeText, setFontSizeText,
    showSectionIcons, setShowSectionIcons,
    showContactIcons, setShowContactIcons,
    creativeHeaderBg, setCreativeHeaderBg,
  } = useCVAppearance();

  const templates = [
    { key: 'classic', label: 'Klasyczny (1 kolumna)' },
    { key: 'twocolumn', label: 'Nowoczesny (2 kolumny)' },
    { key: 'minimalist', label: 'Minimalistyczny' },
    { key: 'compact', label: 'Kompaktowy' },
    { key: 'creative', label: 'Kreatywny (2 kolumny)' },
  ];

  const marginOptions = [
    { key: 'small', label: 'Małe' },
    { key: 'normal', label: 'Normalne' },
    { key: 'large', label: 'Duże' },
    { key: 'custom', label: 'Własne' },
  ];

  return (
    <Panel title="Wygląd CV" icon={Palette} isOpen={isOpen} onToggle={onToggle}>
      <div className="appearance-sections">
        {/* Language */}
        <div className="appearance-group">
          <label className="appearance-label">Język dokumentu (CV)</label>
          <div className="btn-group btn-group--2">
            <button onClick={() => setCvLanguage('pl')} className={`btn-option ${cvLanguage === 'pl' ? 'btn-option--active' : ''}`}>Polski</button>
            <button onClick={() => setCvLanguage('en')} className={`btn-option ${cvLanguage === 'en' ? 'btn-option--active' : ''}`}>Angielski</button>
          </div>
        </div>

        {/* Template */}
        <div className="appearance-group">
          <label className="appearance-label">Szablon</label>
          <div className="btn-group btn-group--1">
            {templates.map((t) => (
              <button key={t.key} onClick={() => setTemplate(t.key)} className={`btn-option ${template === t.key ? 'btn-option--active' : ''}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section Icons toggle */}
        <div className="appearance-group">
          <label className="appearance-label">Ikony przy sekcjach CV</label>
          <label className="toggle-row" role="switch" aria-checked={showSectionIcons}>
            <input
              type="checkbox"
              checked={showSectionIcons}
              onChange={(e) => setShowSectionIcons(e.target.checked)}
              className="toggle-checkbox"
            />
            <span className="toggle-slider" /><span className="toggle-label">{showSectionIcons ? 'Włączone' : 'Wyłączone'}</span>
          </label>
        </div>

        {/* Contact icons toggle */}
        <div className="appearance-group">
          <label className="appearance-label">Ikony danych kontaktowych</label>
          <label className="toggle-row" role="switch" aria-checked={showContactIcons}>
            <input
              type="checkbox"
              checked={showContactIcons}
              onChange={(e) => setShowContactIcons(e.target.checked)}
              className="toggle-checkbox"
            />
            <span className="toggle-slider" /><span className="toggle-label">{showContactIcons ? 'Włączone' : 'Wyłączone'}</span>
          </label>
        </div>

        {/* Typography */}
        <div className="appearance-group">
          <label className="appearance-label">Krój czcionki</label>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="field-input"
            style={{ marginBottom: '1rem', fontFamily: ['sans', 'serif'].includes(fontFamily) ? 'inherit' : fontFamily }}
          >
            <option value="sans">Domyślna bezszeryfowa (Inter)</option>
            <option value="serif">Domyślna szeryfowa (Merriweather)</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Lato">Lato</option>
            <option value="Playfair Display">Playfair Display</option>
          </select>

          <label className="appearance-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Wielkość nagłówków</span>
            <span>{Math.round(fontSizeHeading * 100)}%</span>
          </label>
          <input
            type="range"
            min="0.8" max="1.8" step="0.05"
            value={fontSizeHeading}
            onChange={(e) => setFontSizeHeading(Number(e.target.value))}
            className="slider-input"
            aria-label="Wielkość nagłówków"
            style={{ width: '100%', marginBottom: '1rem' }}
          />

          <label className="appearance-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Wielkość tekstów</span>
            <span>{Math.round(fontSizeText * 100)}%</span>
          </label>
          <input
            type="range"
            min="0.8" max="1.8" step="0.05"
            value={fontSizeText}
            onChange={(e) => setFontSizeText(Number(e.target.value))}
            className="slider-input"
            aria-label="Wielkość tekstów"
            style={{ width: '100%' }}
          />
        </div>

        {/* Accent Color */}
        <div className="appearance-group">
          <label className="appearance-label" id="color-label">Kolor akcentujący</label>
          <div className="color-picker-row" role="radiogroup" aria-labelledby="color-label" onKeyDown={(e) => {
            if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
            e.preventDefault();
            const idx = presetColors.findIndex((c) => c.value === themeColor);
            if (e.key === 'ArrowRight') {
              const next = idx < presetColors.length - 1 ? idx + 1 : 0;
              setThemeColor(presetColors[next].value);
            } else {
              const prev = idx > 0 ? idx - 1 : presetColors.length - 1;
              setThemeColor(presetColors[prev].value);
            }
          }}>
            {presetColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setThemeColor(color.value)}
                title={color.name}
                role="radio"
                aria-checked={themeColor === color.value}
                aria-label={color.name}
                tabIndex={themeColor === color.value ? 0 : -1}
                className={`color-swatch ${themeColor === color.value ? 'color-swatch--active' : ''}`}
                style={{ backgroundColor: color.value }}
              />
            ))}
            <div className="separator-v" style={{ height: 24 }} />
            <label
              className={`color-swatch color-swatch--custom ${!presetColors.some((c) => c.value === themeColor) ? 'color-swatch--active' : ''}`}
              style={{
                backgroundColor: !presetColors.some((c) => c.value === themeColor) ? themeColor : 'transparent',
              }}
              title="Wybierz własny kolor"
              aria-label="Wybierz własny kolor"
            >
              <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="color-native-input" aria-label="Wybierz kolor akcentu" />
              {presetColors.some((c) => c.value === themeColor) && <Plus size={14} className="color-custom-icon" />}
            </label>
          </div>
        </div>

        {/* Creative header background */}
        {template === 'creative' && (
          <div className="appearance-group">
            <label className="appearance-label">Kolor tła nagłówka</label>
            <div className="color-picker-row">
              <label className="color-swatch color-swatch--custom color-swatch--active" style={{ backgroundColor: creativeHeaderBg }} title="Kolor tła nagłówka" aria-label="Kolor tła nagłówka">
                <input type="color" value={creativeHeaderBg} onChange={(e) => setCreativeHeaderBg(e.target.value)} className="color-native-input" aria-label="Wybierz kolor tła nagłówka" />
              </label>
              <span className="field-hint" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>Tło sekcji danych osobowych</span>
            </div>
          </div>
        )}

        {/* Margins */}
        <div className="appearance-group">
          <label className="appearance-label">Marginesy dokumentu</label>
          <div className="btn-group btn-group--2">
            {marginOptions.map((m) => (
              <button key={m.key} onClick={() => setMargins(m.key)} className={`btn-option btn-option--sm ${margins === m.key ? 'btn-option--active' : ''}`}>
                {m.label}
              </button>
            ))}
          </div>
          {margins === 'custom' && (
            <div className="custom-margins">
              <div className="custom-margin-row">
                <label className="field-label">Góra / Dół (mm):</label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={customMargin.vertical}
                  onChange={(e) => setCustomMargin((prev) => ({ ...prev, vertical: Number(e.target.value) }))}
                  className="field-input custom-margin-input"
                />
              </div>
              <div className="custom-margin-row">
                <label className="field-label">Lewy / Prawy (mm):</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={customMargin.horizontal}
                  onChange={(e) => setCustomMargin((prev) => ({ ...prev, horizontal: Number(e.target.value) }))}
                  className="field-input custom-margin-input"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

