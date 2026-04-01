import React from 'react';
import { Users } from 'lucide-react';
import { ItemListPanel } from '../shared/ItemListPanel';
import { Input } from '../shared/FormFields';
import type { ReferenceItem } from '../../../types/cv';

const DEFAULT_ITEM: Omit<ReferenceItem, 'id'> = {
  name: '',
  position: '',
  company: '',
  contact: '',
};

export function ReferencesPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <ItemListPanel<ReferenceItem>
      title="Referencje"
      icon={Users}
      isOpen={isOpen}
      onToggle={onToggle}
      arrayName="references"
      defaultItem={DEFAULT_ITEM}
      itemLabel={(i) => `Referencja #${i}`}
      addLabel="Dodaj referencję"
      renderFields={(ref, onChange) => (
        <>
          <Input
            label="Imię i nazwisko"
            value={ref.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
          <Input
            label="Stanowisko"
            value={ref.position}
            onChange={(e) => onChange('position', e.target.value)}
          />
          <Input
            label="Firma"
            value={ref.company}
            onChange={(e) => onChange('company', e.target.value)}
          />
          <Input
            label="Kontakt (email / telefon)"
            value={ref.contact}
            onChange={(e) => onChange('contact', e.target.value)}
          />
        </>
      )}
    />
  );
}
