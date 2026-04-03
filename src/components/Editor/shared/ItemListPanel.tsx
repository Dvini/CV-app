import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { Panel } from './Panel';
import type { ArrayFieldName } from '../../../types/cv';
import type { LucideIcon } from 'lucide-react';

interface ItemListPanelProps<T extends { id: string }> {
  /** Panel title */
  title: string;
  /** Lucide icon */
  icon: LucideIcon;
  /** Open/collapsed state (controlled) */
  isOpen: boolean;
  onToggle: () => void;
  /** Which data array this panel manages */
  arrayName: ArrayFieldName;
  /** Default item shape (without id) */
  defaultItem: Omit<T, 'id'>;
  /** Label for the item card header, e.g. "Stanowisko #1" */
  itemLabel: (index: number) => string;
  /** Label for the add button */
  addLabel: string;
  /** Render the fields for a single item */
  renderFields: (
    item: T,
    onChange: (field: keyof T, value: unknown) => void,
  ) => React.ReactNode;
  /** Optional content before the list */
  headerSlot?: React.ReactNode;
}

export function ItemListPanel<T extends { id: string }>({
  title,
  icon,
  isOpen,
  onToggle,
  arrayName,
  defaultItem,
  itemLabel,
  addLabel,
  renderFields,
  headerSlot,
}: ItemListPanelProps<T>) {
  const { data, addItem, updateItem, removeItem, moveItem } = useCVData();
  const items = (data[arrayName] as unknown as T[]) || [];

  const handleAdd = () => {
    addItem(arrayName, { id: Date.now().toString(), ...defaultItem } as Record<string, unknown>);
  };

  const handleChange = (id: string, field: keyof T, value: unknown) => {
    updateItem(arrayName, id, field as string, value);
  };

  return (
    <Panel title={title} icon={icon} isOpen={isOpen} onToggle={onToggle}>
      {headerSlot}
      <div className="items-list">
        {items.map((item, index) => (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">{itemLabel(index + 1)}</span>
              <div className="item-card-actions">
                <button
                  onClick={() => moveItem(arrayName, index, 'up')}
                  disabled={index === 0}
                  className="icon-btn"
                  title="W górę"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  onClick={() => moveItem(arrayName, index, 'down')}
                  disabled={index === items.length - 1}
                  className="icon-btn"
                  title="W dół"
                >
                  <ArrowDown size={15} />
                </button>
                <div className="separator-v" />
                <button
                  onClick={() => removeItem(arrayName, item.id)}
                  className="icon-btn icon-btn--danger"
                  title="Usuń"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {renderFields(item, (field, value) => handleChange(item.id, field, value))}
          </div>
        ))}
        <button onClick={handleAdd} className="add-btn">
          <Plus size={16} /> {addLabel}
        </button>
      </div>
    </Panel>
  );
}
