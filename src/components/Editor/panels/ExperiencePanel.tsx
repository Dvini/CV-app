import React from 'react';
import { Briefcase, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Input, Textarea } from '../shared/FormFields';
import type { ExperienceItem, ExperiencePosition } from '../../../types/cv';

const DEFAULT_POSITION: Omit<ExperiencePosition, 'id'> = {
  title: '',
  startDate: '',
  endDate: '',
};

const DEFAULT_ITEM: Omit<ExperienceItem, 'id'> = {
  company: '',
  positions: [{ id: Date.now().toString(), ...DEFAULT_POSITION }],
  description: '',
  skills: '',
};

function PositionFields({
  positions,
  onUpdatePosition,
  onAddPosition,
  onRemovePosition,
  onMovePosition,
}: {
  positions: ExperiencePosition[];
  onUpdatePosition: (posId: string, field: keyof ExperiencePosition, value: string) => void;
  onAddPosition: () => void;
  onRemovePosition: (posId: string) => void;
  onMovePosition: (index: number, direction: 'up' | 'down') => void;
}) {
  return (
    <div className="positions-group">
      <label className="field-label">Stanowiska</label>
      {positions.map((pos, idx) => (
        <div key={pos.id} className="position-card">
          <div className="position-card-header">
            <span className="position-card-label">Stanowisko #{idx + 1}</span>
            <div className="item-card-actions">
              <button
                onClick={() => onMovePosition(idx, 'up')}
                disabled={idx === 0}
                className="icon-btn"
                title="W górę"
              >
                <ArrowUp size={13} />
              </button>
              <button
                onClick={() => onMovePosition(idx, 'down')}
                disabled={idx === positions.length - 1}
                className="icon-btn"
                title="W dół"
              >
                <ArrowDown size={13} />
              </button>
              {positions.length > 1 && (
                <>
                  <div className="separator-v" />
                  <button
                    onClick={() => onRemovePosition(pos.id)}
                    className="icon-btn icon-btn--danger"
                    title="Usuń stanowisko"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          </div>
          <Input
            label="Tytuł stanowiska"
            value={pos.title}
            placeholder="np. Senior Software Tester"
            onChange={(e) => onUpdatePosition(pos.id, 'title', e.target.value)}
          />
          <div className="field-row">
            <Input
              label="Od"
              value={pos.startDate}
              placeholder="MM/RRRR"
              onChange={(e) => onUpdatePosition(pos.id, 'startDate', e.target.value)}
            />
            <Input
              label="Do"
              value={pos.endDate}
              placeholder="MM/RRRR lub Obecnie"
              onChange={(e) => onUpdatePosition(pos.id, 'endDate', e.target.value)}
            />
          </div>
        </div>
      ))}
      <button onClick={onAddPosition} className="add-position-btn">
        <Plus size={14} /> Dodaj stanowisko
      </button>
    </div>
  );
}

export function ExperiencePanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const { data, addItem, updateItem, removeItem, moveItem } = useCVData();
  const items = (data.experience || []) as ExperienceItem[];

  const handleAdd = () => {
    addItem('experience', {
      id: Date.now().toString(),
      ...DEFAULT_ITEM,
      positions: [{ id: Date.now().toString() + '-pos', ...DEFAULT_POSITION }],
    } as Record<string, unknown>);
  };

  const handleChange = (id: string, field: keyof ExperienceItem, value: unknown) => {
    updateItem('experience', id, field as string, value);
  };

  const handleUpdatePosition = (
    expId: string,
    positions: ExperiencePosition[],
    posId: string,
    field: keyof ExperiencePosition,
    value: string,
  ) => {
    const newPositions = positions.map((p) =>
      p.id === posId ? { ...p, [field]: value } : p,
    );
    handleChange(expId, 'positions', newPositions);
  };

  const handleAddPosition = (expId: string, positions: ExperiencePosition[]) => {
    const newPositions = [...positions, { id: Date.now().toString(), ...DEFAULT_POSITION }];
    handleChange(expId, 'positions', newPositions);
  };

  const handleRemovePosition = (expId: string, positions: ExperiencePosition[], posId: string) => {
    const newPositions = positions.filter((p) => p.id !== posId);
    handleChange(expId, 'positions', newPositions);
  };

  const handleMovePosition = (
    expId: string,
    positions: ExperiencePosition[],
    index: number,
    direction: 'up' | 'down',
  ) => {
    const newPositions = [...positions];
    if (direction === 'up' && index > 0) {
      [newPositions[index - 1], newPositions[index]] = [newPositions[index], newPositions[index - 1]];
    } else if (direction === 'down' && index < newPositions.length - 1) {
      [newPositions[index + 1], newPositions[index]] = [newPositions[index], newPositions[index + 1]];
    }
    handleChange(expId, 'positions', newPositions);
  };

  return (
    <Panel title="Doświadczenie zawodowe" icon={Briefcase} isOpen={isOpen} onToggle={onToggle}>
      <div className="items-list">
        {items.map((exp, index) => (
          <div key={exp.id} className="item-card">
            <div className="item-card-header">
              <span className="item-card-label">Firma #{index + 1}</span>
              <div className="item-card-actions">
                <button
                  onClick={() => moveItem('experience', index, 'up')}
                  disabled={index === 0}
                  className="icon-btn"
                  title="W górę"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  onClick={() => moveItem('experience', index, 'down')}
                  disabled={index === items.length - 1}
                  className="icon-btn"
                  title="W dół"
                >
                  <ArrowDown size={15} />
                </button>
                <div className="separator-v" />
                <button
                  onClick={() => removeItem('experience', exp.id)}
                  className="icon-btn icon-btn--danger"
                  title="Usuń"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <Input
              label="Firma"
              value={exp.company}
              onChange={(e) => handleChange(exp.id, 'company', e.target.value)}
            />

            <PositionFields
              positions={exp.positions || []}
              onUpdatePosition={(posId, field, value) =>
                handleUpdatePosition(exp.id, exp.positions || [], posId, field, value)
              }
              onAddPosition={() => handleAddPosition(exp.id, exp.positions || [])}
              onRemovePosition={(posId) => handleRemovePosition(exp.id, exp.positions || [], posId)}
              onMovePosition={(idx, dir) => handleMovePosition(exp.id, exp.positions || [], idx, dir)}
            />

            <Textarea
              label="Opis obowiązków (wspólny dla wszystkich stanowisk)"
              value={exp.description}
              onChange={(e) => handleChange(exp.id, 'description', e.target.value)}
            />
            <Input
              label="Kluczowe technologie"
              value={exp.skills}
              placeholder="React, TypeScript, Agile"
              onChange={(e) => handleChange(exp.id, 'skills', e.target.value)}
            />
          </div>
        ))}
        <button onClick={handleAdd} className="add-btn">
          <Plus size={16} /> Dodaj doświadczenie
        </button>
      </div>
    </Panel>
  );
}
