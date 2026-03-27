import React from 'react';
import { Palette, Plus } from 'lucide-react';
import { useCV } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { presetColors } from '../../../constants/colors';

export function AppearancePanel() {
  const {
    cvLanguage, setCvLanguage,
    template, setTemplate,
    fontFamily, setFontFamily,
    themeColor, setThemeColor,
    margins, setMargins,
    customMargin, setCustomMargin,
  } = useCV();

  const templates = [
    { key: 'classic', label: 'Klasyczny (1 kolumna)' },
    { key: 'twocolumn', label: 'Nowoczesny (2 kolumny)' },
    { key: 'minimalist', label: 'Minimalistyczny' },
  ];

  const marginOptions = [
    { key: 'small', label: 'Małe' },
    { key: 'normal', label: 'Normalne' },
    { key: 'large', label: 'Duże' },
    { key: 'custom', label: 'Własne' },
  ];

  return (
    <Panel title="Wygląd CV" icon={Palette} defaultOpen={true}>
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

        {/* Font */}
        <div className="appearance-group">
          <label className="appearance-label">Rodzaj czcionki</label>
          <div className="btn-group btn-group--2">
            <button onClick={() => setFontFamily('sans')} className={`btn-option ${fontFamily === 'sans' ? 'btn-option--active' : ''}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Bezszeryfowa</button>
            <button onClick={() => setFontFamily('serif')} className={`btn-option ${fontFamily === 'serif' ? 'btn-option--active' : ''}`} style={{ fontFamily: 'Merriweather, Georgia, serif' }}>Szeryfowa</button>
          </div>
        </div>

        {/* Accent Color */}
        <div className="appearance-group">
          <label className="appearance-label">Kolor akcentujący</label>
          <div className="color-picker-row">
            {presetColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setThemeColor(color.value)}
                title={color.name}
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
            >
              <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="color-native-input" />
              {presetColors.some((c) => c.value === themeColor) && <Plus size={14} className="color-custom-icon" />}
            </label>
          </div>
        </div>

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
                  min="0"
                  max="50"
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
