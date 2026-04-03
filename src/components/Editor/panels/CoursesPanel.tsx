import React from 'react';
import { Award } from 'lucide-react';
import { ItemListPanel } from '../shared/ItemListPanel';
import { Input } from '../shared/FormFields';
import type { CourseItem } from '../../../types/cv';

const DEFAULT_ITEM: Omit<CourseItem, 'id'> = {
  name: '',
  organizer: '',
  startDate: '',
  endDate: '',
};

export function CoursesPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <ItemListPanel<CourseItem>
      title="Szkolenia i Kursy"
      icon={Award}
      isOpen={isOpen}
      onToggle={onToggle}
      arrayName="courses"
      defaultItem={DEFAULT_ITEM}
      itemLabel={(i) => `Kurs #${i}`}
      addLabel="Dodaj kurs"
      renderFields={(course, onChange) => (
        <>
          <Input
            label="Nazwa szkolenia / kursu"
            value={course.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
          <Input
            label="Organizator"
            value={course.organizer}
            onChange={(e) => onChange('organizer', e.target.value)}
          />
          <div className="field-row">
            <Input
              label="Od"
              value={course.startDate}
              placeholder="MM/RRRR"
              onChange={(e) => onChange('startDate', e.target.value)}
            />
            <Input
              label="Do"
              value={course.endDate}
              placeholder="MM/RRRR"
              onChange={(e) => onChange('endDate', e.target.value)}
            />
          </div>
        </>
      )}
    />
  );
}
