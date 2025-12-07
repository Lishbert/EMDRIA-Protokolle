import React, { useState } from 'react';
import { Input, Select, Card } from './ui';
import { SparklesIcon } from './icons';
import type { ProtocolMetadata, ProtocolType } from '../types';
import { PROTOCOL_TYPES } from '../constants';
import { getRandomChiffre, getRandomDate, getRandomProtocolNumber } from '../utils/testData';

// Confirm Modal for Protocol Type Change
interface ConfirmTypeChangeModalProps {
  isOpen: boolean;
  fromType: string;
  toType: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmTypeChangeModal: React.FC<ConfirmTypeChangeModalProps> = ({ 
  isOpen, 
  fromType, 
  toType, 
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
            <h3 className="text-xl font-bold text-on-surface-strong">Protokolltyp ändern</h3>
          </div>
        </div>
        <div className="p-6">
          <p className="text-on-surface text-base leading-relaxed mb-4">
            Möchten Sie den Protokolltyp wirklich von <span className="font-bold text-amber-400">{fromType || 'unbekannt'}</span> zu <span className="font-bold text-brand-primary">{toType}</span> ändern?
          </p>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-300 text-sm">
              <strong>Achtung:</strong> Beim Wechsel des Protokolltyps können einige spezifische Daten des aktuellen Protokolltyps verloren gehen, da die verschiedenen Protokolltypen unterschiedliche Felder haben.
            </p>
          </div>
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
            Typ wechseln
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
}

export const MetadataForm: React.FC<MetadataFormProps> = ({ metadata, onChange, errors = {} }) => {
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    fromType: string;
    toType: string;
  }>({
    isOpen: false,
    fromType: '',
    toType: '',
  });

  const handleChange = (field: keyof ProtocolMetadata, value: string) => {
    onChange({
      ...metadata,
      [field]: value,
    });
  };

  const handleProtocolTypeChange = (newType: ProtocolType) => {
    const currentType = metadata.protocolType;
    
    // Wenn kein aktueller Typ gesetzt ist oder es der gleiche Typ ist, direkt ändern
    if (!currentType || currentType === newType) {
      handleChange('protocolType', newType);
      return;
    }

    // Bestätigungsdialog anzeigen
    setConfirmModal({
      isOpen: true,
      fromType: currentType,
      toType: newType,
    });
  };

  const handleConfirmTypeChange = () => {
    handleChange('protocolType', confirmModal.toType as ProtocolType);
    setConfirmModal({ isOpen: false, fromType: '', toType: '' });
  };

  const handleCancelTypeChange = () => {
    setConfirmModal({ isOpen: false, fromType: '', toType: '' });
  };

  const handleFillTestData = () => {
    onChange({
      ...metadata,
      chiffre: getRandomChiffre(),
      datum: getRandomDate(),
      protokollnummer: getRandomProtocolNumber(),
    });
  };

  return (
    <>
      <Card className="mb-6">
        {/* Header with title and test data button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-on-surface-strong">Protokoll-Metadaten</h2>
          <button
            type="button"
            onClick={handleFillTestData}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
            title="Metadaten mit Testdaten füllen"
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
      </Card>

      <ConfirmTypeChangeModal
        isOpen={confirmModal.isOpen}
        fromType={confirmModal.fromType}
        toType={confirmModal.toType}
        onConfirm={handleConfirmTypeChange}
        onCancel={handleCancelTypeChange}
      />
    </>
  );
};

