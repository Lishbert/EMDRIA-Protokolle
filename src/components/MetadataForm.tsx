import React from 'react';
import { Input, Select, Card } from './ui';
import { SparklesIcon } from './icons';
import type { ProtocolMetadata, ProtocolType } from '../types';
import { PROTOCOL_TYPES } from '../constants';
import { getRandomChiffre, getRandomDate, getRandomProtocolNumber, getRandomItem } from '../utils/testData';

interface MetadataFormProps {
  metadata: Partial<ProtocolMetadata>;
  onChange: (metadata: Partial<ProtocolMetadata>) => void;
  errors?: { [key: string]: boolean };
  lockProtocolType?: boolean;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({ metadata, onChange, errors = {}, lockProtocolType = false }) => {
  const handleChange = (field: keyof ProtocolMetadata, value: string) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  const fillAllTestData = () => {
    onChange({
      ...metadata,
      chiffre: getRandomChiffre(),
      datum: getRandomDate(),
      protokollnummer: getRandomProtocolNumber(),
      ...(lockProtocolType ? {} : { protocolType: getRandomItem(PROTOCOL_TYPES) }),
    });
  };

  return (
    <Card className="mb-6">
      {/* Header with title and test data button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-on-surface-strong">Protokoll-Metadaten</h2>
        <button
          type="button"
          onClick={fillAllTestData}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
          title="Alle Metadaten mit Testdaten füllen"
        >
          <SparklesIcon />
          Testdaten einfügen
        </button>
      </div>

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
          disabled={lockProtocolType}
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

