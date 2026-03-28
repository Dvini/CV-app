import React, { useRef, useState } from 'react';
import { Database, FileJson, Upload, RotateCcw, Plus, Copy, Trash2, Pencil, Check, X } from 'lucide-react';
import { useCV } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Textarea } from '../shared/FormFields';

export function DataSyncPanel() {
  const {
    exportJSON, importJSON, resetToDefaults, data, handleClauseChange, toggleClause,
    profiles, activeProfileId, switchProfile, createProfile, deleteProfile, renameProfile,
  } = useCV();
  const fileInputRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

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
