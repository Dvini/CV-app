import React from 'react';
import { Briefcase } from 'lucide-react';
import { ItemListPanel } from '../shared/ItemListPanel';
import { Input, Textarea } from '../shared/FormFields';
import type { ExperienceItem } from '../../../types/cv';

const DEFAULT_ITEM: Omit<ExperienceItem, 'id'> = {
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  description: '',
  skills: '',
};

export function ExperiencePanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <ItemListPanel<ExperienceItem>
      title="Doświadczenie zawodowe"
      icon={Briefcase}
      isOpen={isOpen}
      onToggle={onToggle}
      arrayName="experience"
      defaultItem={DEFAULT_ITEM}
      itemLabel={(i) => `Stanowisko #${i}`}
      addLabel="Dodaj doświadczenie"
      renderFields={(exp, onChange) => (
        <>
          <Input
            label="Stanowisko"
            value={exp.role}
            onChange={(e) => onChange('role', e.target.value)}
          />
          <Input
            label="Firma"
            value={exp.company}
            onChange={(e) => onChange('company', e.target.value)}
          />
          <div className="field-row">
            <Input
              label="Od"
              value={exp.startDate}
              placeholder="MM/RRRR"
              onChange={(e) => onChange('startDate', e.target.value)}
            />
            <Input
              label="Do"
              value={exp.endDate}
              placeholder="MM/RRRR lub Obecnie"
              onChange={(e) => onChange('endDate', e.target.value)}
            />
          </div>
          <Textarea
            label="Opis obowiązków"
            value={exp.description}
            onChange={(e) => onChange('description', e.target.value)}
          />
          <Input
            label="Kluczowe technologie"
            value={exp.skills}
            placeholder="React, TypeScript, Agile"
            onChange={(e) => onChange('skills', e.target.value)}
          />
        </>
      )}
    />
  );
}
