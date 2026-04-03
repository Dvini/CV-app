import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './Panel.css';

interface PanelProps {
  title: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
}

export function Panel({ title, icon: Icon, defaultOpen = false, isOpen: isOpenProp, onToggle, children }: PanelProps) {
  const [isOpenInternal, setIsOpenInternal] = useState(defaultOpen);

  const isControlled = isOpenProp !== undefined;
  const isOpen = isControlled ? isOpenProp : isOpenInternal;
  const handleToggle = isControlled ? onToggle! : () => setIsOpenInternal((prev) => !prev);

  return (
    <div className={`panel ${isOpen ? 'panel--open' : ''}`}>
      <button
        className="panel-header"
        onClick={handleToggle}
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
        {isOpen && <div className="panel-body-inner">{children}</div>}
      </div>
    </div>
  );
}
