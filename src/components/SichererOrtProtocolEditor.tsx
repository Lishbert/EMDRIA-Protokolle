import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Select } from './ui';
import { SaveIcon, XMarkIcon, DownloadIcon, PrinterIcon, SparklesIcon } from './icons';
import { MetadataForm } from './MetadataForm';
import { StandardProtocolEditor } from './ProtocolEditor';
import { IRIProtocolEditor } from './IRIProtocolEditor';
import { CIPOSProtocolEditor } from './CIPOSProtocolEditor';
import type { 
  SichererOrtProtocol, 
  StandardProtocol,
  IRIProtocol,
  CIPOSProtocol,
  ProtocolType,
  OrtTyp,
  SichererOrtStimulationTyp,
  BLSReaktion,
  SubjektiverZustand,
  EignungEinschaetzung,
  StimulationTyp,
  createEmptySichererOrtData,
} from '../types';
import { saveProtocol } from '../utils/storage';
import { exportProtocolAsJSON, exportProtocolAsPDF } from '../utils/export';
import {
  SICHERER_ORT_TYP_OPTIONS,
  SICHERER_ORT_STIMULATION_OPTIONS,
  BLS_REAKTION_OPTIONS,
  SUBJEKTIVER_ZUSTAND_OPTIONS,
  EIGNUNG_EINSCHAETZUNG_OPTIONS,
} from '../constants';
import {
  generateSichererOrtTestProtocol,
  getRandomItem,
  getRandomItems,
  getRandomBoolean,
  SAMPLE_SICHERER_ORT_EINBETTUNG,
  SAMPLE_SICHERER_ORT_ORTE,
  SAMPLE_KOERPERSTELLEN_GEFUEHL,
  SAMPLE_BLS_REAKTION_BESCHREIBUNG,
  SAMPLE_WORTE_FUER_ORT,
  SAMPLE_TRANSFER_REAKTION,
  SAMPLE_ALLTAG_HINWEISE,
  SAMPLE_KOERPERLICHE_WAHRNEHMUNG_ABSCHLUSS,
  SAMPLE_BESONDERE_BEOBACHTUNGEN,
  SAMPLE_PLANUNG_WEITERE_SITZUNGEN,
} from '../utils/testData';

interface SichererOrtProtocolEditorProps {
  protocol: SichererOrtProtocol | null;
  onSave: () => void;
  onCancel: () => void;
}

export const SichererOrtProtocolEditor: React.FC<SichererOrtProtocolEditorProps> = ({ protocol, onSave, onCancel }) => {
  const [editedProtocol, setEditedProtocol] = useState<Partial<SichererOrtProtocol>>({});
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [switchedProtocolType, setSwitchedProtocolType] = useState<ProtocolType | null>(null);

  // Initialize or reset form when protocol changes
  useEffect(() => {
    if (protocol) {
      setEditedProtocol(protocol);
    } else {
      // New Sicherer Ort protocol
      const emptyData = {
        einfuehrung: {
          einbettung_kurzbeschreibung: '',
          psychoedukation_gegeben: null as 'ja' | 'nein' | null,
          anker_konzept_erklaert: null as boolean | null,
        },
        findung: {
          ort_typ: null as OrtTyp | null,
          ort_nennung: '',
          gefuehl_beim_ort: '',
          koerperstelle_gefuehl: '',
        },
        set1: {
          bls_durchgefuehrt: null as boolean | null,
          stimulation_art: null as SichererOrtStimulationTyp | null,
          reaktion_nach_set: null as BLSReaktion | null,
          reaktion_beschreibung: '',
          interpretation_fall: null as 'fall1_weiter' | 'fall2_abbruch' | null,
        },
        set2: {
          bls_durchgefuehrt: null as boolean | null,
          stimulation_art: null as SichererOrtStimulationTyp | null,
          reaktion_nach_set: null as BLSReaktion | null,
        },
        wortarbeit: {
          wort_fuer_ort: '',
          set3_bls_durchgefuehrt: null as boolean | null,
          set3_patient_denkt_wort_ort: null as boolean | null,
          set3_reaktion: '',
          set4_durchgefuehrt: null as boolean | null,
        },
        transfer: {
          anleitung_durchgefuehrt: null as boolean | null,
          patient_erreicht_ort: null as 'ja' | 'teilweise' | 'nein' | null,
          reaktion_beschreibung: '',
          alltag_nutzbar: null as 'ja' | 'nein' | 'unsicher' | null,
          alltag_hinweise: '',
        },
        abschluss: {
          subjektiver_zustand: [] as SubjektiverZustand[],
          koerperliche_wahrnehmung: '',
          stabilisierung_ausreichend: null as boolean | null,
        },
        therapeutische_einschaetzung: {
          eignung_sicherer_ort: null as EignungEinschaetzung | null,
          besondere_beobachtungen: '',
          planung_weitere_sitzungen: '',
        },
      };
      setEditedProtocol({
        id: crypto.randomUUID(),
        chiffre: '',
        datum: new Date().toISOString().split('T')[0],
        protokollnummer: '',
        protocolType: 'Sicherer Ort',
        createdAt: Date.now(),
        lastModified: Date.now(),
        ...emptyData,
      });
    }
    setErrors({});
    setSaveStatus('idle');
    setSwitchedProtocolType(null);
  }, [protocol]);

  const handleMetadataChange = (metadata: Partial<SichererOrtProtocol>) => {
    // Check if protocol type is being changed
    if (metadata.protocolType && metadata.protocolType !== 'Sicherer Ort') {
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

  // Handle protocol type switching
  if (switchedProtocolType === 'IRI') {
    const iriProtocol: Partial<IRIProtocol> = {
      id: editedProtocol.id || crypto.randomUUID(),
      chiffre: editedProtocol.chiffre || '',
      datum: editedProtocol.datum || new Date().toISOString().split('T')[0],
      protokollnummer: editedProtocol.protokollnummer || '',
      protocolType: 'IRI',
      createdAt: editedProtocol.createdAt || Date.now(),
      lastModified: Date.now(),
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
      bilaterale_stimulation: {
        stimulation_typ: 'visuell' as StimulationTyp,
        sets: [],
      },
      ressourcen_einschaetzung: {},
      abschluss: {
        einwilligung_dokumentation: false,
      },
    };
    return (
      <IRIProtocolEditor
        protocol={iriProtocol as IRIProtocol}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

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

  if (switchedProtocolType && switchedProtocolType !== 'Sicherer Ort') {
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
  const updateNestedField = <T extends keyof SichererOrtProtocol>(
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
    section: keyof SichererOrtProtocol,
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

      const protocolToSave: SichererOrtProtocol = {
        id: editedProtocol.id!,
        chiffre: editedProtocol.chiffre!,
        datum: editedProtocol.datum!,
        protokollnummer: editedProtocol.protokollnummer!,
        protocolType: 'Sicherer Ort',
        createdAt: editedProtocol.createdAt || Date.now(),
        lastModified: Date.now(),
        einfuehrung: editedProtocol.einfuehrung!,
        findung: editedProtocol.findung!,
        set1: editedProtocol.set1!,
        set2: editedProtocol.set2!,
        wortarbeit: editedProtocol.wortarbeit!,
        transfer: editedProtocol.transfer!,
        abschluss: editedProtocol.abschluss!,
        therapeutische_einschaetzung: editedProtocol.therapeutische_einschaetzung!,
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
      exportProtocolAsJSON(editedProtocol as SichererOrtProtocol);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Fehler beim Exportieren des Protokolls.');
    }
  };

  const handleExportPDF = () => {
    if (!editedProtocol.id) return;
    try {
      exportProtocolAsPDF(editedProtocol as SichererOrtProtocol);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Fehler beim Erstellen der PDF.');
    }
  };

  const handleFillTestData = () => {
    const testData = generateSichererOrtTestProtocol(
      editedProtocol.chiffre || undefined,
      editedProtocol.datum || undefined
    );
    setEditedProtocol({
      ...editedProtocol,
      ...testData,
      id: editedProtocol.id,
      chiffre: editedProtocol.chiffre || testData.chiffre,
      datum: editedProtocol.datum || testData.datum,
      protokollnummer: editedProtocol.protokollnummer || testData.protokollnummer,
    });
  };

  const fillSectionTestData = (section: keyof SichererOrtProtocol) => {
    const stimulationArten: SichererOrtStimulationTyp[] = ['augenbewegungen', 'taps', 'auditiv'];
    const reaktionen: BLSReaktion[] = ['positiv', 'keine'];
    const subjektiveZustaende: SubjektiverZustand[] = ['ruhiger', 'verbundener', 'stabiler'];
    const eignungen: EignungEinschaetzung[] = ['geeignet', 'bedingt_geeignet'];

    switch (section) {
      case 'einfuehrung':
        setEditedProtocol({
          ...editedProtocol,
          einfuehrung: {
            einbettung_kurzbeschreibung: getRandomItem(SAMPLE_SICHERER_ORT_EINBETTUNG),
            psychoedukation_gegeben: getRandomBoolean() ? 'ja' : 'nein',
            psychoedukation_kommentar: 'Konzept des sicheren Ortes als innere Ressource erklärt.',
            anker_konzept_erklaert: getRandomBoolean(),
          },
        });
        break;
      case 'findung':
        const ortData = getRandomItem(SAMPLE_SICHERER_ORT_ORTE);
        setEditedProtocol({
          ...editedProtocol,
          findung: {
            ort_typ: ortData.typ,
            ort_nennung: ortData.name,
            gefuehl_beim_ort: ortData.gefuehl,
            koerperstelle_gefuehl: getRandomItem(SAMPLE_KOERPERSTELLEN_GEFUEHL),
          },
        });
        break;
      case 'set1':
        setEditedProtocol({
          ...editedProtocol,
          set1: {
            bls_durchgefuehrt: true,
            stimulation_art: getRandomItem(stimulationArten),
            reaktion_nach_set: getRandomItem(reaktionen),
            reaktion_beschreibung: getRandomItem(SAMPLE_BLS_REAKTION_BESCHREIBUNG),
            interpretation_fall: 'fall1_weiter',
          },
        });
        break;
      case 'set2':
        setEditedProtocol({
          ...editedProtocol,
          set2: {
            bls_durchgefuehrt: true,
            stimulation_art: getRandomItem(stimulationArten),
            reaktion_nach_set: getRandomItem(reaktionen),
            kommentar: 'Verstärkung des positiven Gefühls, Ort wird noch klarer.',
          },
        });
        break;
      case 'wortarbeit':
        setEditedProtocol({
          ...editedProtocol,
          wortarbeit: {
            wort_fuer_ort: getRandomItem(SAMPLE_WORTE_FUER_ORT),
            set3_bls_durchgefuehrt: true,
            set3_patient_denkt_wort_ort: true,
            set3_reaktion: 'Wort verstärkt den Zugang zum Gefühl deutlich.',
            set4_durchgefuehrt: getRandomBoolean(),
            set4_reaktion: 'Weitere Vertiefung der Verbindung Wort-Ort-Gefühl.',
          },
        });
        break;
      case 'transfer':
        setEditedProtocol({
          ...editedProtocol,
          transfer: {
            anleitung_durchgefuehrt: true,
            patient_erreicht_ort: 'ja',
            reaktion_beschreibung: getRandomItem(SAMPLE_TRANSFER_REAKTION),
            alltag_nutzbar: 'ja',
            alltag_hinweise: getRandomItem(SAMPLE_ALLTAG_HINWEISE),
          },
        });
        break;
      case 'abschluss':
        setEditedProtocol({
          ...editedProtocol,
          abschluss: {
            subjektiver_zustand: getRandomItems(subjektiveZustaende, 1, 3) as SubjektiverZustand[],
            koerperliche_wahrnehmung: getRandomItem(SAMPLE_KOERPERLICHE_WAHRNEHMUNG_ABSCHLUSS),
            stabilisierung_ausreichend: true,
          },
        });
        break;
      case 'therapeutische_einschaetzung':
        setEditedProtocol({
          ...editedProtocol,
          therapeutische_einschaetzung: {
            eignung_sicherer_ort: getRandomItem(eignungen),
            besondere_beobachtungen: getRandomItem(SAMPLE_BESONDERE_BEOBACHTUNGEN),
            planung_weitere_sitzungen: getRandomItem(SAMPLE_PLANUNG_WEITERE_SITZUNGEN),
            signatur_therapeut: `Dr. Muster, ${new Date().toLocaleDateString('de-DE')}`,
          },
        });
        break;
    }
  };

  const hasUnsavedChanges = saveStatus !== 'saved';

  // Check if Set 1 had positive or no change (to show Set 2)
  const showSet2 = editedProtocol.set1?.interpretation_fall === 'fall1_weiter';
  
  // Check if Set 2 was done to show Wortarbeit
  const showWortarbeit = showSet2 && (
    editedProtocol.set2?.reaktion_nach_set === 'positiv' || 
    editedProtocol.set2?.reaktion_nach_set === 'keine'
  );

  return (
    <div className="space-y-6">
      {/* Metadata Section */}
      <MetadataForm
        metadata={editedProtocol}
        onChange={handleMetadataChange}
        errors={errors}
      />

      {/* Section 2: Einführung in die Übung */}
      <Card className="mb-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-yellow-400">2. Einführung in die Übung</h2>
          <button
            type="button"
            onClick={() => fillSectionTestData('einfuehrung')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
            title="Testdaten für Einführung einfügen"
          >
            <SparklesIcon />
            Testdaten einfügen
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">
            Kurzbeschreibung der Einbettung: Warum wurde die Übung heute gewählt?
          </label>
          <textarea
            value={editedProtocol.einfuehrung?.einbettung_kurzbeschreibung || ''}
            onChange={(e) => updateNestedField('einfuehrung', 'einbettung_kurzbeschreibung', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[80px]"
            placeholder="Warum wurde die Übung heute gewählt?"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Psychoedukation gegeben?</label>
          <div className="flex gap-4 mb-2">
            {[
              { value: 'ja', label: 'Ja' },
              { value: 'nein', label: 'Nein' },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="psychoedukation"
                  checked={editedProtocol.einfuehrung?.psychoedukation_gegeben === option.value}
                  onChange={() => updateNestedField('einfuehrung', 'psychoedukation_gegeben', option.value)}
                  className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
          <Input
            placeholder="Kommentar zur Psychoedukation..."
            value={editedProtocol.einfuehrung?.psychoedukation_kommentar || ''}
            onChange={(e) => updateNestedField('einfuehrung', 'psychoedukation_kommentar', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Anker-Konzept erklärt (Metapher)?</label>
          <div className="flex gap-4">
            {[
              { value: true, label: 'Ja' },
              { value: false, label: 'Nein' },
            ].map((option) => (
              <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="anker_konzept"
                  checked={editedProtocol.einfuehrung?.anker_konzept_erklaert === option.value}
                  onChange={() => updateNestedField('einfuehrung', 'anker_konzept_erklaert', option.value)}
                  className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </Card>

      {/* Section 3: Findung des Wohlfühlortes / Sicheren Ortes */}
      <Card className="mb-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-yellow-400">3. Findung des Wohlfühlortes / Sicheren Ortes</h2>
          <button
            type="button"
            onClick={() => fillSectionTestData('findung')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
            title="Testdaten für Findung einfügen"
          >
            <SparklesIcon />
            Testdaten einfügen
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">3.1 Art des Ortes (Typ)</label>
          <div className="space-y-2">
            {SICHERER_ORT_TYP_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-surface-alt">
                <input
                  type="radio"
                  name="ort_typ"
                  checked={editedProtocol.findung?.ort_typ === option.value}
                  onChange={() => updateNestedField('findung', 'ort_typ', option.value)}
                  className="w-4 h-4 mt-0.5 text-yellow-500 focus:ring-yellow-500"
                />
                <div>
                  <span className="text-on-surface">{option.label}</span>
                  {option.hinweis && (
                    <span className="text-amber-400 text-sm ml-2">({option.hinweis})</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <Input
            label="Nennung des Ortes (Kurzbeschreibung)"
            value={editedProtocol.findung?.ort_nennung || ''}
            onChange={(e) => updateNestedField('findung', 'ort_nennung', e.target.value)}
            placeholder="z.B. Strand, Waldlichtung, Großmutters Garten..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">
            3.2 Exploration: Gefühl, das beim Ort entsteht
          </label>
          <p className="text-xs text-muted mb-2">„Wenn Sie sich diesen Ort vorstellen: Was für ein Gefühl kommt auf?"</p>
          <textarea
            value={editedProtocol.findung?.gefuehl_beim_ort || ''}
            onChange={(e) => updateNestedField('findung', 'gefuehl_beim_ort', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[60px]"
            placeholder="Beschreiben Sie das Gefühl..."
          />
        </div>

        <div>
          <Input
            label="Körperstelle, an der das Gefühl gespürt wird"
            value={editedProtocol.findung?.koerperstelle_gefuehl || ''}
            onChange={(e) => updateNestedField('findung', 'koerperstelle_gefuehl', e.target.value)}
            placeholder="z.B. Brust, Bauch, ganzer Körper..."
          />
        </div>
      </Card>

      {/* Section 4: 1. Set Bilaterale Stimulation */}
      <Card className="mb-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-yellow-400">4. Set Bilaterale Stimulation</h2>
            <p className="text-sm text-muted">(langsam, 5–10 ABW, ca. 0,5 Hz)</p>
          </div>
          <button
            type="button"
            onClick={() => fillSectionTestData('set1')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
            title="Testdaten für Set 1 einfügen"
          >
            <SparklesIcon />
            Testdaten einfügen
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">BLS durchgeführt?</label>
          <div className="flex gap-4">
            {[
              { value: true, label: 'Ja' },
              { value: false, label: 'Nein' },
            ].map((option) => (
              <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="set1_bls"
                  checked={editedProtocol.set1?.bls_durchgefuehrt === option.value}
                  onChange={() => updateNestedField('set1', 'bls_durchgefuehrt', option.value)}
                  className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {editedProtocol.set1?.bls_durchgefuehrt && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-on-surface mb-2">4.1 Art der Stimulation</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {SICHERER_ORT_STIMULATION_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-alt">
                    <input
                      type="radio"
                      name="stimulation_art"
                      checked={editedProtocol.set1?.stimulation_art === option.value}
                      onChange={() => updateNestedField('set1', 'stimulation_art', option.value)}
                      className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="text-sm text-on-surface">{option.label}</span>
                  </label>
                ))}
              </div>
              {editedProtocol.set1?.stimulation_art === 'anderes' && (
                <Input
                  className="mt-2"
                  placeholder="Beschreiben Sie die Stimulationsart..."
                  value={editedProtocol.set1?.stimulation_art_sonstiges || ''}
                  onChange={(e) => updateNestedField('set1', 'stimulation_art_sonstiges', e.target.value)}
                />
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-on-surface mb-2">4.2 Reaktion nach Set</label>
              <div className="flex flex-wrap gap-4">
                {BLS_REAKTION_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-alt">
                    <input
                      type="radio"
                      name="set1_reaktion"
                      checked={editedProtocol.set1?.reaktion_nach_set === option.value}
                      onChange={() => updateNestedField('set1', 'reaktion_nach_set', option.value)}
                      className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className={`text-sm ${
                      option.value === 'positiv' ? 'text-green-400' :
                      option.value === 'negativ' ? 'text-red-400' : 'text-on-surface'
                    }`}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-on-surface mb-2">4.3 Beschreibung der Veränderung</label>
              <textarea
                value={editedProtocol.set1?.reaktion_beschreibung || ''}
                onChange={(e) => updateNestedField('set1', 'reaktion_beschreibung', e.target.value)}
                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[60px]"
                placeholder="Beschreiben Sie die Veränderung..."
              />
            </div>

            <div className="mb-4 p-4 bg-surface-alt rounded-lg border border-muted">
              <label className="block text-sm font-medium text-on-surface mb-3">4.4 Interpretation / weitere Schritte</label>
              <div className="space-y-3">
                <label className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-background">
                  <input
                    type="radio"
                    name="interpretation_fall"
                    checked={editedProtocol.set1?.interpretation_fall === 'fall1_weiter'}
                    onChange={() => updateNestedField('set1', 'interpretation_fall', 'fall1_weiter')}
                    className="w-4 h-4 mt-0.5 text-yellow-500 focus:ring-yellow-500"
                  />
                  <div>
                    <span className="text-green-400 font-medium">Fall 1 – Keine/positive Veränderung</span>
                    <span className="text-muted text-sm ml-2">→ zweites Set</span>
                  </div>
                </label>
                <label className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-background">
                  <input
                    type="radio"
                    name="interpretation_fall"
                    checked={editedProtocol.set1?.interpretation_fall === 'fall2_abbruch'}
                    onChange={() => updateNestedField('set1', 'interpretation_fall', 'fall2_abbruch')}
                    className="w-4 h-4 mt-0.5 text-yellow-500 focus:ring-yellow-500"
                  />
                  <div>
                    <span className="text-red-400 font-medium">Fall 2 – Negative Veränderung</span>
                    <span className="text-muted text-sm ml-2">→ Abbruch/Anpassung</span>
                  </div>
                </label>
              </div>
              
              {editedProtocol.set1?.interpretation_fall === 'fall2_abbruch' && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <label className="block text-sm font-medium text-red-400 mb-2">Grund für negative Veränderung:</label>
                  <div className="space-y-2 mb-3">
                    {[
                      { value: 'ort_ungeeignet', label: 'Ort ungeeignet?' },
                      { value: 'stimulation_nicht_tolerierbar', label: 'Stimulation noch nicht tolerierbar?' },
                      { value: 'weitere_stabilisierung', label: 'Weitere Stabilisierung notwendig?' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="fall2_grund"
                          checked={editedProtocol.set1?.fall2_grund === option.value}
                          onChange={() => updateNestedField('set1', 'fall2_grund', option.value)}
                          className="w-4 h-4 text-red-500 focus:ring-red-500"
                        />
                        <span className="text-sm text-on-surface">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={editedProtocol.set1?.fall2_kommentar || ''}
                    onChange={(e) => updateNestedField('set1', 'fall2_kommentar', e.target.value)}
                    className="w-full bg-background text-on-surface border border-red-500/30 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-y min-h-[60px]"
                    placeholder="Weitere Kommentare..."
                  />
                </div>
              )}
            </div>
          </>
        )}
      </Card>

      {/* Section 5: 2. Set */}
      <Card className="mb-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-yellow-400">5. Set</h2>
              <p className="text-sm text-muted">(nur bei Fall 1: keine/positive Veränderung auf Set 1)</p>
            </div>
            <button
              type="button"
              onClick={() => fillSectionTestData('set2')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
              title="Testdaten für Set 2 einfügen"
            >
              <SparklesIcon />
              Testdaten einfügen
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-on-surface mb-2">BLS durchgeführt?</label>
            <div className="flex gap-4">
              {[
                { value: true, label: 'Ja' },
                { value: false, label: 'Nein' },
              ].map((option) => (
                <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="set2_bls"
                    checked={editedProtocol.set2?.bls_durchgefuehrt === option.value}
                    onChange={() => updateNestedField('set2', 'bls_durchgefuehrt', option.value)}
                    className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-on-surface">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {editedProtocol.set2?.bls_durchgefuehrt && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-on-surface mb-2">5.1 Art der Stimulation</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {SICHERER_ORT_STIMULATION_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-alt">
                      <input
                        type="radio"
                        name="set2_stimulation_art"
                        checked={editedProtocol.set2?.stimulation_art === option.value}
                        onChange={() => updateNestedField('set2', 'stimulation_art', option.value)}
                        className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className="text-sm text-on-surface">{option.label}</span>
                    </label>
                  ))}
                </div>
                {editedProtocol.set2?.stimulation_art === 'anderes' && (
                  <Input
                    className="mt-2"
                    placeholder="Beschreiben Sie die Stimulationsart..."
                    value={editedProtocol.set2?.stimulation_art_sonstiges || ''}
                    onChange={(e) => updateNestedField('set2', 'stimulation_art_sonstiges', e.target.value)}
                  />
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-on-surface mb-2">5.2 Reaktion nach Set</label>
                <div className="flex flex-wrap gap-4">
                  {BLS_REAKTION_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-alt">
                      <input
                        type="radio"
                        name="set2_reaktion"
                        checked={editedProtocol.set2?.reaktion_nach_set === option.value}
                        onChange={() => updateNestedField('set2', 'reaktion_nach_set', option.value)}
                        className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className={`text-sm ${
                        option.value === 'positiv' ? 'text-green-400' :
                        option.value === 'negativ' ? 'text-red-400' : 'text-on-surface'
                      }`}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">5.3 Kommentar / Beobachtung</label>
                <textarea
                  value={editedProtocol.set2?.kommentar || ''}
                  onChange={(e) => updateNestedField('set2', 'kommentar', e.target.value)}
                  className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[60px]"
                  placeholder="Kommentar zur Reaktion..."
                />
              </div>
            </>
          )}
        </Card>

      {/* Section 6: Ressourcenanker – Wortarbeit */}
      <Card className="mb-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-yellow-400">6. Ressourcenanker – Wortarbeit</h2>
              <p className="text-sm text-muted">(nur bei Fall 1: Material bleibt stabil oder verbessert sich)</p>
            </div>
            <button
              type="button"
              onClick={() => fillSectionTestData('wortarbeit')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
              title="Testdaten für Wortarbeit einfügen"
            >
              <SparklesIcon />
              Testdaten einfügen
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-on-surface mb-2">6.1 Wortfindung</label>
            <p className="text-xs text-muted mb-2">„Gibt es ein Wort, das Sie gerne mit diesem Ort verbinden würden?"</p>
            <Input
              value={editedProtocol.wortarbeit?.wort_fuer_ort || ''}
              onChange={(e) => updateNestedField('wortarbeit', 'wort_fuer_ort', e.target.value)}
              placeholder="z.B. Ruhe, Frieden, Geborgenheit..."
            />
          </div>

          <div className="mb-4 p-4 bg-surface-alt rounded-lg border border-muted">
            <label className="block text-sm font-medium text-on-surface mb-3">6.2 3. Set mit Wort</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm text-muted mb-2">BLS durchgeführt?</label>
                <div className="flex gap-4">
                  {[
                    { value: true, label: 'Ja' },
                    { value: false, label: 'Nein' },
                  ].map((option) => (
                    <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="set3_bls"
                        checked={editedProtocol.wortarbeit?.set3_bls_durchgefuehrt === option.value}
                        onChange={() => updateNestedField('wortarbeit', 'set3_bls_durchgefuehrt', option.value)}
                        className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className="text-on-surface">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-muted mb-2">Patient:in denkt an Wort + Ort?</label>
                <div className="flex gap-4">
                  {[
                    { value: true, label: 'Ja' },
                    { value: false, label: 'Nein' },
                  ].map((option) => (
                    <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="set3_denkt"
                        checked={editedProtocol.wortarbeit?.set3_patient_denkt_wort_ort === option.value}
                        onChange={() => updateNestedField('wortarbeit', 'set3_patient_denkt_wort_ort', option.value)}
                        className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                      />
                      <span className="text-on-surface">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Reaktion nach Set</label>
              <textarea
                value={editedProtocol.wortarbeit?.set3_reaktion || ''}
                onChange={(e) => updateNestedField('wortarbeit', 'set3_reaktion', e.target.value)}
                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[60px]"
                placeholder="Beschreibung der Reaktion..."
              />
            </div>
          </div>

          <div className="p-4 bg-surface-alt rounded-lg border border-muted">
            <label className="block text-sm font-medium text-on-surface mb-3">6.3 Optional: 4. Set</label>
            
            <div className="mb-3">
              <label className="block text-sm text-muted mb-2">Weiteres Set durchgeführt?</label>
              <div className="flex gap-4">
                {[
                  { value: true, label: 'Ja' },
                  { value: false, label: 'Nein' },
                ].map((option) => (
                  <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="set4_durchgefuehrt"
                      checked={editedProtocol.wortarbeit?.set4_durchgefuehrt === option.value}
                      onChange={() => updateNestedField('wortarbeit', 'set4_durchgefuehrt', option.value)}
                      className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                    />
                    <span className="text-on-surface">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {editedProtocol.wortarbeit?.set4_durchgefuehrt && (
              <div>
                <label className="block text-sm text-muted mb-2">Reaktion / Kommentar</label>
                <textarea
                  value={editedProtocol.wortarbeit?.set4_reaktion || ''}
                  onChange={(e) => updateNestedField('wortarbeit', 'set4_reaktion', e.target.value)}
                  className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[60px]"
                  placeholder="Reaktion auf Set 4..."
                />
              </div>
            )}
          </div>
        </Card>

      {/* Section 7: Transfer in den Alltag */}
      <Card className="mb-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-yellow-400">7. Transfer in den Alltag</h2>
          <button
            type="button"
            onClick={() => fillSectionTestData('transfer')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
            title="Testdaten für Transfer einfügen"
          >
            <SparklesIcon />
            Testdaten einfügen
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-surface-alt rounded-lg border border-muted">
          <label className="block text-sm font-medium text-on-surface mb-3">7.1 Nutzung ohne BLS</label>
          <p className="text-xs text-muted mb-3">Anleitung durchgeführt: „Gehen Sie mit dem Wort an Ihren sicheren Ort…"</p>
          
          <div className="mb-4">
            <label className="block text-sm text-muted mb-2">Anleitung durchgeführt?</label>
            <div className="flex gap-4">
              {[
                { value: true, label: 'Ja' },
                { value: false, label: 'Nein' },
              ].map((option) => (
                <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="anleitung_durchgefuehrt"
                    checked={editedProtocol.transfer?.anleitung_durchgefuehrt === option.value}
                    onChange={() => updateNestedField('transfer', 'anleitung_durchgefuehrt', option.value)}
                    className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-on-surface">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-muted mb-2">Patient:in kann Ort + Gefühl erreichen?</label>
            <div className="flex gap-4">
              {[
                { value: 'ja', label: 'Ja' },
                { value: 'teilweise', label: 'Teilweise' },
                { value: 'nein', label: 'Nein' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="patient_erreicht_ort"
                    checked={editedProtocol.transfer?.patient_erreicht_ort === option.value}
                    onChange={() => updateNestedField('transfer', 'patient_erreicht_ort', option.value)}
                    className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className={`text-on-surface ${
                    option.value === 'ja' ? 'text-green-400' :
                    option.value === 'nein' ? 'text-red-400' : 'text-yellow-400'
                  }`}>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Beschreibung der Reaktion / Fähigkeit</label>
            <textarea
              value={editedProtocol.transfer?.reaktion_beschreibung || ''}
              onChange={(e) => updateNestedField('transfer', 'reaktion_beschreibung', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[60px]"
              placeholder="Wie gut kann der/die Patient:in den Ort erreichen?"
            />
          </div>
        </div>

        <div className="p-4 bg-surface-alt rounded-lg border border-muted">
          <label className="block text-sm font-medium text-on-surface mb-3">7.2 Alltagstauglichkeit</label>
          
          <div className="mb-4">
            <label className="block text-sm text-muted mb-2">Ort als Anker im Alltag nutzbar?</label>
            <div className="flex gap-4">
              {[
                { value: 'ja', label: 'Ja' },
                { value: 'nein', label: 'Nein' },
                { value: 'unsicher', label: 'Unsicher' },
              ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="alltag_nutzbar"
                    checked={editedProtocol.transfer?.alltag_nutzbar === option.value}
                    onChange={() => updateNestedField('transfer', 'alltag_nutzbar', option.value)}
                    className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-on-surface">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-muted mb-2">Hinweise für Anwendung im Alltag</label>
            <textarea
              value={editedProtocol.transfer?.alltag_hinweise || ''}
              onChange={(e) => updateNestedField('transfer', 'alltag_hinweise', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[60px]"
              placeholder="Wann und wie soll der sichere Ort im Alltag genutzt werden?"
            />
          </div>
        </div>
      </Card>

      {/* Section 8: Abschluss der Übung */}
      <Card className="mb-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-yellow-400">8. Abschluss der Übung</h2>
          <button
            type="button"
            onClick={() => fillSectionTestData('abschluss')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
            title="Testdaten für Abschluss einfügen"
          >
            <SparklesIcon />
            Testdaten einfügen
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Subjektiver Zustand nach Übung (Mehrfachauswahl)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SUBJEKTIVER_ZUSTAND_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-alt">
                <input
                  type="checkbox"
                  checked={editedProtocol.abschluss?.subjektiver_zustand?.includes(option.value) || false}
                  onChange={() => toggleArrayItem('abschluss', 'subjektiver_zustand', option.value)}
                  className={`w-4 h-4 rounded border-muted bg-background focus:ring-yellow-500 ${
                    option.value === 'dysreguliert' ? 'text-red-500' : 'text-yellow-500'
                  }`}
                />
                <span className={`text-sm ${
                  option.value === 'dysreguliert' ? 'text-red-400' : 'text-on-surface'
                }`}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Körperliche Wahrnehmung zum Abschluss</label>
          <textarea
            value={editedProtocol.abschluss?.koerperliche_wahrnehmung || ''}
            onChange={(e) => updateNestedField('abschluss', 'koerperliche_wahrnehmung', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[60px]"
            placeholder="Wie fühlt sich der Körper nach der Übung an?"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Stabilisierung ausreichend?</label>
          <div className="flex gap-4">
            {[
              { value: true, label: 'Ja' },
              { value: false, label: 'Nein – ggf. weitere Techniken' },
            ].map((option) => (
              <label key={String(option.value)} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="stabilisierung_ausreichend"
                  checked={editedProtocol.abschluss?.stabilisierung_ausreichend === option.value}
                  onChange={() => updateNestedField('abschluss', 'stabilisierung_ausreichend', option.value)}
                  className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-on-surface">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {editedProtocol.abschluss?.stabilisierung_ausreichend === false && (
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Weitere Techniken notieren</label>
            <textarea
              value={editedProtocol.abschluss?.weitere_techniken || ''}
              onChange={(e) => updateNestedField('abschluss', 'weitere_techniken', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[60px]"
              placeholder="Welche weiteren Techniken wurden angewendet?"
            />
          </div>
        )}
      </Card>

      {/* Section 9: Therapeutische Einschätzung */}
      <Card className="mb-6 border-l-4 border-yellow-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-yellow-400">9. Therapeutische Einschätzung</h2>
          <button
            type="button"
            onClick={() => fillSectionTestData('therapeutische_einschaetzung')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
            title="Testdaten für Therapeutische Einschätzung einfügen"
          >
            <SparklesIcon />
            Testdaten einfügen
          </button>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Einschätzung der Eignung des sicheren Ortes</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {EIGNUNG_EINSCHAETZUNG_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-surface-alt">
                <input
                  type="radio"
                  name="eignung_sicherer_ort"
                  checked={editedProtocol.therapeutische_einschaetzung?.eignung_sicherer_ort === option.value}
                  onChange={() => updateNestedField('therapeutische_einschaetzung', 'eignung_sicherer_ort', option.value)}
                  className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                />
                <span className={`text-sm ${
                  option.value === 'geeignet' ? 'text-green-400' :
                  option.value === 'nicht_geeignet' ? 'text-red-400' :
                  option.value === 'bedingt_geeignet' ? 'text-yellow-400' : 'text-on-surface'
                }`}>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Besondere Beobachtungen</label>
          <textarea
            value={editedProtocol.therapeutische_einschaetzung?.besondere_beobachtungen || ''}
            onChange={(e) => updateNestedField('therapeutische_einschaetzung', 'besondere_beobachtungen', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[80px]"
            placeholder="Besonderheiten während der Übung..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-on-surface mb-2">Planung für weitere Sitzungen</label>
          <textarea
            value={editedProtocol.therapeutische_einschaetzung?.planung_weitere_sitzungen || ''}
            onChange={(e) => updateNestedField('therapeutische_einschaetzung', 'planung_weitere_sitzungen', e.target.value)}
            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none resize-y min-h-[60px]"
            placeholder="Wie geht es in den nächsten Sitzungen weiter?"
          />
        </div>

        <Input
          label="Signatur / Name der Therapeut:in"
          value={editedProtocol.therapeutische_einschaetzung?.signatur_therapeut || ''}
          onChange={(e) => updateNestedField('therapeutische_einschaetzung', 'signatur_therapeut', e.target.value)}
          placeholder="Name oder Kürzel"
        />
      </Card>

      {/* Action Buttons */}
      <Card className="sticky bottom-4 z-10 shadow-2xl border-2 border-yellow-500/30">
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
