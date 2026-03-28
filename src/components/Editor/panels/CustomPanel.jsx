import React from 'react';
import { SquarePen, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCVData, useCVAppearance } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input, Textarea } from '../shared/FormFields';

export function CustomPanel({ isOpen, onToggle }) {
  const { data, setData, addItem, updateItem, removeItem, moveItem } = useCVData();
  const { cvLanguage } = useCVAppearance();

  const handleTitleChange = (e) => {
    setData((prev) => ({ ...prev, customSectionTitle: e.target.value }));
  };

  const add = () =>
    addItem('custom', {
      id: Date.now().toString(),
      title: '',
      subtitle: '',
      date: '',
      description: '',
    });

  return (
    <Panel title="Sekcja własna" icon={SquarePen} isOpen={isOpen} onToggle={onToggle}>
      <Input
        label="Nazwa sekcji w CV"
        value={data.customSectionTitle || ''}
        placeholder={cvLanguage === 'en' ? 'Additional' : 'Dodatkowe'}
        onChange={handleTitleChange}
      />
      <p className="field-hint" style={{ marginBottom: '0.75rem', marginTop: '0.5rem' }}>
        Dodaj dowolne wpisy, które nie pasują do pozostałych kategorii.
      </p>
      <div className="items-list">
        {data.custom.map((item, index) => (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">Wpis #{index + 1}</span>
              <div className="item-card-actions">
                <button onClick={() => moveItem('custom', index, 'up')} disabled={index === 0} className="icon-btn"><ArrowUp size={15} /></button>
                <button onClick={() => moveItem('custom', index, 'down')} disabled={index === data.custom.length - 1} className="icon-btn"><ArrowDown size={15} /></button>
                <div className="separator-v" />
                <button onClick={() => removeItem('custom', item.id)} className="icon-btn icon-btn--danger"><Trash2 size={15} /></button>
              </div>
            </div>
            <Input label="Tytuł" value={item.title} onChange={(e) => updateItem('custom', item.id, 'title', e.target.value)} />
            <Input label="Podtytuł" value={item.subtitle || ''} onChange={(e) => updateItem('custom', item.id, 'subtitle', e.target.value)} />
            <Input label="Data" value={item.date || ''} placeholder="MM/RRRR" onChange={(e) => updateItem('custom', item.id, 'date', e.target.value)} />
            <Textarea label="Opis" value={item.description || ''} onChange={(e) => updateItem('custom', item.id, 'description', e.target.value)} rows={3} />
          </div>
        ))}
        <button onClick={add} className="add-btn">
          <Plus size={16} /> Dodaj wpis
        </button>
      </div>
    </Panel>
  );
}
