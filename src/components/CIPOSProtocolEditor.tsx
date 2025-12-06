import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Select } from './ui';
import { SaveIcon, XMarkIcon, DownloadIcon, PrinterIcon, PlusIcon, TrashIcon } from './icons';
import { MetadataForm } from './MetadataForm';
import type { 
  CIPOSProtocol, 
  CIPOSDurchgang,
  CIPOSStimulationMethode,
  ReorientierungsMethode,
} from '../types';
import { saveProtocol } from '../utils/storage';
import { exportProtocolAsJSON, exportProtocolAsPDF } from '../utils/export';
import {
  CIPOS_STIMULATION_METHODE_OPTIONS,
  CIPOS_REORIENTIERUNG_OPTIONS,
  CIPOS_DAUER_OPTIONS,
} from '../constants';

interface CIPOSProtocolEditorProps {
  protocol: CIPOSProtocol | null;
  onSave: () => void;
  onCancel: () => void;
}

export const CIPOSProtocolEditor: React.FC<CIPOSProtocolEditorProps> = ({ protocol, onSave, onCancel }) => {
  const [editedProtocol, setEditedProtocol] = useState<Partial<CIPOSProtocol>>({});
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Initialize or reset form when protocol changes
  useEffect(() => {
    if (protocol) {
      setEditedProtocol(protocol);
    } else {
      // New CIPOS protocol
      setEditedProtocol({
        id: crypto.randomUUID(),
        chiffre: '',
        datum: new Date().toISOString().split('T')[0],
        protokollnummer: '',
        protocolType: 'CIPOS',
        createdAt: Date.now(),
        lastModified: Date.now(),
        gegenwartsorientierung_vorher: {
          prozent_gegenwartsorientierung: 50,
          indikatoren_patient: '',
        },
        verstaerkung_gegenwart: {
          stimulation_methode: 'visuell',
          dauer_anzahl_sets: '',
          reaktion_verbesserung: null,
          gegenwartsorientierung_nach_stimulation: 50,
        },
        erster_kontakt: {
          zielerinnerung_beschreibung: '',
          sud_vor_kontakt: 5,
          belastungsdauer_sekunden: 5,
        },
        durchgaenge: [],
        abschlussbewertung: {
          sud_nach_letztem_durchgang: 5,
        },
        nachbesprechung: {
          nachbesprechung_durchgefuehrt: null,
          hinweis_inneres_prozessieren: null,
        },
        schwierigkeiten: {
          probleme_reorientierung: null,
          cipos_vorzeitig_beendet: null,
        },
        abschluss_dokumentation: {},
      });
    }
    setErrors({});
    setSaveStatus('idle');
  }, [protocol]);

  const handleMetadataChange = (metadata: Partial<CIPOSProtocol>) => {
    setEditedProtocol({
      ...editedProtocol,
      ...metadata,
    });
  };

  // Helper to update nested fields
  const updateNestedField = <T extends keyof CIPOSProtocol>(
    section: T,
    field: string,
    value: unknown
  ) => {
    setEditedProtocol({
      ...editedProtocol,
      [section]: {
        ...(editedProtocol[section] as object),
        [field]: value,
      },
    });
  };

  // Add new durchgang
  const addDurchgang = () => {
    const currentDurchgaenge = editedProtocol.durchgaenge || [];
    if (currentDurchgaenge.length >= 3) return; // Max 3 Durchgänge

    const newDurchgang: CIPOSDurchgang = {
      id: crypto.randomUUID(),
      durchgang_nummer: currentDurchgaenge.length + 1,
      zaehl_technik: null,
      dauer_sekunden: editedProtocol.erster_kontakt?.belastungsdauer_sekunden || 5,
      reorientierung_methoden: [],
      gegenwartsorientierung_nach: 50,
    };
    setEditedProtocol({
      ...editedProtocol,
      durchgaenge: [...currentDurchgaenge, newDurchgang],
    });
  };

  // Remove durchgang
  const removeDurchgang = (id: string) => {
    const currentDurchgaenge = editedProtocol.durchgaenge || [];
    const newDurchgaenge = currentDurchgaenge
      .filter((d) => d.id !== id)
      .map((d, index) => ({ ...d, durchgang_nummer: index + 1 }));
    setEditedProtocol({
      ...editedProtocol,
      durchgaenge: newDurchgaenge,
    });
  };

  // Update durchgang field
  const updateDurchgang = (id: string, field: keyof CIPOSDurchgang, value: unknown) => {
    const currentDurchgaenge = editedProtocol.durchgaenge || [];
    const newDurchgaenge = currentDurchgaenge.map((d) =>
      d.id === id ? { ...d, [field]: value } : d
    );
    setEditedProtocol({
      ...editedProtocol,
      durchgaenge: newDurchgaenge,
    });
  };

  // Toggle reorientierung methode
  const toggleReorientierungMethode = (durchgangId: string, methode: ReorientierungsMethode) => {
    const currentDurchgaenge = editedProtocol.durchgaenge || [];
    const durchgang = currentDurchgaenge.find((d) => d.id === durchgangId);
    if (!durchgang) return;

    const currentMethoden = durchgang.reorientierung_methoden || [];
    const newMethoden = currentMethoden.includes(methode)
      ? currentMethoden.filter((m) => m !== methode)
      : [...currentMethoden, methode];
    
    updateDurchgang(durchgangId, 'reorientierung_methoden', newMethoden);
  };

  const validateProtocol = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};

    if (!editedProtocol.chiffre?.trim()) newErrors.chiffre = true;
    if (!editedProtocol.datum) newErrors.datum = true;
    if (!editedProtocol.protokollnummer?.trim()) newErrors.protokollnummer = true;

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

      const protocolToSave: CIPOSProtocol = {
        id: editedProtocol.id!,
        chiffre: editedProtocol.chiffre!,
        datum: editedProtocol.datum!,
        protokollnummer: editedProtocol.protokollnummer!,
        protocolType: 'CIPOS',
        createdAt: editedProtocol.createdAt || Date.now(),
        lastModified: Date.now(),
        gegenwartsorientierung_vorher: editedProtocol.gegenwartsorientierung_vorher!,
        verstaerkung_gegenwart: editedProtocol.verstaerkung_gegenwart!,
        erster_kontakt: editedProtocol.erster_kontakt!,
        durchgaenge: editedProtocol.durchgaenge!,
        abschlussbewertung: editedProtocol.abschlussbewertung!,
        nachbesprechung: editedProtocol.nachbesprechung!,
        schwierigkeiten: editedProtocol.schwierigkeiten!,
        abschluss_dokumentation: editedProtocol.abschluss_dokumentation!,
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
      exportProtocolAsJSON(editedProtocol as CIPOSProtocol);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Fehler beim Exportieren des Protokolls.');
    }
  };

  const handleExportPDF = () => {
    if (!editedProtocol.id) return;
    try {
      exportProtocolAsPDF(editedProtocol as CIPOSProtocol);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Fehler beim Erstellen der PDF.');
    }
  };

  const hasUnsavedChanges = saveStatus !== 'saved';

  // Helper for percentage color
  const getPercentageColor = (value: number) => {
    if (value >= 70) return 'text-green-400';
    if (value >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Helper for SUD color
  const getSUDColor = (value: number) => {
    if (value <= 3) return 'text-green-400';
    if (value <= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Metadata Section */}
      <MetadataForm
        metadata={editedProtocol}
        onChange={handleMetadataChange}
        errors={errors}
      />

      {/* Section 2: Gegenwartsorientierung vor Beginn */}
      <Card className="mb-6 border-l-4 border-green-500">
        <h2 className="text-lg font-bold text-green-400 mb-4">2. Einschätzung der Gegenwartsorientierung (vor Beginn)</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">
            Gegenwartsorientierung (%)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={editedProtocol.gegenwartsorientierung_vorher?.prozent_gegenwartsorientierung ?? 50}
              onChange={(e) => updateNestedField('gegenwartsorientierung_vorher', 'prozent_gegenwartsorientierung', parseInt(e.target.value))}
              className="flex-1 accent-green-500"
            />
            <span className={`text-2xl font-bold w-16 text-center ${getPercentageColor(editedProtocol.gegenwartsorientierung_vorher?.prozent_gegenwartsorientierung ?? 50)}`}>
              {editedProtocol.gegenwartsorientierung_vorher?.prozent_gegenwartsorientierung ?? 50}%
            </span>
          </div>
          <p className="text-xs text-muted mt-1">Ziel: ≥70% vor Beginn der Belastungskonfrontation</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Indikatoren (Patient:in)</label>
          <textarea
            value={editedProtocol.gegenwartsorientierung_vorher?.indikatoren_patient || ''}
            onChange={(e) => updateNestedField('gegenwartsorientierung_vorher', 'indikatoren_patient', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[80px]"
            placeholder="Woran merkt die Patient:in, dass sie gegenwartsorientiert ist?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Beobachtungen (Therapeut:in)</label>
          <textarea
            value={editedProtocol.gegenwartsorientierung_vorher?.beobachtungen_therapeut || ''}
            onChange={(e) => updateNestedField('gegenwartsorientierung_vorher', 'beobachtungen_therapeut', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[60px]"
            placeholder="Beobachtungen zur Gegenwartsorientierung..."
          />
        </div>
      </Card>

      {/* Section 3: Verstärkung der sicheren Gegenwart */}
      <Card className="mb-6 border-l-4 border-green-500">
        <h2 className="text-lg font-bold text-green-400 mb-4">3. Verstärkung der sicheren Gegenwart – Durchführung</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            label="Art der Stimulation"
            value={editedProtocol.verstaerkung_gegenwart?.stimulation_methode || 'visuell'}
            onChange={(e) => updateNestedField('verstaerkung_gegenwart', 'stimulation_methode', e.target.value)}
          >
            {CIPOS_STIMULATION_METHODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          
          {editedProtocol.verstaerkung_gegenwart?.stimulation_methode === 'kombination' && (
            <Input
              label="Beschreibung der Kombination"
              value={editedProtocol.verstaerkung_gegenwart?.stimulation_methode_sonstiges || ''}
              onChange={(e) => updateNestedField('verstaerkung_gegenwart', 'stimulation_methode_sonstiges', e.target.value)}
              placeholder="Welche Kombination?"
            />
          )}
        </div>

        <div className="mb-4">
          <Input
            label="Dauer / Anzahl kurzer Sets"
            value={editedProtocol.verstaerkung_gegenwart?.dauer_anzahl_sets || ''}
            onChange={(e) => updateNestedField('verstaerkung_gegenwart', 'dauer_anzahl_sets', e.target.value)}
            placeholder="z.B. 5 Sets à 10 Bewegungen"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Reaktion / Verbesserung wahrgenommen?</label>
          <div className="flex gap-4">
            {[
              { value: true, label: 'Ja' },
              { value: false, label: 'Nein' },
            ].map((option) => (
              <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reaktion_verbesserung"
                  checked={editedProtocol.verstaerkung_gegenwart?.reaktion_verbesserung === option.value}
                  onChange={() => updateNestedField('verstaerkung_gegenwart', 'reaktion_verbesserung', option.value)}
                  className="w-4 h-4 text-green-500 focus:ring-green-500"
                />
                <span className="text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">
            Gegenwartsorientierung nach Stimulation (%)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={editedProtocol.verstaerkung_gegenwart?.gegenwartsorientierung_nach_stimulation ?? 50}
              onChange={(e) => updateNestedField('verstaerkung_gegenwart', 'gegenwartsorientierung_nach_stimulation', parseInt(e.target.value))}
              className="flex-1 accent-green-500"
            />
            <span className={`text-2xl font-bold w-16 text-center ${getPercentageColor(editedProtocol.verstaerkung_gegenwart?.gegenwartsorientierung_nach_stimulation ?? 50)}`}>
              {editedProtocol.verstaerkung_gegenwart?.gegenwartsorientierung_nach_stimulation ?? 50}%
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Kommentar / Beobachtungen</label>
          <textarea
            value={editedProtocol.verstaerkung_gegenwart?.kommentar || ''}
            onChange={(e) => updateNestedField('verstaerkung_gegenwart', 'kommentar', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[60px]"
            placeholder="Weitere Beobachtungen..."
          />
        </div>
      </Card>

      {/* Section 4: Erster Kontakt */}
      <Card className="mb-6 border-l-4 border-green-500">
        <h2 className="text-lg font-bold text-green-400 mb-4">4. Erster Kontakt mit der belastenden Erinnerung</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">4.1 Beschreibung der Zielerinnerung / Auslöser</label>
          <textarea
            value={editedProtocol.erster_kontakt?.zielerinnerung_beschreibung || ''}
            onChange={(e) => updateNestedField('erster_kontakt', 'zielerinnerung_beschreibung', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[100px]"
            placeholder="Welche belastende Erinnerung wird bearbeitet?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">4.2 SUD vor dem 1. Durchgang (0-10)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                value={editedProtocol.erster_kontakt?.sud_vor_kontakt ?? 5}
                onChange={(e) => updateNestedField('erster_kontakt', 'sud_vor_kontakt', parseInt(e.target.value))}
                className="flex-1 accent-green-500"
              />
              <span className={`text-2xl font-bold w-12 text-center ${getSUDColor(editedProtocol.erster_kontakt?.sud_vor_kontakt ?? 5)}`}>
                {editedProtocol.erster_kontakt?.sud_vor_kontakt ?? 5}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">4.3 Belastungsdauer (Sekunden)</label>
            <Select
              value={String(editedProtocol.erster_kontakt?.belastungsdauer_sekunden || 5)}
              onChange={(e) => updateNestedField('erster_kontakt', 'belastungsdauer_sekunden', parseInt(e.target.value))}
            >
              {CIPOS_DAUER_OPTIONS.map((val) => (
                <option key={val} value={val}>{val} Sekunden</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Durchgänge */}
      <Card className="mb-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-green-400">Durchgänge</h2>
          <Button 
            onClick={addDurchgang} 
            variant="secondary" 
            className="!py-1 !px-3"
            disabled={(editedProtocol.durchgaenge?.length || 0) >= 3}
          >
            <PlusIcon />
            Durchgang hinzufügen
          </Button>
        </div>

        {editedProtocol.durchgaenge?.map((durchgang) => (
          <div key={durchgang.id} className="border border-muted rounded-lg p-4 mb-4 bg-surface-alt">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-green-400">
                {durchgang.durchgang_nummer === 1 ? '1. Durchgang (4.4/4.5)' : 
                 durchgang.durchgang_nummer === 2 ? '2. Durchgang (5)' : '3. Durchgang (6)'}
              </span>
              <button
                onClick={() => removeDurchgang(durchgang.id)}
                className="text-red-400 hover:text-red-300 p-1"
                title="Durchgang entfernen"
              >
                <TrashIcon />
              </button>
            </div>

            {/* Bereitschaft (für Durchgänge 2 und 3) */}
            {durchgang.durchgang_nummer > 1 && (
              <div className="mb-4 p-3 bg-background rounded-lg">
                <label className="block text-sm font-medium text-on-surface mb-2">Bereitschaft der Patient:in?</label>
                <div className="flex gap-4 mb-2">
                  {[
                    { value: true, label: 'Ja' },
                    { value: false, label: 'Nein' },
                  ].map((option) => (
                    <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`bereitschaft_${durchgang.id}`}
                        checked={durchgang.bereitschaft_patient === option.value}
                        onChange={() => updateDurchgang(durchgang.id, 'bereitschaft_patient', option.value)}
                        className="w-4 h-4 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-on-surface">{option.label}</span>
                    </label>
                  ))}
                </div>
                <Input
                  placeholder="Kommentar zur Bereitschaft..."
                  value={durchgang.bereitschaft_kommentar || ''}
                  onChange={(e) => updateDurchgang(durchgang.id, 'bereitschaft_kommentar', e.target.value)}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Zähltechnik angewendet?</label>
                <div className="flex gap-4">
                  {[
                    { value: true, label: 'Ja' },
                    { value: false, label: 'Nein' },
                  ].map((option) => (
                    <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`zaehl_technik_${durchgang.id}`}
                        checked={durchgang.zaehl_technik === option.value}
                        onChange={() => updateDurchgang(durchgang.id, 'zaehl_technik', option.value)}
                        className="w-4 h-4 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-on-surface">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Select
                label="Dauer (Sekunden)"
                value={String(durchgang.dauer_sekunden)}
                onChange={(e) => updateDurchgang(durchgang.id, 'dauer_sekunden', parseInt(e.target.value))}
              >
                {CIPOS_DAUER_OPTIONS.map((val) => (
                  <option key={val} value={val}>{val} Sekunden</option>
                ))}
              </Select>
            </div>

            {/* Reorientierungsmethoden */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-on-surface mb-2">Reorientierungsmethoden</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border border-muted rounded-lg">
                {CIPOS_REORIENTIERUNG_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-start gap-2 cursor-pointer p-1 rounded hover:bg-background">
                    <input
                      type="checkbox"
                      checked={durchgang.reorientierung_methoden?.includes(option.value) || false}
                      onChange={() => toggleReorientierungMethode(durchgang.id, option.value)}
                      className="w-4 h-4 mt-0.5 rounded border-muted bg-background text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-on-surface">{option.label}</span>
                  </label>
                ))}
              </div>
              {durchgang.reorientierung_methoden?.includes('sonstiges') && (
                <Input
                  className="mt-2"
                  placeholder="Sonstige Methode beschreiben..."
                  value={durchgang.reorientierung_sonstiges || ''}
                  onChange={(e) => updateDurchgang(durchgang.id, 'reorientierung_sonstiges', e.target.value)}
                />
              )}
            </div>

            {/* Eigene Reorientierungstechniken Freitext */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-on-surface mb-2">Eigene Reorientierungstechniken (Freitext)</label>
              <textarea
                value={durchgang.reorientierung_freitext || ''}
                onChange={(e) => updateDurchgang(durchgang.id, 'reorientierung_freitext', e.target.value)}
                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[60px] text-sm"
                placeholder="Beschreiben Sie hier eigene oder individuelle Techniken..."
              />
            </div>

            {/* Gegenwartsorientierung nach Reorientierung */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-on-surface mb-2">
                Gegenwartsorientierung nach Reorientierung (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={durchgang.gegenwartsorientierung_nach}
                  onChange={(e) => updateDurchgang(durchgang.id, 'gegenwartsorientierung_nach', parseInt(e.target.value))}
                  className="flex-1 accent-green-500"
                />
                <span className={`text-2xl font-bold w-16 text-center ${getPercentageColor(durchgang.gegenwartsorientierung_nach)}`}>
                  {durchgang.gegenwartsorientierung_nach}%
                </span>
              </div>
            </div>

            {/* Stimulation zur Verstärkung (nur für 1. Durchgang) */}
            {durchgang.durchgang_nummer === 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Kurze Stimulation zur Verstärkung (5 langsame Sets)?
                </label>
                <div className="flex gap-4">
                  {[
                    { value: true, label: 'Ja' },
                    { value: false, label: 'Nein' },
                  ].map((option) => (
                    <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`stimulation_verstaerkung_${durchgang.id}`}
                        checked={durchgang.stimulation_verstaerkung === option.value}
                        onChange={() => updateDurchgang(durchgang.id, 'stimulation_verstaerkung', option.value)}
                        className="w-4 h-4 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-on-surface">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Kommentar / Beobachtung</label>
              <textarea
                value={durchgang.kommentar || ''}
                onChange={(e) => updateDurchgang(durchgang.id, 'kommentar', e.target.value)}
                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[50px] text-sm"
                placeholder="Beobachtungen zum Durchgang..."
              />
            </div>
          </div>
        ))}

        {(!editedProtocol.durchgaenge || editedProtocol.durchgaenge.length === 0) && (
          <p className="text-muted text-sm italic">Noch keine Durchgänge hinzugefügt. CIPOS umfasst typischerweise 1-3 Durchgänge.</p>
        )}
      </Card>

      {/* Section 7: Abschlussbewertung */}
      <Card className="mb-6 border-l-4 border-green-500">
        <h2 className="text-lg font-bold text-green-400 mb-4">7. Abschlussbewertung</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">7.1 SUD nach dem letzten Durchgang (0-10)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="10"
              value={editedProtocol.abschlussbewertung?.sud_nach_letztem_durchgang ?? 5}
              onChange={(e) => updateNestedField('abschlussbewertung', 'sud_nach_letztem_durchgang', parseInt(e.target.value))}
              className="flex-1 accent-green-500"
            />
            <span className={`text-2xl font-bold w-12 text-center ${getSUDColor(editedProtocol.abschlussbewertung?.sud_nach_letztem_durchgang ?? 5)}`}>
              {editedProtocol.abschlussbewertung?.sud_nach_letztem_durchgang ?? 5}
            </span>
          </div>
        </div>

        {/* SUD Veränderung */}
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 mb-4">
          <span className="text-sm text-on-surface">7.2 Veränderungsverlauf: </span>
          <span className="font-bold">
            {editedProtocol.erster_kontakt?.sud_vor_kontakt ?? '-'} → {editedProtocol.abschlussbewertung?.sud_nach_letztem_durchgang ?? '-'}
          </span>
          {editedProtocol.erster_kontakt?.sud_vor_kontakt !== undefined && 
           editedProtocol.abschlussbewertung?.sud_nach_letztem_durchgang !== undefined && (
            <span className={`ml-2 font-bold ${
              editedProtocol.abschlussbewertung.sud_nach_letztem_durchgang < editedProtocol.erster_kontakt.sud_vor_kontakt ? 'text-green-400' :
              editedProtocol.abschlussbewertung.sud_nach_letztem_durchgang > editedProtocol.erster_kontakt.sud_vor_kontakt ? 'text-red-400' : 'text-on-surface'
            }`}>
              ({editedProtocol.abschlussbewertung.sud_nach_letztem_durchgang - editedProtocol.erster_kontakt.sud_vor_kontakt > 0 ? '+' : ''}
              {editedProtocol.abschlussbewertung.sud_nach_letztem_durchgang - editedProtocol.erster_kontakt.sud_vor_kontakt})
            </span>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">7.3 Rückmeldung: Wie fühlt sich die Erinnerung nun an?</label>
          <textarea
            value={editedProtocol.abschlussbewertung?.rueckmeldung_erinnerung || ''}
            onChange={(e) => updateNestedField('abschlussbewertung', 'rueckmeldung_erinnerung', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[60px]"
            placeholder="Patient:innen-Rückmeldung zur Erinnerung..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Veränderung im Körper?</label>
          <textarea
            value={editedProtocol.abschlussbewertung?.rueckmeldung_koerper || ''}
            onChange={(e) => updateNestedField('abschlussbewertung', 'rueckmeldung_koerper', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[60px]"
            placeholder="Körperliche Veränderungen..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Subjektive Sicherheit jetzt (%)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={editedProtocol.abschlussbewertung?.subjektive_sicherheit ?? 50}
              onChange={(e) => updateNestedField('abschlussbewertung', 'subjektive_sicherheit', parseInt(e.target.value))}
              className="flex-1 accent-green-500"
            />
            <span className={`text-xl font-bold w-16 text-center ${getPercentageColor(editedProtocol.abschlussbewertung?.subjektive_sicherheit ?? 50)}`}>
              {editedProtocol.abschlussbewertung?.subjektive_sicherheit ?? 50}%
            </span>
          </div>
        </div>
      </Card>

      {/* Section 8: Nachbesprechung */}
      <Card className="mb-6 border-l-4 border-green-500">
        <h2 className="text-lg font-bold text-green-400 mb-4">8. Nachbesprechung / Abschluss</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Nachbesprechung durchgeführt?</label>
            <div className="flex gap-4">
              {[
                { value: true, label: 'Ja' },
                { value: false, label: 'Nein' },
              ].map((option) => (
                <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="nachbesprechung_durchgefuehrt"
                    checked={editedProtocol.nachbesprechung?.nachbesprechung_durchgefuehrt === option.value}
                    onChange={() => updateNestedField('nachbesprechung', 'nachbesprechung_durchgefuehrt', option.value)}
                    className="w-4 h-4 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-on-surface">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Hinweis auf weiteres inneres Prozessieren?</label>
            <div className="flex gap-4">
              {[
                { value: true, label: 'Ja' },
                { value: false, label: 'Nein' },
              ].map((option) => (
                <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="hinweis_inneres_prozessieren"
                    checked={editedProtocol.nachbesprechung?.hinweis_inneres_prozessieren === option.value}
                    onChange={() => updateNestedField('nachbesprechung', 'hinweis_inneres_prozessieren', option.value)}
                    className="w-4 h-4 text-green-500 focus:ring-green-500"
                  />
                  <span className="text-on-surface">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Input
            label="Aufgabe / Empfehlung für Tagebuch"
            value={editedProtocol.nachbesprechung?.aufgabe_tagebuch || ''}
            onChange={(e) => updateNestedField('nachbesprechung', 'aufgabe_tagebuch', e.target.value)}
            placeholder="z.B. Veränderungen notieren..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Besondere Beobachtungen der Therapeut:in</label>
          <textarea
            value={editedProtocol.nachbesprechung?.beobachtungen_therapeut || ''}
            onChange={(e) => updateNestedField('nachbesprechung', 'beobachtungen_therapeut', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[60px]"
            placeholder="Beobachtungen zum Abschluss..."
          />
        </div>
      </Card>

      {/* Section 9: Schwierigkeiten */}
      <Card className="mb-6 border-l-4 border-green-500">
        <h2 className="text-lg font-bold text-green-400 mb-4">9. Falls Schwierigkeiten auftraten</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Probleme bei der Reorientierung?</label>
          <div className="flex gap-4">
            {[
              { value: true, label: 'Ja' },
              { value: false, label: 'Nein' },
            ].map((option) => (
              <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="probleme_reorientierung"
                  checked={editedProtocol.schwierigkeiten?.probleme_reorientierung === option.value}
                  onChange={() => updateNestedField('schwierigkeiten', 'probleme_reorientierung', option.value)}
                  className="w-4 h-4 text-green-500 focus:ring-green-500"
                />
                <span className="text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {editedProtocol.schwierigkeiten?.probleme_reorientierung && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-on-surface mb-2">Erforderliche zusätzliche Stabilisierungstechniken</label>
            <textarea
              value={editedProtocol.schwierigkeiten?.stabilisierungstechniken || ''}
              onChange={(e) => updateNestedField('schwierigkeiten', 'stabilisierungstechniken', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[60px]"
              placeholder="Welche Techniken wurden eingesetzt?"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">CIPOS vorzeitig beendet?</label>
          <div className="flex gap-4">
            {[
              { value: true, label: 'Ja' },
              { value: false, label: 'Nein' },
            ].map((option) => (
              <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="cipos_vorzeitig_beendet"
                  checked={editedProtocol.schwierigkeiten?.cipos_vorzeitig_beendet === option.value}
                  onChange={() => updateNestedField('schwierigkeiten', 'cipos_vorzeitig_beendet', option.value)}
                  className="w-4 h-4 text-green-500 focus:ring-green-500"
                />
                <span className="text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {editedProtocol.schwierigkeiten?.cipos_vorzeitig_beendet && (
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Grund für vorzeitige Beendigung</label>
            <textarea
              value={editedProtocol.schwierigkeiten?.cipos_vorzeitig_grund || ''}
              onChange={(e) => updateNestedField('schwierigkeiten', 'cipos_vorzeitig_grund', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[60px]"
              placeholder="Warum wurde abgebrochen?"
            />
          </div>
        )}
      </Card>

      {/* Section 10: Abschluss Dokumentation */}
      <Card className="mb-6 border-l-4 border-green-500">
        <h2 className="text-lg font-bold text-green-400 mb-4">10. Abschluss der Dokumentation</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Gesamteinschätzung der Therapeut:in</label>
          <textarea
            value={editedProtocol.abschluss_dokumentation?.gesamteinschaetzung_therapeut || ''}
            onChange={(e) => updateNestedField('abschluss_dokumentation', 'gesamteinschaetzung_therapeut', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[80px]"
            placeholder="Gesamtbewertung der Sitzung..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Planung für nächste Sitzung</label>
          <textarea
            value={editedProtocol.abschluss_dokumentation?.planung_naechste_sitzung || ''}
            onChange={(e) => updateNestedField('abschluss_dokumentation', 'planung_naechste_sitzung', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y min-h-[60px]"
            placeholder="Was ist für die nächste Sitzung geplant?"
          />
        </div>

        <Input
          label="Signatur / Name der Therapeut:in"
          value={editedProtocol.abschluss_dokumentation?.signatur_therapeut || ''}
          onChange={(e) => updateNestedField('abschluss_dokumentation', 'signatur_therapeut', e.target.value)}
          placeholder="Name oder Kürzel"
        />
      </Card>

      {/* Action Buttons */}
      <Card className="sticky bottom-4 z-10 shadow-2xl border-2 border-green-500/30">
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
            Fehler beim Speichern. Bitte füllen Sie alle Pflichtfelder aus.
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
