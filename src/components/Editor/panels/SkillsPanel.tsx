// @ts-nocheck
import React from 'react';
import { Wrench } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Textarea } from '../shared/FormFields';

export function SkillsPanel({ isOpen, onToggle }) {
  const { data, handleSkillsChange } = useCVData();

  return (
    <Panel title="Umiejętności" icon={Wrench} isOpen={isOpen} onToggle={onToggle}>
      <Textarea
        label="Wymień swoje umiejętności (oddziel przecinkami)"
        value={data.skills}
        onChange={(e) => handleSkillsChange(e.target.value)}
      />
      <p className="field-hint">
        Przecinki automatycznie zamienią się w czystą listę wypunktowaną na podglądzie CV.
      </p>
    </Panel>
  );
}

