import React from 'react';
import { Heart } from 'lucide-react';
import { ItemListPanel } from '../shared/ItemListPanel';
import { Input, Textarea } from '../shared/FormFields';
import type { VolunteerItem } from '../../../types/cv';

const DEFAULT_ITEM: Omit<VolunteerItem, 'id'> = {
  role: '',
  organization: '',
  startDate: '',
  endDate: '',
  description: '',
};

export function VolunteerPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <ItemListPanel<VolunteerItem>
      title="Wolontariat"
      icon={Heart}
      isOpen={isOpen}
      onToggle={onToggle}
      arrayName="volunteer"
      defaultItem={DEFAULT_ITEM}
      itemLabel={(i) => `Wolontariat #${i}`}
      addLabel="Dodaj wolontariat"
      renderFields={(vol, onChange) => (
        <>
          <Input
            label="Rola"
            value={vol.role}
            onChange={(e) => onChange('role', e.target.value)}
          />
          <Input
            label="Organizacja"
            value={vol.organization}
            onChange={(e) => onChange('organization', e.target.value)}
          />
          <div className="field-row">
            <Input
              label="Od"
              value={vol.startDate}
              placeholder="MM/RRRR"
              onChange={(e) => onChange('startDate', e.target.value)}
            />
            <Input
              label="Do"
              value={vol.endDate}
              placeholder="MM/RRRR lub Obecnie"
              onChange={(e) => onChange('endDate', e.target.value)}
            />
          </div>
          <Textarea
            label="Opis"
            value={vol.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={3}
          />
        </>
      )}
    />
  );
}
