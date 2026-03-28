import React from 'react';
import { LayoutGrid, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { useCV } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { sectionNamesPl } from '../../../constants/translations';

export function LayoutPanel({ isOpen, onToggle }) {
  const {
    sectionOrder,
    sectionColumns,
    template,
    moveSection,
    toggleColumn,
    isFirstInColumn,
    isLastInColumn,
  } = useCV();

  return (
    <Panel title="Układ sekcji" icon={LayoutGrid} isOpen={isOpen} onToggle={onToggle}>
      <p className="field-hint" style={{ marginBottom: '0.75rem' }}>
        Ustaw kolejność i położenie sekcji na swoim CV.
      </p>
      <div className="layout-list">
        {sectionOrder.map((section) => (
          <div key={section} className="layout-item">
            <div className="layout-item-left">
              <GripVertical size={14} className="layout-grip" />
              <span className="layout-item-name">
                {sectionNamesPl[section] || section}
              </span>
            </div>
            <div className="layout-item-right">
              {template === 'twocolumn' && (
                <button
                  onClick={() => toggleColumn(section)}
                  className="btn-column-toggle"
                >
                  {sectionColumns[section] === 'side' ? 'Lewa kol.' : 'Prawa kol.'}
                </button>
              )}
              <div className="layout-arrows">
                <button
                  onClick={() => moveSection(section, 'up')}
                  disabled={isFirstInColumn(section)}
                  className="icon-btn"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => moveSection(section, 'down')}
                  disabled={isLastInColumn(section)}
                  className="icon-btn"
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
