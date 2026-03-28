import React, { useRef, useState } from 'react';
import { Database, FileJson, Upload, RotateCcw, Plus, Copy, Trash2, Pencil, Check, X, SpellCheck, Loader, AlertTriangle } from 'lucide-react';
import { useCVData, useCVAppearance, useCVManager } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Textarea } from '../shared/FormFields';

export function DataSyncPanel() {
  const { data, handleClauseChange, toggleClause } = useCVData();
  const { cvLanguage } = useCVAppearance();
  const {
    exportJSON, importJSON, resetToDefaults,
    profiles, activeProfileId, switchProfile, createProfile, deleteProfile, renameProfile,
  } = useCVManager();
  const fileInputRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [spellResults, setSpellResults] = useState(null);
  const [spellLoading, setSpellLoading] = useState(false);
  const [spellError, setSpellError] = useState(null);

  const startRename = (profile) => {
    setEditingId(profile.id);
    setEditName(profile.name);
  };

  const confirmRename = () => {
    if (editName.trim()) {
      renameProfile(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditingId(null);
  };

  return (
    <Panel title="Zarządzaj danymi" icon={Database}>
      {/* Profile management */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p className="field-hint" style={{ marginBottom: '0.5rem' }}>
          Profile CV — przechowuj wiele wersji CV.
        </p>
        <div className="layout-list">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`layout-item${profile.id === activeProfileId ? ' layout-item--active' : ''}`}
              style={{ cursor: profile.id !== activeProfileId ? 'pointer' : 'default' }}
              onClick={() => profile.id !== activeProfileId && switchProfile(profile.id)}
            >
              <div className="layout-item-left" style={{ flex: 1, minWidth: 0 }}>
                {editingId === profile.id ? (
                  <input
                    className="profile-rename-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmRename();
                      if (e.key === 'Escape') cancelRename();
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                ) : (
                  <span className="layout-item-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile.name}
                    {profile.id === activeProfileId && <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginLeft: '0.375rem' }}>(aktywny)</span>}
                  </span>
                )}
              </div>
              <div className="layout-item-right" onClick={(e) => e.stopPropagation()}>
                {editingId === profile.id ? (
                  <>
                    <button className="icon-btn" onClick={confirmRename} title="Zapisz" aria-label="Zapisz nazwę"><Check size={14} /></button>
                    <button className="icon-btn" onClick={cancelRename} title="Anuluj" aria-label="Anuluj zmianę nazwy"><X size={14} /></button>
                  </>
                ) : (
                  <>
                    <button className="icon-btn" onClick={() => startRename(profile)} title="Zmień nazwę" aria-label={`Zmień nazwę: ${profile.name}`}><Pencil size={13} /></button>
                    {profiles.length > 1 && (
                      <button className="icon-btn" onClick={() => deleteProfile(profile.id)} title="Usuń" aria-label={`Usuń profil: ${profile.name}`}><Trash2 size={13} /></button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="btn-group btn-group--2" style={{ marginTop: '0.5rem' }}>
          <button className="btn-secondary" onClick={() => createProfile(`Profil ${profiles.length + 1}`)}>
            <Plus size={15} /> Nowy profil
          </button>
          <button className="btn-secondary" onClick={() => createProfile(`${profiles.find(p => p.id === activeProfileId)?.name || 'Profil'} (kopia)`, true)}>
            <Copy size={15} /> Duplikuj
          </button>
        </div>
      </div>

      <hr className="panel-divider" />

      <p className="field-hint" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
        Dane zapisują się automatycznie w przeglądarce. Możesz je pobrać by zachować kopię zapasową.
      </p>
      <div className="btn-group btn-group--2" style={{ marginBottom: '1rem' }}>
        <button onClick={exportJSON} className="btn-secondary">
          <FileJson size={15} /> Pobierz JSON
        </button>
        <input type="file" accept=".json" ref={fileInputRef} onChange={importJSON} style={{ display: 'none' }} />
        <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
          <Upload size={15} /> Wgraj JSON
        </button>
      </div>
      <button onClick={resetToDefaults} className="btn-danger-outline" style={{ width: '100%', marginBottom: '1.5rem' }}>
        <RotateCcw size={15} /> Resetuj do domyślnych
      </button>

      <hr className="panel-divider" />

      {/* Spell check */}
      <div style={{ marginTop: '1rem', marginBottom: '1.25rem' }}>
        <p className="field-hint" style={{ marginBottom: '0.5rem' }}>
          Sprawdź pisownię za pomocą LanguageTool (wymaga połączenia z internetem).
        </p>
        <button
          className="btn-secondary"
          style={{ width: '100%' }}
          onClick={async () => {
            setSpellLoading(true);
            setSpellError(null);
            setSpellResults(null);
            try {
              const { extractTexts, checkSpelling } = await import('../../../utils/spellCheck');
              const texts = extractTexts(data);
              const results = await checkSpelling(texts, cvLanguage);
              setSpellResults(results);
            } catch {
              setSpellError('Nie udało się sprawdzić pisowni. Sprawdź połączenie z internetem.');
            } finally {
              setSpellLoading(false);
            }
          }}
          disabled={spellLoading}
        >
          {spellLoading ? <Loader size={15} className="spin" /> : <SpellCheck size={15} />}
          {spellLoading ? ' Sprawdzanie...' : ' Sprawdź pisownię'}
        </button>

        {spellError && (
          <p className="field-error" style={{ marginTop: '0.5rem' }}>{spellError}</p>
        )}

        {spellResults && spellResults.length === 0 && (
          <p className="field-hint" style={{ marginTop: '0.5rem', color: 'var(--success, #22c55e)' }}>
            ✓ Nie znaleziono błędów.
          </p>
        )}

        {spellResults && spellResults.length > 0 && (
          <div className="spell-results" style={{ marginTop: '0.5rem' }}>
            <p className="field-hint" style={{ marginBottom: '0.375rem' }}>
              Znaleziono {spellResults.length} {spellResults.length === 1 ? 'problem' : spellResults.length < 5 ? 'problemy' : 'problemów'}:
            </p>
            <div style={{ maxHeight: '200px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {spellResults.map((r, i) => (
                <div key={i} className="spell-issue">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                    <AlertTriangle size={13} style={{ color: 'var(--warning, #f59e0b)', flexShrink: 0, marginTop: '0.125rem' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem' }}>{r.message}</div>
                      {r.context && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                          „…{r.context.substring(Math.max(0, r.offset - 10), r.offset)}<strong style={{ color: 'var(--danger, #ef4444)' }}>{r.context.substring(r.offset, r.offset + r.length)}</strong>{r.context.substring(r.offset + r.length, r.offset + r.length + 10)}…"
                        </div>
                      )}
                      {r.replacements.length > 0 && (
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                          Sugestie: {r.replacements.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <hr className="panel-divider" />

      {/* RODO Clause */}
      <div style={{ marginTop: '1rem' }}>
        <label className="toggle-row" style={{ marginBottom: '0.75rem' }}>
          <span className="toggle-label">Klauzula RODO na CV</span>
          <input
            type="checkbox"
            className="toggle-checkbox"
            checked={data.showClause || false}
            onChange={toggleClause}
          />
          <span className="toggle-slider" />
        </label>
        {data.showClause && (
          <Textarea
            label="Treść klauzuli"
            value={data.clause || ''}
            onChange={(e) => handleClauseChange(e.target.value)}
          />
        )}
      </div>
    </Panel>
  );
}
