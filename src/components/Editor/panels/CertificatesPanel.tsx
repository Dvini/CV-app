import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { ItemListPanel } from '../shared/ItemListPanel';
import { Input } from '../shared/FormFields';
import type { CertificateItem } from '../../../types/cv';

const DEFAULT_ITEM: Omit<CertificateItem, 'id'> = {
  name: '',
  issuer: '',
  date: '',
  credentialUrl: '',
};

export function CertificatesPanel({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <ItemListPanel<CertificateItem>
      title="Certyfikaty"
      icon={ShieldCheck}
      isOpen={isOpen}
      onToggle={onToggle}
      arrayName="certificates"
      defaultItem={DEFAULT_ITEM}
      itemLabel={(i) => `Certyfikat #${i}`}
      addLabel="Dodaj certyfikat"
      renderFields={(cert, onChange) => (
        <>
          <Input
            label="Nazwa certyfikatu"
            value={cert.name}
            onChange={(e) => onChange('name', e.target.value)}
          />
          <Input
            label="Wydawca"
            value={cert.issuer}
            onChange={(e) => onChange('issuer', e.target.value)}
          />
          <Input
            label="Data uzyskania"
            value={cert.date}
            placeholder="MM/RRRR"
            onChange={(e) => onChange('date', e.target.value)}
          />
          <Input
            label="URL potwierdzenia"
            value={cert.credentialUrl || ''}
            placeholder="https://..."
            onChange={(e) => onChange('credentialUrl', e.target.value)}
          />
        </>
      )}
    />
  );
}
