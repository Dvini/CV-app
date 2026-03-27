import React from 'react';
import { Database, FileJson, Upload, RotateCcw } from 'lucide-react';
import { useCV } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Textarea } from '../shared/FormFields';

export function DataSyncPanel() {
  const { fileInputRef, exportJSON, importJSON, resetToDefaults, data, handleClauseChange, toggleClause } = useCV();

  return (
    <Panel title="Zarządzaj danymi" icon={Database}>
      <p className="field-hint" style={{ marginBottom: '1rem' }}>
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
