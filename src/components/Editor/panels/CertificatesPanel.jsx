import React from 'react';
import { ShieldCheck, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input } from '../shared/FormFields';

export function CertificatesPanel({ isOpen, onToggle }) {
  const { data, addItem, updateItem, removeItem, moveItem } = useCVData();

  const add = () =>
    addItem('certificates', {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      credentialUrl: '',
    });

  return (
    <Panel title="Certyfikaty" icon={ShieldCheck} isOpen={isOpen} onToggle={onToggle}>
      <div className="items-list">
        {data.certificates.map((cert, index) => (
          <div key={cert.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">Certyfikat #{index + 1}</span>
              <div className="item-card-actions">
                <button onClick={() => moveItem('certificates', index, 'up')} disabled={index === 0} className="icon-btn"><ArrowUp size={15} /></button>
                <button onClick={() => moveItem('certificates', index, 'down')} disabled={index === data.certificates.length - 1} className="icon-btn"><ArrowDown size={15} /></button>
                <div className="separator-v" />
                <button onClick={() => removeItem('certificates', cert.id)} className="icon-btn icon-btn--danger"><Trash2 size={15} /></button>
              </div>
            </div>
            <Input label="Nazwa certyfikatu" value={cert.name} onChange={(e) => updateItem('certificates', cert.id, 'name', e.target.value)} />
            <Input label="Wydawca" value={cert.issuer} onChange={(e) => updateItem('certificates', cert.id, 'issuer', e.target.value)} />
            <Input label="Data uzyskania" value={cert.date} placeholder="MM/RRRR" onChange={(e) => updateItem('certificates', cert.id, 'date', e.target.value)} />
            <Input label="URL potwierdzenia" value={cert.credentialUrl || ''} placeholder="https://..." onChange={(e) => updateItem('certificates', cert.id, 'credentialUrl', e.target.value)} />
          </div>
        ))}
        <button onClick={add} className="add-btn">
          <Plus size={16} /> Dodaj certyfikat
        </button>
      </div>
    </Panel>
  );
}
