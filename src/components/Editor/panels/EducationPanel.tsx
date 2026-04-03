import React from 'react';
import { GraduationCap } from 'lucide-react';
import { ItemListPanel } from '../shared/ItemListPanel';
import { Input } from '../shared/FormFields';
import type { EducationItem } from '../../../types/cv';

const DEFAULT_ITEM: Omit<EducationItem, 'id'> = {
  school: '',
  degree: '',
  startDate: '',
  endDate: '',
};

export function EducationPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <ItemListPanel<EducationItem>
      title="Edukacja"
      icon={GraduationCap}
      isOpen={isOpen}
      onToggle={onToggle}
      arrayName="education"
      defaultItem={DEFAULT_ITEM}
      itemLabel={(i) => `Szkoła #${i}`}
      addLabel="Dodaj edukację"
      renderFields={(edu, onChange) => (
        <>
          <Input
            label="Kierunek / Tytuł"
            value={edu.degree}
            onChange={(e) => onChange('degree', e.target.value)}
          />
          <Input
            label="Uczelnia / Szkoła"
            value={edu.school}
            onChange={(e) => onChange('school', e.target.value)}
          />
          <div className="field-row">
            <Input
              label="Od"
              value={edu.startDate}
              placeholder="MM/RRRR"
              onChange={(e) => onChange('startDate', e.target.value)}
            />
            <Input
              label="Do"
              value={edu.endDate}
              placeholder="MM/RRRR"
              onChange={(e) => onChange('endDate', e.target.value)}
            />
          </div>
        </>
      )}
    />
  );
}
