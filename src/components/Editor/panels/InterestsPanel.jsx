import React from 'react';
import { Heart } from 'lucide-react';
import { useCVData } from '../../../context/CVContext';
import { Panel } from '../shared/Panel';
import { Textarea } from '../shared/FormFields';

export function InterestsPanel({ isOpen, onToggle }) {
  const { data, handleInterestsChange } = useCVData();

  return (
    <Panel title="Zainteresowania" icon={Heart} isOpen={isOpen} onToggle={onToggle}>
      <Textarea
        label="Wymień swoje zainteresowania (oddziel przecinkami)"
        value={data.interests}
        onChange={(e) => handleInterestsChange(e.target.value)}
        placeholder="np. Koszykówka, Fotografia cyfrowa, Literatura Sci-Fi"
        rows={3}
      />
    </Panel>
  );
}
