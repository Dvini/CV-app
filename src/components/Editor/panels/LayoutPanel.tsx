// @ts-nocheck
import React, { useRef, useState } from 'react';
import { LayoutGrid, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { useCVData, useCVAppearance } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { sectionNamesPl } from '../../../constants/translations';

export function LayoutPanel({ isOpen, onToggle }) {
  const {
    sectionOrder,
    sectionColumns,
    moveSection,
    toggleColumn,
    isFirstInColumn,
    isLastInColumn,
    setSectionOrder,
  } = useCVData();
  const { template } = useCVAppearance();

  const dragItem = useRef(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const handleDragStart = (e, section) => {
    dragItem.current = section;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, section) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragItem.current !== section) {
      setDragOverItem(section);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, targetSection) => {
    e.preventDefault();
    const sourceSection = dragItem.current;
    if (!sourceSection || sourceSection === targetSection) return;

    setSectionOrder((prev) => {
      const newOrder = [...prev];
      const fromIdx = newOrder.indexOf(sourceSection);
      const toIdx = newOrder.indexOf(targetSection);
      if (fromIdx === -1 || toIdx === -1) return prev;
      newOrder.splice(fromIdx, 1);
      newOrder.splice(toIdx, 0, sourceSection);
      return newOrder;
    });

    dragItem.current = null;
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    setDragOverItem(null);
  };

  return (
    <Panel title="Układ sekcji" icon={LayoutGrid} isOpen={isOpen} onToggle={onToggle}>
      <p className="field-hint" style={{ marginBottom: '0.75rem' }}>
        Ustaw kolejność i położenie sekcji na swoim CV.
      </p>
      <div className="layout-list">
        {sectionOrder.map((section) => (
          <div
            key={section}
            className={`layout-item${dragOverItem === section ? ' layout-item--drag-over' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, section)}
            onDragOver={(e) => handleDragOver(e, section)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section)}
            onDragEnd={handleDragEnd}
          >
            <div className="layout-item-left">
              <GripVertical size={14} className="layout-grip" style={{ cursor: 'grab' }} />
              <span className="layout-item-name">
                {sectionNamesPl[section] || section}
              </span>
            </div>
            <div className="layout-item-right">
              {template === 'twocolumn' && (
                <button
                  onClick={() => toggleColumn(section)}
                  className="btn-column-toggle"
                  aria-label={`Zmień kolumnę dla ${sectionNamesPl[section] || section}`}
                >
                  {sectionColumns[section] === 'side' ? 'Lewa kol.' : 'Prawa kol.'}
                </button>
              )}
              <div className="layout-arrows">
                <button
                  onClick={() => moveSection(section, 'up')}
                  disabled={isFirstInColumn(section)}
                  className="icon-btn"
                  aria-label={`Przenieś ${sectionNamesPl[section] || section} w górę`}
                  title="Do góry"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => moveSection(section, 'down')}
                  disabled={isLastInColumn(section)}
                  className="icon-btn"
                  aria-label={`Przenieś ${sectionNamesPl[section] || section} w dół`}
                  title="W dół"
                >
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

