import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import './Panel.css';

export function Panel({ title, icon: Icon, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`panel ${isOpen ? 'panel--open' : ''}`}>
      <button
        className="panel-header"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        <div className="panel-header-left">
          {Icon && <Icon size={16} className="panel-icon" />}
          <span className="panel-title">{title}</span>
        </div>
        <div className={`panel-chevron ${isOpen ? 'panel-chevron--open' : ''}`}>
          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>
      <div className={`panel-body ${isOpen ? 'panel-body--open' : ''}`}>
        <div className="panel-body-inner">{children}</div>
      </div>
    </div>
  );
}
