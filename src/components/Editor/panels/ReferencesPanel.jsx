import React from 'react';
import { Users, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input } from '../shared/FormFields';

export function ReferencesPanel({ isOpen, onToggle }) {
  const { data, addItem, updateItem, removeItem, moveItem } = useCVData();

  const add = () =>
    addItem('references', {
      id: Date.now().toString(),
      name: '',
      position: '',
      company: '',
      contact: '',
    });

  return (
    <Panel title="Referencje" icon={Users} isOpen={isOpen} onToggle={onToggle}>
      <div className="items-list">
        {data.references.map((ref, index) => (
          <div key={ref.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">Referencja #{index + 1}</span>
              <div className="item-card-actions">
                <button onClick={() => moveItem('references', index, 'up')} disabled={index === 0} className="icon-btn"><ArrowUp size={15} /></button>
                <button onClick={() => moveItem('references', index, 'down')} disabled={index === data.references.length - 1} className="icon-btn"><ArrowDown size={15} /></button>
                <div className="separator-v" />
                <button onClick={() => removeItem('references', ref.id)} className="icon-btn icon-btn--danger"><Trash2 size={15} /></button>
              </div>
            </div>
            <Input label="Imię i nazwisko" value={ref.name} onChange={(e) => updateItem('references', ref.id, 'name', e.target.value)} />
            <Input label="Stanowisko" value={ref.position} onChange={(e) => updateItem('references', ref.id, 'position', e.target.value)} />
            <Input label="Firma" value={ref.company} onChange={(e) => updateItem('references', ref.id, 'company', e.target.value)} />
            <Input label="Kontakt (email / telefon)" value={ref.contact} onChange={(e) => updateItem('references', ref.id, 'contact', e.target.value)} />
          </div>
        ))}
        <button onClick={add} className="add-btn">
          <Plus size={16} /> Dodaj referencję
        </button>
      </div>
    </Panel>
  );
}
