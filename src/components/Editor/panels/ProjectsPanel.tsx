import React from 'react';
import { FolderKanban } from 'lucide-react';
import { ItemListPanel } from '../shared/ItemListPanel';
import { Input, Textarea } from '../shared/FormFields';
import type { ProjectItem } from '../../../types/cv';

const DEFAULT_ITEM: Omit<ProjectItem, 'id'> = {
  name: '',
  description: '',
  link: '',
  skills: '',
};

export function ProjectsPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <ItemListPanel<ProjectItem>
      title="Projekty"
      icon={FolderKanban}
      isOpen={isOpen}
      onToggle={onToggle}
      arrayName="projects"
      defaultItem={DEFAULT_ITEM}
      itemLabel={(i) => `Projekt #${i}`}
      addLabel="Dodaj projekt"
      renderFields={(proj, onChange) => (
        <>
          <Input
            label="Nazwa projektu"
            value={proj.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
          <Textarea
            label="Opis"
            value={proj.description}
            onChange={(e) => onChange('description', e.target.value)}
          />
          <div className="field-row">
            <Input
              label="Link"
              value={proj.link}
              placeholder="https://..."
              onChange={(e) => onChange('link', e.target.value)}
            />
            <Input
              label="Technologie"
              value={proj.skills}
              placeholder="React, Node.js"
              onChange={(e) => onChange('skills', e.target.value)}
            />
          </div>
        </>
      )}
    />
  );
}
