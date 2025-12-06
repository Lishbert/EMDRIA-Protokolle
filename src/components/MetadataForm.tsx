import React from 'react';
import { Input, Select, Card } from './ui';
import type { ProtocolMetadata, ProtocolType } from '../types';
import { PROTOCOL_TYPES } from '../constants';

interface MetadataFormProps {
  metadata: Partial<ProtocolMetadata>;
  onChange: (metadata: Partial<ProtocolMetadata>) => void;
  errors?: { [key: string]: boolean };
}

export const MetadataForm: React.FC<MetadataFormProps> = ({ metadata, onChange, errors = {} }) => {
  const handleChange = (field: keyof ProtocolMetadata, value: string) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  return (
    <Card title="Protokoll-Metadaten" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Chiffre *"
          value={metadata.chiffre || ''}
          onChange={(e) => handleChange('chiffre', e.target.value)}
          placeholder="z.B. Patient-001"
          error={errors.chiffre}
          required
        />
        
        <Input
          label="Datum *"
          type="date"
          value={metadata.datum || ''}
          onChange={(e) => handleChange('datum', e.target.value)}
          error={errors.datum}
          required
        />
        
        <Input
          label="Protokollnummer *"
          value={metadata.protokollnummer || ''}
          onChange={(e) => handleChange('protokollnummer', e.target.value)}
          placeholder="z.B. 001"
          error={errors.protokollnummer}
          required
        />
        
        <Select
          label="Protokolltyp *"
          value={metadata.protocolType || ''}
          onChange={(e) => handleChange('protocolType', e.target.value as ProtocolType)}
          error={errors.protocolType}
          required
        >
          <option value="">-- Bitte wählen --</option>
          {PROTOCOL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>
      
      <p className="text-xs text-muted mt-3">* Pflichtfelder</p>
    </Card>
  );
};

