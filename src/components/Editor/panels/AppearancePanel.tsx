// @ts-nocheck
import React, { useCallback, useRef, useState, useEffect } from 'react';
import { Palette, Plus, Image as ImageIcon, X } from 'lucide-react';
import { useCVAppearance } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { presetColors } from '../../../constants/colors';
import { compressImage } from '../../../utils/imageUtils';

export function AppearancePanel({ isOpen, onToggle }) {
  const headerImageInputRef = useRef<HTMLInputElement>(null);
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
    creativeHeaderImage, setCreativeHeaderImage,
    sectionGap, setSectionGap,
    itemGap, setItemGap,
    twoColLineWidth, setTwoColLineWidth,
    twoColLineColor, setTwoColLineColor,
    twoColSidebarWidth, setTwoColSidebarWidth,
    twoColGapLeft, setTwoColGapLeft,
    twoColGapRight, setTwoColGapRight,
    twoColSectionGap, setTwoColSectionGap,
    twoColItemGap, setTwoColItemGap,
  } = useCVAppearance();

  const [headerDims, setHeaderDims] = useState<{w: number, h: number} | null>(null);

  useEffect(() => {
    if (template !== 'creative') return;
    const updateDims = () => {
      const header = document.querySelector('.cv-header--creative') as HTMLElement;
      if (header) {
        setHeaderDims({ 
          w: Math.round(header.offsetWidth * 2), 
          h: Math.round(header.offsetHeight * 2) 
        });
      }
    };
    
    // Defer reading dimensions to give DOM time to render changes
    const timer = setTimeout(updateDims, 50);
    window.addEventListener('resize', updateDims);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateDims);
    };
  }, [template, margins, customMargin, fontSizeHeading, fontSizeText, cvLanguage, sectionGap, itemGap]);

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

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setCreativeHeaderImage(compressed);
    } catch {
      alert('Nie udało się załadować zdjęcia. Spróbuj z innym plikiem.');
    }
    e.target.value = null as unknown as string;
  };

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
            <label className="appearance-label">Tło nagłówka (dane osobowe)</label>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8125rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                Zdjęcie w tle
                {headerDims && <span style={{color: 'var(--text-secondary)', fontWeight: 400}}> (Wymiary: {headerDims.w} x {headerDims.h} px)</span>}
              </div>
              {creativeHeaderImage ? (
                <div style={{ position: 'relative', width: '100%', height: '80px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                  <img src={creativeHeaderImage} alt="Tło nagłówka" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => setCreativeHeaderImage(null)}
                    style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Usuń zdjęcie tła"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button 
                  className="photo-upload-btn" 
                  onClick={() => headerImageInputRef.current?.click()}
                  style={{ width: '100%', height: '80px', marginBottom: '0.5rem', border: '1px dashed var(--border)', background: 'var(--surface)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                >
                  <ImageIcon size={20} />
                  <span style={{ fontSize: '0.8125rem' }}>Wybierz zdjęcie tłowe</span>
                </button>
              )}
              <input
                ref={headerImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleHeaderImageUpload}
                style={{ display: 'none' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '0.8125rem', marginBottom: '0.5rem', fontWeight: 500 }}>Jednolity kolor</div>
              <div className="color-picker-row">
                <label className="color-swatch color-swatch--custom color-swatch--active" style={{ backgroundColor: creativeHeaderBg }} title="Kolor tła nagłówka">
                  <input type="color" value={creativeHeaderBg} onChange={(e) => setCreativeHeaderBg(e.target.value)} className="color-native-input" />
                </label>
                <span className="field-hint" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>{creativeHeaderBg}</span>
              </div>
            </div>
          </div>
        )}

        {/* Document Spacing */}
        <div className="appearance-group">
          <label className="appearance-label" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>
            Odstępy w dokumencie
          </label>

          <label className="appearance-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{['twocolumn', 'creative'].includes(template) ? 'Odstęp między sekcjami (kol. główna)' : 'Odstęp między sekcjami'}</span>
            <span>{sectionGap} rem</span>
          </label>
          <input
            type="range" min="0.5" max="3" step="0.1"
            value={sectionGap}
            onChange={(e) => setSectionGap(Number(e.target.value))}
            className="slider-input" style={{ width: '100%', marginBottom: '0.75rem' }}
          />

          <label className="appearance-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{['twocolumn', 'creative'].includes(template) ? 'Odstęp między elementami (kol. główna)' : 'Odstęp między elementami'}</span>
            <span>{itemGap} rem</span>
          </label>
          <input
            type="range" min="0.2" max="2" step="0.1"
            value={itemGap}
            onChange={(e) => setItemGap(Number(e.target.value))}
            className="slider-input" style={{ width: '100%' }}
          />
        </div>

        {/* Two-column layout options */}
        {['twocolumn', 'creative'].includes(template) && (
          <div className="appearance-group">
            <label className="appearance-label" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem', fontWeight: 600 }}>
              Opcje układu 2-kolumnowego
            </label>

            {template !== 'creative' && (
              <>
                <label className="appearance-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Grubość pionowej linii</span>
                  <span>{twoColLineWidth}px</span>
                </label>
                <input
                  type="range" min="0" max="5" step="1"
                  value={twoColLineWidth}
                  onChange={(e) => setTwoColLineWidth(Number(e.target.value))}
                  className="slider-input" style={{ width: '100%', marginBottom: '0.75rem' }}
                />

                <label className="appearance-label">Kolor pionowej linii</label>
                <div className="color-picker-row" style={{ marginBottom: '0.75rem' }}>
                  <label
                    className="color-swatch color-swatch--custom color-swatch--active"
                    style={{ backgroundColor: twoColLineColor }}
                    title="Kolor linii"
                  >
                    <input type="color" value={twoColLineColor} onChange={(e) => setTwoColLineColor(e.target.value)} className="color-native-input" />
                  </label>
                  <span className="field-hint" style={{ marginLeft: '0.5rem', fontSize: '0.75rem' }}>{twoColLineColor}</span>
                </div>
              </>
            )}

            <label className="appearance-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Szerokość lewej kolumny</span>
              <span>{twoColSidebarWidth}% / {100 - twoColSidebarWidth}%</span>
            </label>
            <input
              type="range" min="20" max="50" step="1"
              value={twoColSidebarWidth}
              onChange={(e) => setTwoColSidebarWidth(Number(e.target.value))}
              className="slider-input" style={{ width: '100%', marginBottom: '0.75rem' }}
            />

            {template !== 'creative' && (
              <>
                <label className="appearance-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Odsunięcie tekstu (lewa kol.)</span>
                  <span>{twoColGapLeft} mm</span>
                </label>
                <input
                  type="range" min="0" max="20" step="1"
                  value={twoColGapLeft}
                  onChange={(e) => setTwoColGapLeft(Number(e.target.value))}
                  className="slider-input" style={{ width: '100%', marginBottom: '0.75rem' }}
                />

                <label className="appearance-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Odsunięcie tekstu (prawa kol.)</span>
                  <span>{twoColGapRight} mm</span>
                </label>
                <input
                  type="range" min="0" max="25" step="1"
                  value={twoColGapRight}
                  onChange={(e) => setTwoColGapRight(Number(e.target.value))}
                  className="slider-input" style={{ width: '100%', marginBottom: '0.75rem' }}
                />
              </>
            )}

            <label className="appearance-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Odstęp między sekcjami (lewa kolumna)</span>
              <span>{twoColSectionGap} rem</span>
            </label>
            <input
              type="range" min="0" max="2" step="0.1"
              value={twoColSectionGap}
              onChange={(e) => setTwoColSectionGap(Number(e.target.value))}
              className="slider-input" style={{ width: '100%', marginBottom: '0.75rem' }}
            />

            <label className="appearance-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Odstęp między elementami (lewa kolumna)</span>
              <span>{twoColItemGap} rem</span>
            </label>
            <input
              type="range" min="0" max="1" step="0.05"
              value={twoColItemGap}
              onChange={(e) => setTwoColItemGap(Number(e.target.value))}
              className="slider-input" style={{ width: '100%' }}
            />
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

