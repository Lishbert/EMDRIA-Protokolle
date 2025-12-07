import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Select } from './ui';
import { SaveIcon, XMarkIcon, PrinterIcon, PlusIcon, TrashIcon } from './icons';
import { MetadataForm } from './MetadataForm';
import { StandardProtocolEditor } from './ProtocolEditor';
import { CIPOSProtocolEditor } from './CIPOSProtocolEditor';
import { SichererOrtProtocolEditor } from './SichererOrtProtocolEditor';
import type { 
  IRIProtocol, 
  IRIStimulationSet, 
  IndikationOption, 
  KoerperlokalisationOption, 
  KoerperempfindungQualitaet,
  StimulationTyp,
  SetGeschwindigkeit,
  StandardProtocol,
  CIPOSProtocol,
  SichererOrtProtocol,
  ProtocolType,
  createEmptyIRIData
} from '../types';
import { saveProtocol } from '../utils/storage';
import { exportProtocolAsPDF } from '../utils/export';
import {
  INDIKATION_OPTIONS,
  KOERPERLOKALISATION_OPTIONS,
  KOERPEREMPFINDUNG_OPTIONS,
  STIMULATION_TYP_OPTIONS,
  SET_GESCHWINDIGKEIT_OPTIONS,
} from '../constants';

interface IRIProtocolEditorProps {
  protocol: IRIProtocol | null;
  onSave: () => void;
  onCancel: () => void;
}

export const IRIProtocolEditor: React.FC<IRIProtocolEditorProps> = ({ protocol, onSave, onCancel }) => {
  const [editedProtocol, setEditedProtocol] = useState<Partial<IRIProtocol>>({});
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [switchedProtocolType, setSwitchedProtocolType] = useState<ProtocolType | null>(null);

  // Initialize or reset form when protocol changes
  useEffect(() => {
    if (protocol) {
      setEditedProtocol(protocol);
    } else {
      // New IRI protocol
      const emptyIRIData = {
        indikation: {
          indikation_checklist: [],
          ausgangszustand_beschreibung: '',
          ziel_der_iri: '',
        },
        positiver_moment: {
          positiver_moment_beschreibung: '',
          kontext_positiver_moment: '',
          wahrgenommene_positive_veraenderung: '',
        },
        koerperwahrnehmung: {
          koerperwahrnehmung_rohtext: '',
          koerperlokalisation: [],
          qualitaet_koerperempfindung: [],
        },
        lope_vorher: undefined,
        bilaterale_stimulation: {
          stimulation_typ: 'visuell' as StimulationTyp,
          sets: [],
        },
        lope_nachher: undefined,
        ressourcen_einschaetzung: {},
        abschluss: {
          einwilligung_dokumentation: false,
        },
      };
      setEditedProtocol({
        id: crypto.randomUUID(),
        chiffre: '',
        datum: new Date().toISOString().split('T')[0],
        protokollnummer: '',
        protocolType: 'IRI',
        createdAt: Date.now(),
        lastModified: Date.now(),
        ...emptyIRIData,
      });
    }
    setErrors({});
    setSaveStatus('idle');
    setSwitchedProtocolType(null);
  }, [protocol]);

  const handleMetadataChange = (metadata: Partial<IRIProtocol>) => {
    // Check if protocol type is being changed
    if (metadata.protocolType && metadata.protocolType !== 'IRI') {
      setSwitchedProtocolType(metadata.protocolType);
      setEditedProtocol({
        ...editedProtocol,
        ...metadata,
      });
      return;
    }
    
    setEditedProtocol({
      ...editedProtocol,
      ...metadata,
    });
  };

  // If protocol type was switched to CIPOS, render CIPOS editor
  if (switchedProtocolType === 'CIPOS') {
    const ciposProtocol: Partial<CIPOSProtocol> = {
      id: editedProtocol.id || crypto.randomUUID(),
      chiffre: editedProtocol.chiffre || '',
      datum: editedProtocol.datum || new Date().toISOString().split('T')[0],
      protokollnummer: editedProtocol.protokollnummer || '',
      protocolType: 'CIPOS',
      createdAt: editedProtocol.createdAt || Date.now(),
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
    };
    return (
      <CIPOSProtocolEditor
        protocol={ciposProtocol as CIPOSProtocol}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  // If protocol type was switched to Sicherer Ort, render Sicherer Ort editor
  if (switchedProtocolType === 'Sicherer Ort') {
    const sichererOrtProtocol: Partial<SichererOrtProtocol> = {
      id: editedProtocol.id || crypto.randomUUID(),
      chiffre: editedProtocol.chiffre || '',
      datum: editedProtocol.datum || new Date().toISOString().split('T')[0],
      protokollnummer: editedProtocol.protokollnummer || '',
      protocolType: 'Sicherer Ort',
      createdAt: editedProtocol.createdAt || Date.now(),
      lastModified: Date.now(),
      einfuehrung: {
        einbettung_kurzbeschreibung: '',
        psychoedukation_gegeben: null,
        anker_konzept_erklaert: null,
      },
      findung: {
        ort_typ: null,
        ort_nennung: '',
        gefuehl_beim_ort: '',
        koerperstelle_gefuehl: '',
      },
      set1: {
        bls_durchgefuehrt: null,
        stimulation_art: null,
        reaktion_nach_set: null,
        reaktion_beschreibung: '',
        interpretation_fall: null,
      },
      set2: {
        bls_durchgefuehrt: null,
        reaktion_nach_set: null,
      },
      wortarbeit: {
        wort_fuer_ort: '',
        set3_bls_durchgefuehrt: null,
        set3_patient_denkt_wort_ort: null,
        set3_reaktion: '',
        set4_durchgefuehrt: null,
      },
      transfer: {
        anleitung_durchgefuehrt: null,
        patient_erreicht_ort: null,
        reaktion_beschreibung: '',
        alltag_nutzbar: null,
        alltag_hinweise: '',
      },
      abschluss: {
        subjektiver_zustand: [],
        koerperliche_wahrnehmung: '',
        stabilisierung_ausreichend: null,
      },
      therapeutische_einschaetzung: {
        eignung_sicherer_ort: null,
        besondere_beobachtungen: '',
        planung_weitere_sitzungen: '',
      },
    };
    return (
      <SichererOrtProtocolEditor
        protocol={sichererOrtProtocol as SichererOrtProtocol}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  // If protocol type was switched to a standard type, render standard editor
  if (switchedProtocolType && switchedProtocolType !== 'IRI' && switchedProtocolType !== 'CIPOS' && switchedProtocolType !== 'Sicherer Ort') {
    const standardProtocol: Partial<StandardProtocol> = {
      id: editedProtocol.id || crypto.randomUUID(),
      chiffre: editedProtocol.chiffre || '',
      datum: editedProtocol.datum || new Date().toISOString().split('T')[0],
      protokollnummer: editedProtocol.protokollnummer || '',
      protocolType: switchedProtocolType,
      createdAt: editedProtocol.createdAt || Date.now(),
      lastModified: Date.now(),
      startKnoten: '',
      channel: [],
    };
    return (
      <StandardProtocolEditor
        protocol={standardProtocol as StandardProtocol}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  // Helper to update nested fields
  const updateNestedField = <T extends keyof IRIProtocol>(
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

  // Toggle checkbox in array
  const toggleArrayItem = <T extends string>(
    section: keyof IRIProtocol,
    field: string,
    item: T
  ) => {
    const currentSection = editedProtocol[section] as Record<string, T[]>;
    const currentArray = currentSection?.[field] || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    updateNestedField(section, field, newArray);
  };

  // Add new stimulation set
  const addStimulationSet = () => {
    const currentSets = editedProtocol.bilaterale_stimulation?.sets || [];
    const newSet: IRIStimulationSet = {
      id: crypto.randomUUID(),
      set_nummer: currentSets.length + 1,
      set_geschwindigkeit: 'langsam',
    };
    updateNestedField('bilaterale_stimulation', 'sets', [...currentSets, newSet]);
  };

  // Remove stimulation set
  const removeStimulationSet = (id: string) => {
    const currentSets = editedProtocol.bilaterale_stimulation?.sets || [];
    const newSets = currentSets
      .filter((s) => s.id !== id)
      .map((s, index) => ({ ...s, set_nummer: index + 1 }));
    updateNestedField('bilaterale_stimulation', 'sets', newSets);
  };

  // Update stimulation set field
  const updateStimulationSet = (id: string, field: keyof IRIStimulationSet, value: unknown) => {
    const currentSets = editedProtocol.bilaterale_stimulation?.sets || [];
    const newSets = currentSets.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    updateNestedField('bilaterale_stimulation', 'sets', newSets);
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

      const protocolToSave: IRIProtocol = {
        id: editedProtocol.id!,
        chiffre: editedProtocol.chiffre!,
        datum: editedProtocol.datum!,
        protokollnummer: editedProtocol.protokollnummer!,
        protocolType: 'IRI',
        createdAt: editedProtocol.createdAt || Date.now(),
        lastModified: Date.now(),
        indikation: editedProtocol.indikation!,
        positiver_moment: editedProtocol.positiver_moment!,
        koerperwahrnehmung: editedProtocol.koerperwahrnehmung!,
        lope_vorher: editedProtocol.lope_vorher,
        bilaterale_stimulation: editedProtocol.bilaterale_stimulation!,
        lope_nachher: editedProtocol.lope_nachher,
        ressourcen_einschaetzung: editedProtocol.ressourcen_einschaetzung!,
        abschluss: editedProtocol.abschluss!,
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

  const handleExportPDF = () => {
    if (!editedProtocol.id) return;
    try {
      exportProtocolAsPDF(editedProtocol as IRIProtocol);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Fehler beim Erstellen der PDF.');
    }
  };

  const hasUnsavedChanges = saveStatus !== 'saved';

  return (
    <div className="space-y-6">
      {/* Metadata Section */}
      <MetadataForm
        metadata={editedProtocol}
        onChange={handleMetadataChange}
        errors={errors}
      />

      {/* Section 2: Indikation / Ausgangslage */}
      <Card className="mb-6 border-l-4 border-purple-500">
        <h2 className="text-lg font-bold text-purple-400 mb-4">2. Indikation / Ausgangslage</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Indikation (Mehrfachauswahl möglich)</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {INDIKATION_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-alt">
                <input
                  type="checkbox"
                  checked={editedProtocol.indikation?.indikation_checklist?.includes(option.value) || false}
                  onChange={() => toggleArrayItem('indikation', 'indikation_checklist', option.value)}
                  className="w-4 h-4 rounded border-muted bg-background text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
          {editedProtocol.indikation?.indikation_checklist?.includes('sonstiges') && (
            <Input
              className="mt-2"
              placeholder="Sonstige Indikation beschreiben..."
              value={editedProtocol.indikation?.indikation_sonstiges || ''}
              onChange={(e) => updateNestedField('indikation', 'indikation_sonstiges', e.target.value)}
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Beschreibung des Ausgangszustands</label>
          <textarea
            value={editedProtocol.indikation?.ausgangszustand_beschreibung || ''}
            onChange={(e) => updateNestedField('indikation', 'ausgangszustand_beschreibung', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[80px]"
            placeholder="Wie ist der aktuelle Zustand der Patient:in?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Ziel der IRI</label>
          <textarea
            value={editedProtocol.indikation?.ziel_der_iri || ''}
            onChange={(e) => updateNestedField('indikation', 'ziel_der_iri', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[80px]"
            placeholder="Was soll mit der IRI erreicht werden?"
          />
        </div>
      </Card>

      {/* Section 3: Positiver Moment */}
      <Card className="mb-6 border-l-4 border-purple-500">
        <h2 className="text-lg font-bold text-purple-400 mb-4">3. Auslöser der Ressource / Positiver Moment</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Beschreibung des positiven Moments</label>
          <textarea
            value={editedProtocol.positiver_moment?.positiver_moment_beschreibung || ''}
            onChange={(e) => updateNestedField('positiver_moment', 'positiver_moment_beschreibung', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[80px]"
            placeholder="Beschreiben Sie den positiven Moment / die Ressource..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Kontext des positiven Moments</label>
          <textarea
            value={editedProtocol.positiver_moment?.kontext_positiver_moment || ''}
            onChange={(e) => updateNestedField('positiver_moment', 'kontext_positiver_moment', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[60px]"
            placeholder="In welchem Kontext trat der Moment auf?"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Wahrgenommene positive Veränderung</label>
          <textarea
            value={editedProtocol.positiver_moment?.wahrgenommene_positive_veraenderung || ''}
            onChange={(e) => updateNestedField('positiver_moment', 'wahrgenommene_positive_veraenderung', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[60px]"
            placeholder="Welche Veränderungen wurden beobachtet?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Veränderung Mimik"
            value={editedProtocol.positiver_moment?.veraenderung_mimik || ''}
            onChange={(e) => updateNestedField('positiver_moment', 'veraenderung_mimik', e.target.value)}
            placeholder="z.B. Lächeln, entspannt"
          />
          <Input
            label="Veränderung verbal"
            value={editedProtocol.positiver_moment?.veraenderung_verbale_ausdrucksweise || ''}
            onChange={(e) => updateNestedField('positiver_moment', 'veraenderung_verbale_ausdrucksweise', e.target.value)}
            placeholder="z.B. ruhigere Stimme"
          />
          <Input
            label="Veränderung Körperhaltung"
            value={editedProtocol.positiver_moment?.veraenderung_koerperhaltung || ''}
            onChange={(e) => updateNestedField('positiver_moment', 'veraenderung_koerperhaltung', e.target.value)}
            placeholder="z.B. aufrechter"
          />
        </div>
      </Card>

      {/* Section 4: Körperwahrnehmung */}
      <Card className="mb-6 border-l-4 border-purple-500">
        <h2 className="text-lg font-bold text-purple-400 mb-4">4. Körperwahrnehmung</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Beschreibung der Körperwahrnehmung (Patient:in)</label>
          <textarea
            value={editedProtocol.koerperwahrnehmung?.koerperwahrnehmung_rohtext || ''}
            onChange={(e) => updateNestedField('koerperwahrnehmung', 'koerperwahrnehmung_rohtext', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[80px]"
            placeholder="Was nimmt die Patient:in im Körper wahr?"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Lokalisation (Mehrfachauswahl)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {KOERPERLOKALISATION_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-alt">
                <input
                  type="checkbox"
                  checked={editedProtocol.koerperwahrnehmung?.koerperlokalisation?.includes(option.value) || false}
                  onChange={() => toggleArrayItem('koerperwahrnehmung', 'koerperlokalisation', option.value)}
                  className="w-4 h-4 rounded border-muted bg-background text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
          {editedProtocol.koerperwahrnehmung?.koerperlokalisation?.includes('sonstiges') && (
            <Input
              className="mt-2"
              placeholder="Sonstige Lokalisation beschreiben..."
              value={editedProtocol.koerperwahrnehmung?.koerperlokalisation_sonstiges || ''}
              onChange={(e) => updateNestedField('koerperwahrnehmung', 'koerperlokalisation_sonstiges', e.target.value)}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Qualität der Körperempfindung (Mehrfachauswahl)</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {KOERPEREMPFINDUNG_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-alt">
                <input
                  type="checkbox"
                  checked={editedProtocol.koerperwahrnehmung?.qualitaet_koerperempfindung?.includes(option.value) || false}
                  onChange={() => toggleArrayItem('koerperwahrnehmung', 'qualitaet_koerperempfindung', option.value)}
                  className="w-4 h-4 rounded border-muted bg-background text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
          {editedProtocol.koerperwahrnehmung?.qualitaet_koerperempfindung?.includes('sonstiges') && (
            <Input
              className="mt-2"
              placeholder="Sonstige Qualität beschreiben..."
              value={editedProtocol.koerperwahrnehmung?.qualitaet_sonstiges || ''}
              onChange={(e) => updateNestedField('koerperwahrnehmung', 'qualitaet_sonstiges', e.target.value)}
            />
          )}
        </div>
      </Card>

      {/* Section 5: LOPE vorher */}
      <Card className="mb-6 border-l-4 border-purple-500">
        <h2 className="text-lg font-bold text-purple-400 mb-4">5. LOPE – Level of Positive Emotion (vor Stimulation)</h2>
        
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-on-surface">LOPE (0-10):</label>
          <input
            type="range"
            min="0"
            max="10"
            value={editedProtocol.lope_vorher ?? 5}
            onChange={(e) => setEditedProtocol({ ...editedProtocol, lope_vorher: parseInt(e.target.value) })}
            className="flex-1 accent-purple-500"
          />
          <span className="text-2xl font-bold text-purple-400 w-12 text-center">
            {editedProtocol.lope_vorher ?? 5}
          </span>
        </div>
        <p className="text-xs text-muted mt-2">0 = keine positive Emotion spürbar, 10 = maximal positive Emotion</p>
      </Card>

      {/* Section 6: Bilaterale Stimulation */}
      <Card className="mb-6 border-l-4 border-purple-500">
        <h2 className="text-lg font-bold text-purple-400 mb-4">6. Bilaterale Stimulation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            label="Art der Stimulation"
            value={editedProtocol.bilaterale_stimulation?.stimulation_typ || 'visuell'}
            onChange={(e) => updateNestedField('bilaterale_stimulation', 'stimulation_typ', e.target.value)}
          >
            {STIMULATION_TYP_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
          
          {editedProtocol.bilaterale_stimulation?.stimulation_typ === 'kombination' && (
            <Input
              label="Beschreibung der Kombination"
              value={editedProtocol.bilaterale_stimulation?.stimulation_typ_sonstiges || ''}
              onChange={(e) => updateNestedField('bilaterale_stimulation', 'stimulation_typ_sonstiges', e.target.value)}
              placeholder="Welche Kombination?"
            />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Allgemeine Bemerkungen zur Stimulation</label>
          <textarea
            value={editedProtocol.bilaterale_stimulation?.stimulation_bemerkungen_allgemein || ''}
            onChange={(e) => updateNestedField('bilaterale_stimulation', 'stimulation_bemerkungen_allgemein', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[60px]"
            placeholder="Bemerkungen zur Durchführung..."
          />
        </div>

        {/* Stimulation Sets */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold text-on-surface">Stimulationssets</h3>
            <Button onClick={addStimulationSet} variant="secondary" className="!py-1 !px-3">
              <PlusIcon />
              Set hinzufügen
            </Button>
          </div>

          {editedProtocol.bilaterale_stimulation?.sets?.map((set) => (
            <div key={set.id} className="border border-muted rounded-lg p-4 mb-3 bg-surface-alt">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-purple-400">Set {set.set_nummer}</span>
                <button
                  onClick={() => removeStimulationSet(set.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Set entfernen"
                >
                  <TrashIcon />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <Select
                  label="Geschwindigkeit"
                  value={set.set_geschwindigkeit}
                  onChange={(e) => updateStimulationSet(set.id, 'set_geschwindigkeit', e.target.value)}
                >
                  {SET_GESCHWINDIGKEIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
                <Input
                  label="Dauer"
                  value={set.set_dauer || ''}
                  onChange={(e) => updateStimulationSet(set.id, 'set_dauer', e.target.value)}
                  placeholder="z.B. 30 Sekunden"
                />
                <Input
                  label="Anzahl Durchgänge"
                  type="number"
                  min="1"
                  value={set.set_anzahl_durchgaenge || ''}
                  onChange={(e) => updateStimulationSet(set.id, 'set_anzahl_durchgaenge', parseInt(e.target.value) || undefined)}
                  placeholder="z.B. 24"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-on-surface mb-1">Instruktion</label>
                <textarea
                  value={set.instruktion_text || ''}
                  onChange={(e) => updateStimulationSet(set.id, 'instruktion_text', e.target.value)}
                  className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[50px] text-sm"
                  placeholder="Was wurde der Patient:in gesagt?"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-on-surface mb-1">Subjektive Wahrnehmung nach Set</label>
                <textarea
                  value={set.subjektive_wahrnehmung_nach_set || ''}
                  onChange={(e) => updateStimulationSet(set.id, 'subjektive_wahrnehmung_nach_set', e.target.value)}
                  className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[50px] text-sm"
                  placeholder="Was berichtet die Patient:in?"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-on-surface">LOPE nach Set (0-10):</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={set.lope_nach_set ?? 5}
                  onChange={(e) => updateStimulationSet(set.id, 'lope_nach_set', parseInt(e.target.value))}
                  className="flex-1 accent-purple-500"
                />
                <span className="text-lg font-bold text-purple-400 w-8 text-center">
                  {set.lope_nach_set ?? '-'}
                </span>
              </div>
            </div>
          ))}

          {(!editedProtocol.bilaterale_stimulation?.sets || editedProtocol.bilaterale_stimulation.sets.length === 0) && (
            <p className="text-muted text-sm italic">Noch keine Stimulationssets hinzugefügt.</p>
          )}
        </div>
      </Card>

      {/* Section 7: LOPE Abschluss */}
      <Card className="mb-6 border-l-4 border-purple-500">
        <h2 className="text-lg font-bold text-purple-400 mb-4">7. LOPE – Abschlussbewertung</h2>
        
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-on-surface">LOPE nachher (0-10):</label>
          <input
            type="range"
            min="0"
            max="10"
            value={editedProtocol.lope_nachher ?? 5}
            onChange={(e) => setEditedProtocol({ ...editedProtocol, lope_nachher: parseInt(e.target.value) })}
            className="flex-1 accent-purple-500"
          />
          <span className="text-2xl font-bold text-purple-400 w-12 text-center">
            {editedProtocol.lope_nachher ?? 5}
          </span>
        </div>

        {editedProtocol.lope_vorher !== undefined && editedProtocol.lope_nachher !== undefined && (
          <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <span className="text-sm text-on-surface">Veränderung: </span>
            <span className={`font-bold ${
              editedProtocol.lope_nachher > editedProtocol.lope_vorher ? 'text-green-400' :
              editedProtocol.lope_nachher < editedProtocol.lope_vorher ? 'text-red-400' : 'text-on-surface'
            }`}>
              {editedProtocol.lope_nachher > editedProtocol.lope_vorher ? '+' : ''}
              {editedProtocol.lope_nachher - editedProtocol.lope_vorher}
            </span>
            <span className="text-sm text-muted ml-2">
              ({editedProtocol.lope_vorher} → {editedProtocol.lope_nachher})
            </span>
          </div>
        )}
      </Card>

      {/* Section 8: Ressourcen-Einschätzung */}
      <Card className="mb-6 border-l-4 border-purple-500">
        <h2 className="text-lg font-bold text-purple-400 mb-4">8. Einschätzung der Ressource & Integration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Spürbarkeit der Ressource (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => updateNestedField('ressourcen_einschaetzung', 'ressource_spuerbarkeit', val)}
                  className={`w-10 h-10 rounded-lg border-2 font-bold transition-colors ${
                    editedProtocol.ressourcen_einschaetzung?.ressource_spuerbarkeit === val
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'border-muted text-on-surface hover:border-purple-500'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Erreichbarkeit im Alltag (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  onClick={() => updateNestedField('ressourcen_einschaetzung', 'ressource_erreichbarkeit_im_alltag', val)}
                  className={`w-10 h-10 rounded-lg border-2 font-bold transition-colors ${
                    editedProtocol.ressourcen_einschaetzung?.ressource_erreichbarkeit_im_alltag === val
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'border-muted text-on-surface hover:border-purple-500'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Anker für den Alltag"
            value={editedProtocol.ressourcen_einschaetzung?.anker_fuer_alltag || ''}
            onChange={(e) => updateNestedField('ressourcen_einschaetzung', 'anker_fuer_alltag', e.target.value)}
            placeholder="z.B. Geste, Wort, Bild..."
          />
          <Input
            label="Vereinbarte Hausaufgabe"
            value={editedProtocol.ressourcen_einschaetzung?.vereinbarte_hausaufgabe || ''}
            onChange={(e) => updateNestedField('ressourcen_einschaetzung', 'vereinbarte_hausaufgabe', e.target.value)}
            placeholder="Was soll geübt werden?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Bemerkungen zu Risiko/Stabilität</label>
          <textarea
            value={editedProtocol.ressourcen_einschaetzung?.bemerkungen_risiko_stabilitaet || ''}
            onChange={(e) => updateNestedField('ressourcen_einschaetzung', 'bemerkungen_risiko_stabilitaet', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[60px]"
            placeholder="Gibt es Hinweise auf Instabilität oder Risiken?"
          />
        </div>
      </Card>

      {/* Section 9 & 10: Abschluss */}
      <Card className="mb-6 border-l-4 border-purple-500">
        <h2 className="text-lg font-bold text-purple-400 mb-4">9./10. Gesamtkommentar & Einwilligung</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Therapeutische Reflexion zum Verlauf</label>
          <textarea
            value={editedProtocol.abschluss?.therapeut_reflexion || ''}
            onChange={(e) => updateNestedField('abschluss', 'therapeut_reflexion', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[80px]"
            placeholder="Reflexion zum Verlauf der Sitzung..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Nächste Schritte / Behandlungsplanung</label>
          <textarea
            value={editedProtocol.abschluss?.naechste_schritte_behandlung || ''}
            onChange={(e) => updateNestedField('abschluss', 'naechste_schritte_behandlung', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-y min-h-[60px]"
            placeholder="Was ist für die nächsten Sitzungen geplant?"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-surface-alt border border-muted">
            <input
              type="checkbox"
              checked={editedProtocol.abschluss?.einwilligung_dokumentation || false}
              onChange={(e) => updateNestedField('abschluss', 'einwilligung_dokumentation', e.target.checked)}
              className="w-5 h-5 rounded border-muted bg-background text-purple-500 focus:ring-purple-500"
            />
            <span className="text-on-surface">Patient:in wurde über die Methode informiert und war einverstanden</span>
          </label>
        </div>

        <Input
          label="Signatur / Name der Therapeut:in"
          value={editedProtocol.abschluss?.signatur_therapeut || ''}
          onChange={(e) => updateNestedField('abschluss', 'signatur_therapeut', e.target.value)}
          placeholder="Name oder Kürzel"
        />
      </Card>

      {/* Action Buttons */}
      <Card className="sticky bottom-4 z-10 shadow-2xl border-2 border-purple-500/30">
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
