// @ts-nocheck
import React from 'react';
import { BookOpen, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input } from '../shared/FormFields';

export function PublicationsPanel({ isOpen, onToggle }) {
  const { data, addItem, updateItem, removeItem, moveItem } = useCVData();

  const add = () =>
    addItem('publications', {
      id: Date.now().toString(),
      title: '',
      publisher: '',
      date: '',
      url: '',
    });

  return (
    <Panel title="Publikacje" icon={BookOpen} isOpen={isOpen} onToggle={onToggle}>
      <div className="items-list">
        {data.publications.map((pub, index) => (
          <div key={pub.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">Publikacja #{index + 1}</span>
              <div className="item-card-actions">
                <button onClick={() => moveItem('publications', index, 'up')} disabled={index === 0} className="icon-btn"><ArrowUp size={15} /></button>
                <button onClick={() => moveItem('publications', index, 'down')} disabled={index === data.publications.length - 1} className="icon-btn"><ArrowDown size={15} /></button>
                <div className="separator-v" />
                <button onClick={() => removeItem('publications', pub.id)} className="icon-btn icon-btn--danger"><Trash2 size={15} /></button>
              </div>
            </div>
            <Input label="Tytuł" value={pub.title} onChange={(e) => updateItem('publications', pub.id, 'title', e.target.value)} />
            <Input label="Wydawca / Źródło" value={pub.publisher} onChange={(e) => updateItem('publications', pub.id, 'publisher', e.target.value)} />
            <Input label="Data" value={pub.date} placeholder="MM/RRRR" onChange={(e) => updateItem('publications', pub.id, 'date', e.target.value)} />
            <Input label="URL" value={pub.url || ''} placeholder="https://..." onChange={(e) => updateItem('publications', pub.id, 'url', e.target.value)} />
          </div>
        ))}
        <button onClick={add} className="add-btn">
          <Plus size={16} /> Dodaj publikację
        </button>
      </div>
    </Panel>
  );
}

