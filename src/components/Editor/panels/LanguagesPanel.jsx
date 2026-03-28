import React from 'react';
import { Globe, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCV } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input, Select } from '../shared/FormFields';
import { languageLevels } from '../../../constants/translations';

export function LanguagesPanel({ isOpen, onToggle }) {
  const { data, addItem, updateItem, removeItem, moveItem } = useCV();

  const add = () =>
    addItem('languages', {
      id: Date.now().toString(),
      name: '',
      level: '',
    });

  return (
    <Panel title="Języki obce" icon={Globe} isOpen={isOpen} onToggle={onToggle}>
      <div className="items-list">
        {data.languages.map((lang, index) => (
          <div key={lang.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">Język #{index + 1}</span>
              <div className="item-card-actions">
                <button onClick={() => moveItem('languages', index, 'up')} disabled={index === 0} className="icon-btn"><ArrowUp size={15} /></button>
                <button onClick={() => moveItem('languages', index, 'down')} disabled={index === data.languages.length - 1} className="icon-btn"><ArrowDown size={15} /></button>
                <div className="separator-v" />
                <button onClick={() => removeItem('languages', lang.id)} className="icon-btn icon-btn--danger"><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="field-row">
              <Input label="Język" value={lang.name} placeholder="Np. Angielski" onChange={(e) => updateItem('languages', lang.id, 'name', e.target.value)} />
              <Select
                label="Poziom"
                value={lang.level}
                options={languageLevels}
                onChange={(e) => updateItem('languages', lang.id, 'level', e.target.value)}
              />
            </div>
          </div>
        ))}
        <button onClick={add} className="add-btn">
          <Plus size={16} /> Dodaj język
        </button>
      </div>
    </Panel>
  );
}
