import React from 'react';
import { GraduationCap, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input } from '../shared/FormFields';

export function EducationPanel({ isOpen, onToggle }) {
  const { data, addItem, updateItem, removeItem, moveItem } = useCVData();

  const add = () =>
    addItem('education', {
      id: Date.now().toString(),
      school: '',
      degree: '',
      startDate: '',
      endDate: '',
    });

  return (
    <Panel title="Edukacja" icon={GraduationCap} isOpen={isOpen} onToggle={onToggle}>
      <div className="items-list">
        {data.education.map((edu, index) => (
          <div key={edu.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">Szkoła #{index + 1}</span>
              <div className="item-card-actions">
                <button onClick={() => moveItem('education', index, 'up')} disabled={index === 0} className="icon-btn"><ArrowUp size={15} /></button>
                <button onClick={() => moveItem('education', index, 'down')} disabled={index === data.education.length - 1} className="icon-btn"><ArrowDown size={15} /></button>
                <div className="separator-v" />
                <button onClick={() => removeItem('education', edu.id)} className="icon-btn icon-btn--danger"><Trash2 size={15} /></button>
              </div>
            </div>
            <Input label="Kierunek / Tytuł" value={edu.degree} onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)} />
            <Input label="Uczelnia / Szkoła" value={edu.school} onChange={(e) => updateItem('education', edu.id, 'school', e.target.value)} />
            <div className="field-row">
              <Input label="Od" value={edu.startDate} placeholder="MM/RRRR" onChange={(e) => updateItem('education', edu.id, 'startDate', e.target.value)} />
              <Input label="Do" value={edu.endDate} placeholder="MM/RRRR" onChange={(e) => updateItem('education', edu.id, 'endDate', e.target.value)} />
            </div>
          </div>
        ))}
        <button onClick={add} className="add-btn">
          <Plus size={16} /> Dodaj edukację
        </button>
      </div>
    </Panel>
  );
}
