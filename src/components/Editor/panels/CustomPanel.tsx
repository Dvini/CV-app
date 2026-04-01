import React from 'react';
import { SquarePen } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { useCVAppearance } from '../../../context/CVContext';
import { ItemListPanel } from '../shared/ItemListPanel';
import { Input, Textarea } from '../shared/FormFields';
import type { CustomItem } from '../../../types/cv';

const DEFAULT_ITEM: Omit<CustomItem, 'id'> = {
  title: '',
  subtitle: '',
  date: '',
  description: '',
};

export function CustomPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const { data, setData } = useCVData();
  const { cvLanguage } = useCVAppearance();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({ ...prev, customSectionTitle: e.target.value }));
  };

  return (
    <ItemListPanel<CustomItem>
      title="Sekcja własna"
      icon={SquarePen}
      isOpen={isOpen}
      onToggle={onToggle}
      arrayName="custom"
      defaultItem={DEFAULT_ITEM}
      itemLabel={(i) => `Wpis #${i}`}
      addLabel="Dodaj wpis"
      headerSlot={
        <>
          <Input
            label="Nazwa sekcji w CV"
            value={data.customSectionTitle || ''}
            placeholder={cvLanguage === 'en' ? 'Additional' : 'Dodatkowe'}
            onChange={handleTitleChange}
          />
          <p className="field-hint" style={{ marginBottom: '0.75rem', marginTop: '0.5rem' }}>
            Dodaj dowolne wpisy, które nie pasują do pozostałych kategorii.
          </p>
        </>
      }
      renderFields={(item, onChange) => (
        <>
          <Input
            label="Tytuł"
            value={item.title}
            onChange={(e) => onChange('title', e.target.value)}
          />
          <Input
            label="Podtytuł"
            value={item.subtitle || ''}
            onChange={(e) => onChange('subtitle', e.target.value)}
          />
          <Input
            label="Data"
            value={item.date || ''}
            placeholder="MM/RRRR"
            onChange={(e) => onChange('date', e.target.value)}
          />
          <Textarea
            label="Opis"
            value={item.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
            rows={3}
          />
        </>
      )}
    />
  );
}
