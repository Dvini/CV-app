import React from 'react';
import { Globe } from 'lucide-react';
import { ItemListPanel } from '../shared/ItemListPanel';
import { Input, Select } from '../shared/FormFields';
import { languageLevels } from '../../../constants/translations';
import type { LanguageItem } from '../../../types/cv';

const DEFAULT_ITEM: Omit<LanguageItem, 'id'> = {
  name: '',
  level: '',
};

export function LanguagesPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <ItemListPanel<LanguageItem>
      title="Języki obce"
      icon={Globe}
      isOpen={isOpen}
      onToggle={onToggle}
      arrayName="languages"
      defaultItem={DEFAULT_ITEM}
      itemLabel={(i) => `Język #${i}`}
      addLabel="Dodaj język"
      renderFields={(lang, onChange) => (
        <div className="field-row">
          <Input
            label="Język"
            value={lang.name}
            placeholder="Np. Angielski"
            onChange={(e) => onChange('name', e.target.value)}
          />
          <Select
            label="Poziom"
            value={lang.level}
            options={languageLevels}
            onChange={(e) => onChange('level', (e.target as HTMLSelectElement).value)}
          />
        </div>
      )}
    />
  );
}
