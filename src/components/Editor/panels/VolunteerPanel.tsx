// @ts-nocheck
import React from 'react';
import { Heart, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input, Textarea } from '../shared/FormFields';

export function VolunteerPanel({ isOpen, onToggle }) {
  const { data, addItem, updateItem, removeItem, moveItem } = useCVData();

  const add = () =>
    addItem('volunteer', {
      id: Date.now().toString(),
      role: '',
      organization: '',
      startDate: '',
      endDate: '',
      description: '',
    });

  return (
    <Panel title="Wolontariat" icon={Heart} isOpen={isOpen} onToggle={onToggle}>
      <div className="items-list">
        {data.volunteer.map((vol, index) => (
          <div key={vol.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">Wolontariat #{index + 1}</span>
              <div className="item-card-actions">
                <button onClick={() => moveItem('volunteer', index, 'up')} disabled={index === 0} className="icon-btn"><ArrowUp size={15} /></button>
                <button onClick={() => moveItem('volunteer', index, 'down')} disabled={index === data.volunteer.length - 1} className="icon-btn"><ArrowDown size={15} /></button>
                <div className="separator-v" />
                <button onClick={() => removeItem('volunteer', vol.id)} className="icon-btn icon-btn--danger"><Trash2 size={15} /></button>
              </div>
            </div>
            <Input label="Rola" value={vol.role} onChange={(e) => updateItem('volunteer', vol.id, 'role', e.target.value)} />
            <Input label="Organizacja" value={vol.organization} onChange={(e) => updateItem('volunteer', vol.id, 'organization', e.target.value)} />
            <div className="field-row">
              <Input label="Od" value={vol.startDate} placeholder="MM/RRRR" onChange={(e) => updateItem('volunteer', vol.id, 'startDate', e.target.value)} />
              <Input label="Do" value={vol.endDate} placeholder="MM/RRRR lub Obecnie" onChange={(e) => updateItem('volunteer', vol.id, 'endDate', e.target.value)} />
            </div>
            <Textarea label="Opis" value={vol.description} onChange={(e) => updateItem('volunteer', vol.id, 'description', e.target.value)} rows={3} />
          </div>
        ))}
        <button onClick={add} className="add-btn">
          <Plus size={16} /> Dodaj wolontariat
        </button>
      </div>
    </Panel>
  );
}

