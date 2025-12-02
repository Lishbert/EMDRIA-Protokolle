import React, { useState, useEffect } from 'react';
import { Button, Card } from './ui';
import { SaveIcon, XMarkIcon, DownloadIcon, PrinterIcon, SparklesIcon } from './icons';
import { MetadataForm } from './MetadataForm';
import { ChannelEditor } from './ChannelEditor';
import type { Protocol, ProtocolType } from '../types';
import { saveProtocol } from '../utils/storage';
import { exportProtocolAsJSON, exportProtocolAsPDF } from '../utils/export';
import { DEFAULT_PROTOCOL_TYPE } from '../constants';
import { getRandomStartKnoten, getRandomChannelItem } from '../utils/testData';

interface ProtocolEditorProps {
  protocol: Protocol | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ProtocolEditor: React.FC<ProtocolEditorProps> = ({ protocol, onSave, onCancel }) => {
  const [editedProtocol, setEditedProtocol] = useState<Partial<Protocol>>({});
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Initialize or reset form when protocol changes
  useEffect(() => {
    if (protocol) {
      setEditedProtocol(protocol);
    } else {
      // New protocol
      setEditedProtocol({
        id: crypto.randomUUID(),
        chiffre: '',
        datum: new Date().toISOString().split('T')[0],
        protokollnummer: '',
        protocolType: DEFAULT_PROTOCOL_TYPE,
        startKnoten: '',
        channel: [],
        createdAt: Date.now(),
        lastModified: Date.now(),
      });
    }
    setErrors({});
    setSaveStatus('idle');
  }, [protocol]);

  const handleMetadataChange = (metadata: Partial<Protocol>) => {
    setEditedProtocol({
      ...editedProtocol,
      ...metadata,
    });
  };

  const handleStartKnotenChange = (value: string) => {
    setEditedProtocol({
      ...editedProtocol,
      startKnoten: value,
    });
  };

  const handleChannelChange = (channel: Protocol['channel']) => {
    setEditedProtocol({
      ...editedProtocol,
      channel,
    });
  };

  const validateProtocol = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};

    if (!editedProtocol.chiffre?.trim()) newErrors.chiffre = true;
    if (!editedProtocol.datum) newErrors.datum = true;
    if (!editedProtocol.protokollnummer?.trim()) newErrors.protokollnummer = true;
    if (!editedProtocol.protocolType) newErrors.protocolType = true;
    if (!editedProtocol.startKnoten?.trim()) newErrors.startKnoten = true;
    if (!editedProtocol.channel || editedProtocol.channel.length === 0) {
      newErrors.channel = true;
    } else {
      // Validate each channel item
      editedProtocol.channel.forEach((item, index) => {
        if (!item.stimulation.anzahlBewegungen || item.stimulation.anzahlBewegungen <= 0) {
          newErrors[`channel_${index}_anzahl`] = true;
        }
        if (!item.fragment.text.trim()) {
          newErrors[`channel_${index}_fragment`] = true;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateProtocol()) {
      setSaveStatus('error');
      return;
    }

    try {
      setSaveStatus('saving');
      
      const protocolToSave: Protocol = {
        id: editedProtocol.id!,
        chiffre: editedProtocol.chiffre!,
        datum: editedProtocol.datum!,
        protokollnummer: editedProtocol.protokollnummer!,
        protocolType: editedProtocol.protocolType as ProtocolType,
        startKnoten: editedProtocol.startKnoten!,
        channel: editedProtocol.channel!,
        createdAt: editedProtocol.createdAt || Date.now(),
        lastModified: Date.now(),
      };

      saveProtocol(protocolToSave);
      setSaveStatus('saved');
      
      setTimeout(() => {
        onSave();
      }, 500);
    } catch (error) {
      console.error('Error saving protocol:', error);
      setSaveStatus('error');
    }
  };

  const handleExportJSON = () => {
    if (!editedProtocol.id) return;
    try {
      const protocolToExport = editedProtocol as Protocol;
      exportProtocolAsJSON(protocolToExport);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Fehler beim Exportieren des Protokolls.');
    }
  };

  const handleExportPDF = () => {
    if (!editedProtocol.id) return;
    try {
      const protocolToExport = editedProtocol as Protocol;
      exportProtocolAsPDF(protocolToExport);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Fehler beim Erstellen der PDF.');
    }
  };

  const hasUnsavedChanges = saveStatus !== 'saved';

  const handleFillStartKnotenTestData = () => {
    setEditedProtocol({
      ...editedProtocol,
      startKnoten: getRandomStartKnoten(),
    });
  };

  const handleFillChannelTestData = () => {
    // Generate 3-6 channel items
    const numItems = Math.floor(Math.random() * 4) + 3;
    const channel = Array.from({ length: numItems }, () => getRandomChannelItem());
    setEditedProtocol({
      ...editedProtocol,
      channel,
    });
  };

  return (
    <div className="space-y-6">
      {/* Metadata Section */}
      <MetadataForm
        metadata={editedProtocol}
        onChange={handleMetadataChange}
        errors={errors}
      />

      {/* Startknoten Section */}
      <Card className="mb-6">
        {/* Header with title and test data button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-on-surface-strong">Startknoten</h2>
          <button
            type="button"
            onClick={handleFillStartKnotenTestData}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
            title="Startknoten mit Testdaten füllen"
          >
            <SparklesIcon />
            Testdaten einfügen
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Beschreibung des Startknotens *
          </label>
          <textarea
            value={editedProtocol.startKnoten || ''}
            onChange={(e) => handleStartKnotenChange(e.target.value)}
            className={`w-full bg-background text-on-surface border ${
              errors.startKnoten ? 'border-red-500' : 'border-muted'
            } rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[100px]`}
            placeholder="Beschreibung des Ausgangspunkts/Startknotens..."
          />
          {errors.startKnoten && (
            <p className="text-red-500 text-xs mt-1">Startknoten ist erforderlich</p>
          )}
        </div>
      </Card>

      {/* Channel Section */}
      <ChannelEditor
        channel={editedProtocol.channel || []}
        onChange={handleChannelChange}
      />
      {errors.channel && (
        <p className="text-red-500 text-sm -mt-4 mb-4">
          Mindestens ein Stimulation-Fragment-Paar ist erforderlich
        </p>
      )}

      {/* Action Buttons */}
      <Card className="sticky bottom-4 z-10 shadow-2xl border-2 border-brand-primary/30">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSave} disabled={saveStatus === 'saving'} variant="success">
              <SaveIcon />
              {saveStatus === 'saving' ? 'Speichert...' : saveStatus === 'saved' ? 'Gespeichert!' : 'Speichern'}
            </Button>
            
            <Button onClick={onCancel} variant="secondary">
              <XMarkIcon />
              Abbrechen
            </Button>
          </div>

          {editedProtocol.id && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleExportJSON} variant="primary" disabled={hasUnsavedChanges}>
                <DownloadIcon />
                JSON Export
              </Button>
              
              <Button onClick={handleExportPDF} variant="primary" disabled={hasUnsavedChanges}>
                <PrinterIcon />
                PDF Export
              </Button>
            </div>
          )}
        </div>

        {saveStatus === 'error' && (
          <p className="text-red-500 text-sm mt-3">
            Fehler beim Speichern. Bitte überprüfen Sie alle Pflichtfelder.
          </p>
        )}
        
        {hasUnsavedChanges && editedProtocol.id && (
          <p className="text-yellow-500 text-sm mt-3">
            Hinweis: Speichern Sie das Protokoll, bevor Sie exportieren.
          </p>
        )}
      </Card>
    </div>
  );
};

