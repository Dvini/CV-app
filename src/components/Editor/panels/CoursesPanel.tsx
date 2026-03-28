// @ts-nocheck
import React from 'react';
import { Award, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input } from '../shared/FormFields';

export function CoursesPanel({ isOpen, onToggle }) {
  const { data, addItem, updateItem, removeItem, moveItem } = useCVData();

  const add = () =>
    addItem('courses', {
      id: Date.now().toString(),
      name: '',
      organizer: '',
      startDate: '',
      endDate: '',
    });

  return (
    <Panel title="Szkolenia i Kursy" icon={Award} isOpen={isOpen} onToggle={onToggle}>
      <div className="items-list">
        {data.courses.map((course, index) => (
          <div key={course.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">Kurs #{index + 1}</span>
              <div className="item-card-actions">
                <button onClick={() => moveItem('courses', index, 'up')} disabled={index === 0} className="icon-btn"><ArrowUp size={15} /></button>
                <button onClick={() => moveItem('courses', index, 'down')} disabled={index === data.courses.length - 1} className="icon-btn"><ArrowDown size={15} /></button>
                <div className="separator-v" />
                <button onClick={() => removeItem('courses', course.id)} className="icon-btn icon-btn--danger"><Trash2 size={15} /></button>
              </div>
            </div>
            <Input label="Nazwa szkolenia / kursu" value={course.name} onChange={(e) => updateItem('courses', course.id, 'name', e.target.value)} />
            <Input label="Organizator" value={course.organizer} onChange={(e) => updateItem('courses', course.id, 'organizer', e.target.value)} />
            <div className="field-row">
              <Input label="Od" value={course.startDate} placeholder="MM/RRRR" onChange={(e) => updateItem('courses', course.id, 'startDate', e.target.value)} />
              <Input label="Do" value={course.endDate} placeholder="MM/RRRR" onChange={(e) => updateItem('courses', course.id, 'endDate', e.target.value)} />
            </div>
          </div>
        ))}
        <button onClick={add} className="add-btn">
          <Plus size={16} /> Dodaj kurs
        </button>
      </div>
    </Panel>
  );
}

