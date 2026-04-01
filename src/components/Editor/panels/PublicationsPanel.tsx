import React from 'react';
import { BookOpen } from 'lucide-react';
import { ItemListPanel } from '../shared/ItemListPanel';
import { Input } from '../shared/FormFields';
import type { PublicationItem } from '../../../types/cv';

const DEFAULT_ITEM: Omit<PublicationItem, 'id'> = {
  title: '',
  publisher: '',
  date: '',
  url: '',
};

export function PublicationsPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <ItemListPanel<PublicationItem>
      title="Publikacje"
      icon={BookOpen}
      isOpen={isOpen}
      onToggle={onToggle}
      arrayName="publications"
      defaultItem={DEFAULT_ITEM}
      itemLabel={(i) => `Publikacja #${i}`}
      addLabel="Dodaj publikację"
      renderFields={(pub, onChange) => (
        <>
          <Input
            label="Tytuł"
            value={pub.title}
            onChange={(e) => onChange('title', e.target.value)}
          />
          <Input
            label="Wydawca / Źródło"
            value={pub.publisher}
            onChange={(e) => onChange('publisher', e.target.value)}
          />
          <Input
            label="Data"
            value={pub.date}
            placeholder="MM/RRRR"
            onChange={(e) => onChange('date', e.target.value)}
          />
          <Input
            label="URL"
            value={pub.url || ''}
            placeholder="https://..."
            onChange={(e) => onChange('url', e.target.value)}
          />
        </>
      )}
    />
  );
}
