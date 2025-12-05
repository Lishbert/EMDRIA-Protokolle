import React, { useState } from 'react';
import { Input, Select, Card } from './ui';
import { SparklesIcon } from './icons';
import type { ProtocolMetadata, ProtocolType } from '../types';
import { PROTOCOL_TYPES } from '../constants';
import { getRandomChiffre, getRandomDate, getRandomProtocolNumber, getRandomItem } from '../utils/testData';

// Confirm Modal Component for Protocol Type Change
interface ProtocolTypeChangeModalProps {
  isOpen: boolean;
  currentType: ProtocolType | undefined;
  newType: ProtocolType;
  onConfirm: () => void;
  onCancel: () => void;
}

const ProtocolTypeChangeModal: React.FC<ProtocolTypeChangeModalProps> = ({ 
  isOpen, 
  currentType, 
  newType, 
  onConfirm, 
  onCancel 
}) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onCancel}
    >
      <div
        className="bg-surface rounded-xl shadow-2xl max-w-md w-full border-2 border-amber-500/30 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-on-surface-strong">Protokolltyp ändern?</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-on-surface text-base leading-relaxed mb-4">
            Möchten Sie den Protokolltyp wirklich ändern?
          </p>
          <div className="bg-background rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-3">
              <span className="font-semibold text-on-surface-strong">{currentType || 'Nicht gewählt'}</span>
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="font-semibold text-brand-primary">{newType}</span>
            </div>
          </div>
          <p className="text-amber-400/90 text-sm">
            <strong>Achtung:</strong> Bei einem Typwechsel gehen die typspezifischen Daten verloren. 
            Die Metadaten (Chiffre, Datum, Protokollnummer) werden übernommen.
          </p>
        </div>
        <div className="p-6 border-t border-muted/20 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 bg-surface hover:bg-background border-2 border-muted/30 hover:border-muted text-on-surface"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white border-2 border-amber-400"
          >
            Typ ändern
          </button>
        </div>
      </div>
    </div>
  );
};

interface MetadataFormProps {
  metadata: Partial<ProtocolMetadata>;
  onChange: (metadata: Partial<ProtocolMetadata>) => void;
  errors?: { [key: string]: boolean };
  lockProtocolType?: boolean;
}

export const MetadataForm: React.FC<MetadataFormProps> = ({ metadata, onChange, errors = {}, lockProtocolType = false }) => {
  const [pendingTypeChange, setPendingTypeChange] = useState<ProtocolType | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleChange = (field: keyof ProtocolMetadata, value: string) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  const handleProtocolTypeChange = (newType: ProtocolType) => {
    // If there's already a protocol type set, show confirmation dialog
    if (metadata.protocolType && metadata.protocolType !== newType) {
      setPendingTypeChange(newType);
      setShowConfirmModal(true);
    } else {
      // No current type or same type selected - just change it
      handleChange('protocolType', newType);
    }
  };

  const confirmTypeChange = () => {
    if (pendingTypeChange) {
      handleChange('protocolType', pendingTypeChange);
    }
    setShowConfirmModal(false);
    setPendingTypeChange(null);
  };

  const cancelTypeChange = () => {
    setShowConfirmModal(false);
    setPendingTypeChange(null);
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
          onChange={(e) => handleProtocolTypeChange(e.target.value as ProtocolType)}
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

      {/* Protocol Type Change Confirmation Modal */}
      <ProtocolTypeChangeModal
        isOpen={showConfirmModal}
        currentType={metadata.protocolType}
        newType={pendingTypeChange || 'Reprozessieren'}
        onConfirm={confirmTypeChange}
        onCancel={cancelTypeChange}
      />
    </Card>
  );
};

