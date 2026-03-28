import React from 'react';
import { Briefcase, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCV } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input, Textarea } from '../shared/FormFields';

export function ExperiencePanel({ isOpen, onToggle }) {
  const { data, addItem, updateItem, removeItem, moveItem } = useCV();

  const add = () =>
    addItem('experience', {
      id: Date.now().toString(),
      company: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      skills: '',
    });

  return (
    <Panel title="Doświadczenie zawodowe" icon={Briefcase} isOpen={isOpen} onToggle={onToggle}>
      <div className="items-list">
        {data.experience.map((exp, index) => (
          <div key={exp.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">Stanowisko #{index + 1}</span>
              <div className="item-card-actions">
                <button onClick={() => moveItem('experience', index, 'up')} disabled={index === 0} className="icon-btn" title="W górę">
                  <ArrowUp size={15} />
                </button>
                <button onClick={() => moveItem('experience', index, 'down')} disabled={index === data.experience.length - 1} className="icon-btn" title="W dół">
                  <ArrowDown size={15} />
                </button>
                <div className="separator-v" />
                <button onClick={() => removeItem('experience', exp.id)} className="icon-btn icon-btn--danger" title="Usuń">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <Input label="Stanowisko" value={exp.role} onChange={(e) => updateItem('experience', exp.id, 'role', e.target.value)} />
            <Input label="Firma" value={exp.company} onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)} />
            <div className="field-row">
              <Input label="Od" value={exp.startDate} placeholder="MM/RRRR" onChange={(e) => updateItem('experience', exp.id, 'startDate', e.target.value)} />
              <Input label="Do" value={exp.endDate} placeholder="MM/RRRR lub Obecnie" onChange={(e) => updateItem('experience', exp.id, 'endDate', e.target.value)} />
            </div>
            <Textarea label="Opis obowiązków" value={exp.description} onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)} />
            <Input label="Kluczowe technologie" value={exp.skills} placeholder="React, TypeScript, Agile" onChange={(e) => updateItem('experience', exp.id, 'skills', e.target.value)} />
          </div>
        ))}
        <button onClick={add} className="add-btn">
          <Plus size={16} /> Dodaj doświadczenie
        </button>
      </div>
    </Panel>
  );
}
