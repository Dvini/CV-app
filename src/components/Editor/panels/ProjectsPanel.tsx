// @ts-nocheck
import React from 'react';
import { FolderKanban, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input, Textarea } from '../shared/FormFields';

export function ProjectsPanel({ isOpen, onToggle }) {
  const { data, addItem, updateItem, removeItem, moveItem } = useCVData();

  const add = () =>
    addItem('projects', {
      id: Date.now().toString(),
      name: '',
      description: '',
      link: '',
      skills: '',
    });

  return (
    <Panel title="Projekty" icon={FolderKanban} isOpen={isOpen} onToggle={onToggle}>
      <div className="items-list">
        {data.projects.map((proj, index) => (
          <div key={proj.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">Projekt #{index + 1}</span>
              <div className="item-card-actions">
                <button onClick={() => moveItem('projects', index, 'up')} disabled={index === 0} className="icon-btn"><ArrowUp size={15} /></button>
                <button onClick={() => moveItem('projects', index, 'down')} disabled={index === data.projects.length - 1} className="icon-btn"><ArrowDown size={15} /></button>
                <div className="separator-v" />
                <button onClick={() => removeItem('projects', proj.id)} className="icon-btn icon-btn--danger"><Trash2 size={15} /></button>
              </div>
            </div>
            <Input label="Nazwa projektu" value={proj.name} onChange={(e) => updateItem('projects', proj.id, 'name', e.target.value)} />
            <Textarea label="Opis" value={proj.description} onChange={(e) => updateItem('projects', proj.id, 'description', e.target.value)} />
            <div className="field-row">
              <Input label="Link" value={proj.link} placeholder="https://..." onChange={(e) => updateItem('projects', proj.id, 'link', e.target.value)} />
              <Input label="Technologie" value={proj.skills} placeholder="React, Node.js" onChange={(e) => updateItem('projects', proj.id, 'skills', e.target.value)} />
            </div>
          </div>
        ))}
        <button onClick={add} className="add-btn">
          <Plus size={16} /> Dodaj projekt
        </button>
      </div>
    </Panel>
  );
}

