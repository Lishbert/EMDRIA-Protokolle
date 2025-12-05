import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button, Card } from './ui';
import { SaveIcon, XMarkIcon, DownloadIcon, PrinterIcon, PlusIcon, TrashIcon, PencilIcon, ChevronUpIcon, SparklesIcon } from './icons';
import { MetadataForm } from './MetadataForm';
import type { 
  IRIProtocol, 
  CIPOSProtocol,
  StandardProtocol,
  IndikationOption, 
  KoerperlokalisationOption, 
  KoerperempfindungQualitaet,
  StimulationTyp,
  SetGeschwindigkeit,
  IRIStimulationSet,
} from '../types';
import { saveProtocol } from '../utils/storage';
import { exportProtocolAsJSON, exportProtocolAsPDF } from '../utils/export';

// Lazy load other editors to avoid circular dependencies
const CIPOSProtocolEditor = lazy(() => import('./CIPOSProtocolEditor').then(m => ({ default: m.CIPOSProtocolEditor })));
import {
  INDIKATION_OPTIONS,
  KOERPERLOKALISATION_OPTIONS,
  KOERPEREMPFINDUNG_OPTIONS,
  STIMULATION_TYP_OPTIONS,
  SET_GESCHWINDIGKEIT_OPTIONS,
} from '../constants';
import {
  getRandomItem,
  getRandomItems,
  getRandomLOPE,
  getRandomIRISet,
  SAMPLE_IRI_AUSGANGSZUSTAND,
  SAMPLE_IRI_ZIELE,
  SAMPLE_POSITIVE_MOMENTE,
  SAMPLE_KONTEXT_POSITIVE_MOMENTE,
  SAMPLE_KOERPERWAHRNEHMUNG,
  SAMPLE_ANKER,
  SAMPLE_HAUSAUFGABEN,
  SAMPLE_THERAPEUT_REFLEXION,
} from '../utils/testData';

interface IRIProtocolEditorProps {
  protocol: IRIProtocol | null;
  onSave: () => void;
  onCancel: () => void;
}

// Checkbox Group Component
interface CheckboxGroupProps<T extends string> {
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (selected: T[]) => void;
  hasSonstiges?: boolean;
  sonstigesValue?: string;
  onSonstigesChange?: (value: string) => void;
}

function CheckboxGroup<T extends string>({
  options,
  selected,
  onChange,
  hasSonstiges = false,
  sonstigesValue = '',
  onSonstigesChange,
}: CheckboxGroupProps<T>) {
  const handleToggle = (value: T) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            className="w-5 h-5 rounded border-muted bg-background text-brand-primary focus:ring-brand-primary focus:ring-offset-0"
          />
          <span className="text-on-surface group-hover:text-on-surface-strong transition-colors">
            {option.label}
          </span>
        </label>
      ))}
      {hasSonstiges && selected.includes('sonstiges' as T) && (
        <input
          type="text"
          value={sonstigesValue}
          onChange={(e) => onSonstigesChange?.(e.target.value)}
          placeholder="Bitte beschreiben..."
          className="ml-8 w-full max-w-md bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
        />
      )}
    </div>
  );
}

// Slider Component
interface SliderProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  min: number;
  max: number;
  description?: string;
}

const Slider: React.FC<SliderProps> = ({ label, value, onChange, min, max, description }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-on-surface">
        {label}
      </label>
      {description && (
        <p className="text-sm text-on-surface/70 italic">{description}</p>
      )}
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value ?? min}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-brand-primary"
        />
        <span className="min-w-[3rem] text-center text-lg font-bold text-brand-primary">
          {value ?? '-'}
        </span>
      </div>
      <div className="flex justify-between text-xs text-on-surface/50">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

// Likert Scale Component
interface LikertScaleProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  labels?: { min: string; max: string };
}

const LikertScale: React.FC<LikertScaleProps> = ({ 
  label, 
  value, 
  onChange, 
  labels = { min: '1', max: '5' } 
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-on-surface">{label}</label>
      <div className="flex items-center gap-2">
        <span className="text-xs text-on-surface/60 w-28">{labels.min}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className={`w-10 h-10 rounded-full font-bold transition-all ${
                value === n
                  ? 'bg-brand-primary text-white scale-110'
                  : 'bg-surface text-on-surface hover:bg-brand-primary/20'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <span className="text-xs text-on-surface/60 w-28 text-right">{labels.max}</span>
      </div>
    </div>
  );
};

// Section Header Component with optional test button
interface SectionHeaderProps {
  number: number;
  title: string;
  onFillTest?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ number, title, onFillTest }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-sm">
      {number}
    </span>
    <h2 className="text-lg font-bold text-on-surface-strong flex-1">{title}</h2>
    {onFillTest && (
      <button
        type="button"
        onClick={onFillTest}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
        title="Testdaten einfügen"
      >
        <SparklesIcon />
        Testdaten einfügen
      </button>
    )}
  </div>
);

export const IRIProtocolEditor: React.FC<IRIProtocolEditorProps> = ({ protocol, onSave, onCancel }) => {
  const [editedProtocol, setEditedProtocol] = useState<Partial<IRIProtocol>>({});
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Track which stimulation set is expanded (null means none, or the last one if just added)
  const [expandedSetIndex, setExpandedSetIndex] = useState<number | null>(null);
  
  // Dropdown menu state for bilaterale stimulation test data
  const [showStimulationTestMenu, setShowStimulationTestMenu] = useState(false);

  // Initialize or reset form when protocol changes
  useEffect(() => {
    if (protocol) {
      setEditedProtocol(protocol);
    } else {
      // New IRI protocol
      const emptyData = createEmptyIRIDataLocal();
      setEditedProtocol({
        id: crypto.randomUUID(),
        chiffre: '',
        datum: new Date().toISOString().split('T')[0],
        protokollnummer: '',
        protocolType: 'IRI',
        createdAt: Date.now(),
        lastModified: Date.now(),
        ...emptyData,
      });
    }
    setErrors({});
    setSaveStatus('idle');
  }, [protocol]);

  // Local implementation to avoid import issues
  function createEmptyIRIDataLocal() {
    return {
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
        stimulation_typ: 'visuell' as const,
        sets: [],
      },
      lope_nachher: undefined,
      ressourcen_einschaetzung: {},
      abschluss: {},
    };
  }

  const handleMetadataChange = (metadata: Partial<IRIProtocol>) => {
    // If switching to a different protocol type, convert the protocol
    if (metadata.protocolType && metadata.protocolType !== 'IRI') {
      if (metadata.protocolType === 'CIPOS') {
        // Convert to CIPOS protocol
        const ciposProtocol = {
          id: editedProtocol.id || crypto.randomUUID(),
          chiffre: metadata.chiffre || editedProtocol.chiffre || '',
          datum: metadata.datum || editedProtocol.datum || new Date().toISOString().split('T')[0],
          protokollnummer: metadata.protokollnummer || editedProtocol.protokollnummer || '',
          protocolType: 'CIPOS' as const,
          createdAt: editedProtocol.createdAt || Date.now(),
          lastModified: Date.now(),
          gegenwartsorientierung_vorher: {
            prozent_gegenwartsorientierung: 50,
            indikatoren_patient: '',
          },
          verstaerkung_gegenwart: {
            stimulation_methode: 'visuell' as const,
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
        setEditedProtocol(ciposProtocol as unknown as Partial<IRIProtocol>);
      } else {
        // Convert to Standard protocol (Reprozessieren, Sicherer Ort, Custom)
        const standardProtocol = {
          id: editedProtocol.id || crypto.randomUUID(),
          chiffre: metadata.chiffre || editedProtocol.chiffre || '',
          datum: metadata.datum || editedProtocol.datum || new Date().toISOString().split('T')[0],
          protokollnummer: metadata.protokollnummer || editedProtocol.protokollnummer || '',
          protocolType: metadata.protocolType,
          createdAt: editedProtocol.createdAt || Date.now(),
          lastModified: Date.now(),
          startKnoten: '',
          channel: [],
        };
        setEditedProtocol(standardProtocol as unknown as Partial<IRIProtocol>);
      }
      return;
    }

    setEditedProtocol({
      ...editedProtocol,
      ...metadata,
    });
  };

  // Update nested fields helper
  const updateField = <K extends keyof IRIProtocol>(
    section: K,
    field: string,
    value: unknown
  ) => {
    setEditedProtocol((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value,
      },
    }));
  };

  // Update expandedSetIndex when sets are deleted
  useEffect(() => {
    const setsCount = editedProtocol.bilaterale_stimulation?.sets?.length || 0;
    if (expandedSetIndex !== null && expandedSetIndex >= setsCount) {
      setExpandedSetIndex(setsCount > 0 ? setsCount - 1 : null);
    }
  }, [editedProtocol.bilaterale_stimulation?.sets?.length, expandedSetIndex]);

  // Add a new stimulation set
  const addStimulationSet = () => {
    const currentSets = editedProtocol.bilaterale_stimulation?.sets || [];
    const newSet: IRIStimulationSet = {
      id: crypto.randomUUID(),
      set_nummer: currentSets.length + 1,
      set_geschwindigkeit: 'mittel',
    };
    updateField('bilaterale_stimulation', 'sets', [...currentSets, newSet]);
    // Expand the new set
    setExpandedSetIndex(currentSets.length);
  };

  // Toggle set expansion
  const toggleSetExpand = (index: number) => {
    setExpandedSetIndex(expandedSetIndex === index ? null : index);
  };

  // Get label for geschwindigkeit
  const getGeschwindigkeitLabel = (value: SetGeschwindigkeit): string => {
    return SET_GESCHWINDIGKEIT_OPTIONS.find(o => o.value === value)?.label || value;
  };

  // Truncate text helper
  const truncateText = (text: string | undefined, maxLength: number = 40): string => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Remove a stimulation set
  const removeStimulationSet = (id: string) => {
    const currentSets = editedProtocol.bilaterale_stimulation?.sets || [];
    const filtered = currentSets.filter((s) => s.id !== id);
    // Renumber sets
    const renumbered = filtered.map((s, i) => ({ ...s, set_nummer: i + 1 }));
    updateField('bilaterale_stimulation', 'sets', renumbered);
  };

  // Update a stimulation set
  const updateStimulationSet = (id: string, field: keyof IRIStimulationSet, value: unknown) => {
    const currentSets = editedProtocol.bilaterale_stimulation?.sets || [];
    const updated = currentSets.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    updateField('bilaterale_stimulation', 'sets', updated);
  };

  // =============================================
  // Test Data Fill Functions for each section
  // =============================================

  const fillTestIndikation = () => {
    const indikationOptions: IndikationOption[] = ['bindungsdefizite', 'schwierigkeiten_ressourcen', 'wenig_ressourcen', 'erhoehte_anspannung'];
    setEditedProtocol((prev) => ({
      ...prev,
      indikation: {
        ...prev.indikation,
        indikation_checklist: getRandomItems(indikationOptions, 1, 3),
        ausgangszustand_beschreibung: getRandomItem(SAMPLE_IRI_AUSGANGSZUSTAND),
        ziel_der_iri: getRandomItem(SAMPLE_IRI_ZIELE),
      },
    }));
  };

  const fillTestPositiverMoment = () => {
    setEditedProtocol((prev) => ({
      ...prev,
      positiver_moment: {
        ...prev.positiver_moment,
        positiver_moment_beschreibung: getRandomItem(SAMPLE_POSITIVE_MOMENTE),
        kontext_positiver_moment: getRandomItem(SAMPLE_KONTEXT_POSITIVE_MOMENTE),
        wahrgenommene_positive_veraenderung: 'Patient zeigt entspannte Mimik, aufrechte Haltung, lebendiger Ausdruck.',
        veraenderung_mimik: 'Lächeln, Entspannung um die Augen',
        veraenderung_verbale_ausdrucksweise: 'Lebendiger, hoffnungsvoller Tonfall',
        veraenderung_koerperhaltung: 'Aufrechter, offener',
      },
    }));
  };

  const fillTestKoerperwahrnehmung = () => {
    const koerperlokalisationOptions: KoerperlokalisationOption[] = ['kopf', 'hals_nacken', 'brustkorb', 'bauch', 'ruecken', 'arme_haende', 'beine_fuesse', 'ganzkoerper'];
    const qualitaetOptions: KoerperempfindungQualitaet[] = ['warm', 'weit', 'leicht', 'ruhig', 'kraftvoll', 'lebendig'];
    setEditedProtocol((prev) => ({
      ...prev,
      koerperwahrnehmung: {
        ...prev.koerperwahrnehmung,
        koerperwahrnehmung_rohtext: getRandomItem(SAMPLE_KOERPERWAHRNEHMUNG),
        koerperlokalisation: getRandomItems(koerperlokalisationOptions, 1, 3),
        qualitaet_koerperempfindung: getRandomItems(qualitaetOptions, 2, 4),
      },
    }));
  };

  const fillTestLopeVorher = () => {
    setEditedProtocol((prev) => ({
      ...prev,
      lope_vorher: getRandomLOPE(2, 5),
    }));
  };

  const fillTestBilateraleStimulation = (count: number) => {
    const stimulationTypen: StimulationTyp[] = ['visuell', 'taktil', 'auditiv'];
    const newSets = Array.from({ length: count }, (_, i) => getRandomIRISet(i + 1));
    
    setEditedProtocol((prev) => ({
      ...prev,
      bilaterale_stimulation: {
        ...prev.bilaterale_stimulation,
        stimulation_typ: getRandomItem(stimulationTypen),
        stimulation_bemerkungen_allgemein: 'Verlauf ohne Besonderheiten. Patient konnte gut folgen.',
        sets: newSets,
      },
    }));
    // Collapse all sets after filling
    setExpandedSetIndex(null);
    setShowStimulationTestMenu(false);
  };

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showStimulationTestMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.stimulation-test-dropdown')) {
          setShowStimulationTestMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStimulationTestMenu]);

  const fillTestLopeNachher = () => {
    const lopeVorher = editedProtocol.lope_vorher ?? 4;
    const lopeNachher = Math.min(10, lopeVorher + getRandomLOPE(2, 4));
    setEditedProtocol((prev) => ({
      ...prev,
      lope_nachher: lopeNachher,
    }));
  };

  const fillTestRessourcenEinschaetzung = () => {
    setEditedProtocol((prev) => ({
      ...prev,
      ressourcen_einschaetzung: {
        ...prev.ressourcen_einschaetzung,
        ressource_spuerbarkeit: Math.floor(Math.random() * 2) + 4, // 4-5
        ressource_erreichbarkeit_im_alltag: Math.floor(Math.random() * 2) + 3, // 3-4
        anker_fuer_alltag: getRandomItem(SAMPLE_ANKER),
        vereinbarte_hausaufgabe: getRandomItem(SAMPLE_HAUSAUFGABEN),
        bemerkungen_risiko_stabilitaet: 'Stabil nach der Übung. Keine Anzeichen von Überforderung.',
      },
    }));
  };

  const fillTestGesamtkommentar = () => {
    setEditedProtocol((prev) => ({
      ...prev,
      abschluss: {
        ...prev.abschluss,
        therapeut_reflexion: getRandomItem(SAMPLE_THERAPEUT_REFLEXION),
        naechste_schritte_behandlung: 'Fortsetzung der Ressourcenarbeit in der nächsten Sitzung. Bei guter Stabilität ggf. Beginn der Reprozessierung.',
      },
    }));
  };

  // Get human-readable list of missing fields
  const getMissingFields = (): string[] => {
    const missing: string[] = [];

    // Metadata
    if (!editedProtocol.chiffre?.trim()) missing.push('Patient:innen-Chiffre');
    if (!editedProtocol.datum) missing.push('Datum');
    if (!editedProtocol.protokollnummer?.trim()) missing.push('Protokollnummer');

    // Section 2: Indikation
    if (!editedProtocol.indikation?.indikation_checklist?.length) {
      missing.push('Indikation (mindestens eine Auswahl)');
    }
    if (!editedProtocol.indikation?.ausgangszustand_beschreibung?.trim()) {
      missing.push('Beschreibung des Ausgangszustands');
    }
    if (!editedProtocol.indikation?.ziel_der_iri?.trim()) {
      missing.push('Ziel der IRI');
    }

    // Section 3: Positiver Moment
    if (!editedProtocol.positiver_moment?.positiver_moment_beschreibung?.trim()) {
      missing.push('Positiver Moment - Beschreibung');
    }
    if (!editedProtocol.positiver_moment?.kontext_positiver_moment?.trim()) {
      missing.push('Kontext des positiven Moments');
    }
    if (!editedProtocol.positiver_moment?.wahrgenommene_positive_veraenderung?.trim()) {
      missing.push('Wahrgenommene positive Veränderung');
    }

    // Section 4: Körperwahrnehmung
    if (!editedProtocol.koerperwahrnehmung?.koerperwahrnehmung_rohtext?.trim()) {
      missing.push('Körperwahrnehmung - Patientenbeschreibung');
    }
    if (!editedProtocol.koerperwahrnehmung?.koerperlokalisation?.length) {
      missing.push('Körperlokalisation (mindestens eine Auswahl)');
    }
    if (!editedProtocol.koerperwahrnehmung?.qualitaet_koerperempfindung?.length) {
      missing.push('Qualität der Körperempfindung (mindestens eine Auswahl)');
    }

    // Section 5: LOPE vorher
    if (editedProtocol.lope_vorher === undefined || editedProtocol.lope_vorher === null) {
      missing.push('LOPE vor Stimulation');
    }

    // Section 6: Bilaterale Stimulation
    if (!editedProtocol.bilaterale_stimulation?.sets?.length) {
      missing.push('Mindestens ein Stimulations-Set');
    }

    // Section 7: LOPE nachher
    if (editedProtocol.lope_nachher === undefined || editedProtocol.lope_nachher === null) {
      missing.push('LOPE nach Stimulation');
    }

    return missing;
  };

  const validateProtocol = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};

    if (!editedProtocol.chiffre?.trim()) newErrors.chiffre = true;
    if (!editedProtocol.datum) newErrors.datum = true;
    if (!editedProtocol.protokollnummer?.trim()) newErrors.protokollnummer = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const missingFields = getMissingFields();

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

  const handleExportJSON = () => {
    if (!editedProtocol.id) return;
    try {
      exportProtocolAsJSON(editedProtocol as IRIProtocol);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Fehler beim Exportieren des Protokolls.');
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

  // Calculate LOPE change
  const lopeChange = 
    editedProtocol.lope_vorher !== undefined && editedProtocol.lope_nachher !== undefined
      ? editedProtocol.lope_nachher - editedProtocol.lope_vorher
      : null;

  // If the protocol type has changed to CIPOS, render CIPOS editor
  if (editedProtocol.protocolType === 'CIPOS') {
    return (
      <Suspense fallback={<div className="p-8 text-center text-on-surface">Lade CIPOS-Editor...</div>}>
        <CIPOSProtocolEditor
          protocol={editedProtocol as unknown as CIPOSProtocol}
          onSave={onSave}
          onCancel={onCancel}
        />
      </Suspense>
    );
  }

  // If the protocol type has changed to a Standard type, render a simplified standard form
  // that will save and the parent ProtocolEditor will handle the switch
  if (editedProtocol.protocolType && editedProtocol.protocolType !== 'IRI' && editedProtocol.protocolType !== 'CIPOS') {
    // Save the converted protocol and notify parent
    const standardProtocol = editedProtocol as unknown as StandardProtocol;
    saveProtocol(standardProtocol);
    setTimeout(() => onSave(), 100);
    return (
      <div className="p-8 text-center text-on-surface">
        <p className="text-lg">Protokolltyp wird geändert zu <strong>{editedProtocol.protocolType}</strong>...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Metadata */}
      <MetadataForm
        metadata={editedProtocol}
        onChange={handleMetadataChange}
        errors={errors}
      />

      {/* Section 2: Indikation / Ausgangslage */}
      <Card className="mb-6">
        <SectionHeader number={2} title="Indikation / Ausgangslage" onFillTest={fillTestIndikation} />
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-3">
              Indikation (Mehrfachauswahl möglich)
            </label>
            <CheckboxGroup<IndikationOption>
              options={INDIKATION_OPTIONS}
              selected={editedProtocol.indikation?.indikation_checklist || []}
              onChange={(selected) => updateField('indikation', 'indikation_checklist', selected)}
              hasSonstiges={true}
              sonstigesValue={editedProtocol.indikation?.indikation_sonstiges || ''}
              onSonstigesChange={(value) => updateField('indikation', 'indikation_sonstiges', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Kurzbeschreibung der Situation/Thematik vor Beginn der IRI
            </label>
            <textarea
              value={editedProtocol.indikation?.ausgangszustand_beschreibung || ''}
              onChange={(e) => updateField('indikation', 'ausgangszustand_beschreibung', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[100px]"
              placeholder="Beschreiben Sie die Ausgangslage..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Was soll mit der IRI erreicht/gestärkt werden?
            </label>
            <textarea
              value={editedProtocol.indikation?.ziel_der_iri || ''}
              onChange={(e) => updateField('indikation', 'ziel_der_iri', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[100px]"
              placeholder="Beschreiben Sie das Ziel der IRI..."
            />
          </div>
        </div>
      </Card>

      {/* Section 3: Auslöser der Ressource / positiver Moment */}
      <Card className="mb-6">
        <SectionHeader number={3} title="Auslöser der Ressource / Positiver Moment" onFillTest={fillTestPositiverMoment} />
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Was war der positive Inhalt/Moment?
            </label>
            <p className="text-xs text-on-surface/60 mb-2">Worte, Thema, Erinnerung</p>
            <textarea
              value={editedProtocol.positiver_moment?.positiver_moment_beschreibung || ''}
              onChange={(e) => updateField('positiver_moment', 'positiver_moment_beschreibung', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[100px]"
              placeholder="Beschreiben Sie den positiven Moment..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              In welchem Kontext tauchte der positive Moment auf?
            </label>
            <input
              type="text"
              value={editedProtocol.positiver_moment?.kontext_positiver_moment || ''}
              onChange={(e) => updateField('positiver_moment', 'kontext_positiver_moment', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              placeholder="z.B. Thema im Gespräch..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Beobachtete Veränderung durch Therapeut:in
            </label>
            <textarea
              value={editedProtocol.positiver_moment?.wahrgenommene_positive_veraenderung || ''}
              onChange={(e) => updateField('positiver_moment', 'wahrgenommene_positive_veraenderung', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
              placeholder="Frei beschriebene Beobachtungen..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface/50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Veränderung Mimik
              </label>
              <input
                type="text"
                value={editedProtocol.positiver_moment?.veraenderung_mimik || ''}
                onChange={(e) => updateField('positiver_moment', 'veraenderung_mimik', e.target.value)}
                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
                placeholder="z.B. Lächeln, Entspannung im Gesicht"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Veränderung verbale Ausdrucksweise
              </label>
              <input
                type="text"
                value={editedProtocol.positiver_moment?.veraenderung_verbale_ausdrucksweise || ''}
                onChange={(e) => updateField('positiver_moment', 'veraenderung_verbale_ausdrucksweise', e.target.value)}
                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
                placeholder="z.B. lebendiger, hoffnungsvoller"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Veränderung Körperhaltung
              </label>
              <input
                type="text"
                value={editedProtocol.positiver_moment?.veraenderung_koerperhaltung || ''}
                onChange={(e) => updateField('positiver_moment', 'veraenderung_koerperhaltung', e.target.value)}
                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-sm"
                placeholder="z.B. aufrechter, entspannter"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Section 4: Körperwahrnehmung */}
      <Card className="mb-6">
        <SectionHeader number={4} title="Körperwahrnehmung (Ressource spürbar machen)" onFillTest={fillTestKoerperwahrnehmung} />
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Originalbeschreibung der Patient:in
            </label>
            <p className="text-xs text-on-surface/60 mb-2 italic">„Wie fühlen Sie das im Körper?"</p>
            <textarea
              value={editedProtocol.koerperwahrnehmung?.koerperwahrnehmung_rohtext || ''}
              onChange={(e) => updateField('koerperwahrnehmung', 'koerperwahrnehmung_rohtext', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[100px]"
              placeholder="Patientenbeschreibung der Körperwahrnehmung..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-3">
              Körperlokalisation (Mehrfachauswahl)
            </label>
            <CheckboxGroup<KoerperlokalisationOption>
              options={KOERPERLOKALISATION_OPTIONS}
              selected={editedProtocol.koerperwahrnehmung?.koerperlokalisation || []}
              onChange={(selected) => updateField('koerperwahrnehmung', 'koerperlokalisation', selected)}
              hasSonstiges={true}
              sonstigesValue={editedProtocol.koerperwahrnehmung?.koerperlokalisation_sonstiges || ''}
              onSonstigesChange={(value) => updateField('koerperwahrnehmung', 'koerperlokalisation_sonstiges', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-3">
              Qualität der Körperempfindung (Mehrfachauswahl)
            </label>
            <CheckboxGroup<KoerperempfindungQualitaet>
              options={KOERPEREMPFINDUNG_OPTIONS}
              selected={editedProtocol.koerperwahrnehmung?.qualitaet_koerperempfindung || []}
              onChange={(selected) => updateField('koerperwahrnehmung', 'qualitaet_koerperempfindung', selected)}
              hasSonstiges={true}
              sonstigesValue={editedProtocol.koerperwahrnehmung?.qualitaet_sonstiges || ''}
              onSonstigesChange={(value) => updateField('koerperwahrnehmung', 'qualitaet_sonstiges', value)}
            />
          </div>
        </div>
      </Card>

      {/* Section 5: LOPE vorher */}
      <Card className="mb-6">
        <SectionHeader number={5} title="LOPE – Level of Positive Emotion (vor Stimulation)" onFillTest={fillTestLopeVorher} />
        
        <Slider
          label="Wie intensiv ist diese positive Wahrnehmung jetzt?"
          description="0 = neutral bis 10 = maximal positiv"
          value={editedProtocol.lope_vorher}
          onChange={(value) => setEditedProtocol({ ...editedProtocol, lope_vorher: value })}
          min={0}
          max={10}
        />
      </Card>

      {/* Section 6: Bilaterale Stimulation */}
      <Card className="mb-6">
        {/* Custom header with dropdown menu for test data */}
        <div className="flex items-center gap-3 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-sm">
            6
          </span>
          <h2 className="text-lg font-bold text-on-surface-strong flex-1">Bilaterale Stimulation (Ablauf)</h2>
          <div className="relative stimulation-test-dropdown">
            <button
              type="button"
              onClick={() => setShowStimulationTestMenu(!showStimulationTestMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
              title="Testdaten einfügen"
            >
              <SparklesIcon />
              Testdaten einfügen
              <svg className={`w-4 h-4 transition-transform ${showStimulationTestMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showStimulationTestMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-surface border-2 border-brand-secondary/30 rounded-lg shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="p-1">
                  <button
                    type="button"
                    onClick={() => fillTestBilateraleStimulation(5)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                  >
                    5 Sets erstellen
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestBilateraleStimulation(10)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                  >
                    10 Sets erstellen
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestBilateraleStimulation(15)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                  >
                    15 Sets erstellen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Stimulationstyp
              </label>
              <select
                value={editedProtocol.bilaterale_stimulation?.stimulation_typ || 'visuell'}
                onChange={(e) => updateField('bilaterale_stimulation', 'stimulation_typ', e.target.value as StimulationTyp)}
                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              >
                {STIMULATION_TYP_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            
            {editedProtocol.bilaterale_stimulation?.stimulation_typ === 'kombination' && (
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Beschreibung Kombination/Sonstiges
                </label>
                <input
                  type="text"
                  value={editedProtocol.bilaterale_stimulation?.stimulation_typ_sonstiges || ''}
                  onChange={(e) => updateField('bilaterale_stimulation', 'stimulation_typ_sonstiges', e.target.value)}
                  className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  placeholder="Bitte beschreiben..."
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Allgemeine Bemerkungen
            </label>
            <textarea
              value={editedProtocol.bilaterale_stimulation?.stimulation_bemerkungen_allgemein || ''}
              onChange={(e) => updateField('bilaterale_stimulation', 'stimulation_bemerkungen_allgemein', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[60px]"
              placeholder="z.B. Besonderheiten, Anpassungen, Unterbrechungen..."
            />
          </div>

          {/* Stimulation Sets */}
          <div>
            <h3 className="font-medium text-on-surface mb-4">Stimulationssets</h3>

            {(editedProtocol.bilaterale_stimulation?.sets || []).length === 0 ? (
              <div className="text-center py-8 text-on-surface/60 bg-surface/50 rounded-lg border-2 border-dashed border-muted">
                <p>Noch keine Sets vorhanden.</p>
                <p className="text-sm mt-1">Klicken Sie auf "Set hinzufügen" um zu beginnen.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(editedProtocol.bilaterale_stimulation?.sets || []).map((set, index) => {
                  const isExpanded = expandedSetIndex === index;
                  
                  // Collapsed view
                  if (!isExpanded) {
                    return (
                      <div
                        key={set.id}
                        className="bg-background border-2 border-muted/30 rounded-lg p-3 hover:border-purple-500/50 transition-colors cursor-pointer group"
                        onClick={() => toggleSetExpand(index)}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Main summary content */}
                          <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-purple-400 whitespace-nowrap">
                              Set {set.set_nummer}:
                            </span>
                            <span className="text-on-surface whitespace-nowrap">
                              {getGeschwindigkeitLabel(set.set_geschwindigkeit)}
                              {set.set_dauer && ` · ${set.set_dauer}`}
                            </span>
                            {set.lope_nach_set !== undefined && (
                              <>
                                <span className="text-muted">|</span>
                                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                                  LOPE: {set.lope_nach_set}/10
                                </span>
                              </>
                            )}
                            {set.subjektive_wahrnehmung_nach_set && (
                              <span className="text-on-surface/60 truncate hidden sm:inline">
                                {truncateText(set.subjektive_wahrnehmung_nach_set)}
                              </span>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => toggleSetExpand(index)}
                              className="text-muted hover:text-purple-400 hover:bg-purple-400/10 rounded p-1 transition-colors"
                              title="Bearbeiten"
                            >
                              <PencilIcon />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeStimulationSet(set.id)}
                              className="text-muted hover:text-red-500 hover:bg-red-500/10 rounded p-1 transition-colors"
                              title="Löschen"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Expanded view
                  return (
                    <div
                      key={set.id}
                      className="p-4 bg-surface/50 rounded-lg border-2 border-purple-500/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-purple-400">
                          Set {set.set_nummer}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleSetExpand(index)}
                            className="text-muted hover:text-purple-400 hover:bg-purple-400/10 rounded p-1 transition-colors"
                            title="Einklappen"
                          >
                            <ChevronUpIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeStimulationSet(set.id)}
                            className="p-1 text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Set entfernen"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-on-surface/70 mb-1">
                            Dauer
                          </label>
                          <input
                            type="text"
                            value={set.set_dauer || ''}
                            onChange={(e) => updateStimulationSet(set.id, 'set_dauer', e.target.value)}
                            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                            placeholder="z.B. 30 Sekunden"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-on-surface/70 mb-1">
                            Geschwindigkeit
                          </label>
                          <select
                            value={set.set_geschwindigkeit}
                            onChange={(e) => updateStimulationSet(set.id, 'set_geschwindigkeit', e.target.value as SetGeschwindigkeit)}
                            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                          >
                            {SET_GESCHWINDIGKEIT_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-on-surface/70 mb-1">
                            Anzahl Durchgänge
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={set.set_anzahl_durchgaenge || ''}
                            onChange={(e) => updateStimulationSet(set.id, 'set_anzahl_durchgaenge', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium text-on-surface/70 mb-1">
                          Instruktion
                        </label>
                        <textarea
                          value={set.instruktion_text || ''}
                          onChange={(e) => updateStimulationSet(set.id, 'instruktion_text', e.target.value)}
                          className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[60px]"
                          placeholder='z.B. „Denken Sie an den positiven Moment [X] und achten Sie auf das angenehme Körpergefühl. Folgen Sie dann mit den Augen meinen Fingern."'
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs font-medium text-on-surface/70 mb-1">
                          Subjektive Wahrnehmung nach dem Set
                        </label>
                        <textarea
                          value={set.subjektive_wahrnehmung_nach_set || ''}
                          onChange={(e) => updateStimulationSet(set.id, 'subjektive_wahrnehmung_nach_set', e.target.value)}
                          className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[60px]"
                          placeholder="Rückmeldung der Patient:in..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-on-surface/70 mb-1">
                          LOPE nach dem Set (0–10)
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={0}
                            max={10}
                            value={set.lope_nach_set ?? 0}
                            onChange={(e) => updateStimulationSet(set.id, 'lope_nach_set', parseInt(e.target.value))}
                            className="flex-1 h-2 bg-background rounded-lg appearance-none cursor-pointer accent-brand-primary"
                          />
                          <span className="min-w-[2.5rem] text-center font-bold text-purple-400">
                            {set.lope_nach_set ?? '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="pt-4">
              <Button onClick={addStimulationSet} className="w-full md:w-auto">
                <PlusIcon />
                Set hinzufügen
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 7: LOPE Abschluss */}
      <Card className="mb-6">
        <SectionHeader number={7} title="LOPE – Abschlussbewertung" onFillTest={fillTestLopeNachher} />
        
        <div className="space-y-4">
          <Slider
            label="Wie intensiv ist die positive Wahrnehmung jetzt?"
            description="0 = neutral bis 10 = maximal positiv"
            value={editedProtocol.lope_nachher}
            onChange={(value) => setEditedProtocol({ ...editedProtocol, lope_nachher: value })}
            min={0}
            max={10}
          />

          {lopeChange !== null && (
            <div className="p-4 bg-surface/50 rounded-lg text-center">
              <span className="text-sm text-on-surface/70">Veränderung LOPE:</span>
              <span className={`ml-2 font-bold text-lg ${
                lopeChange > 0 ? 'text-green-400' : lopeChange < 0 ? 'text-red-400' : 'text-on-surface'
              }`}>
                {lopeChange > 0 ? '+' : ''}{lopeChange}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Section 8: Einschätzung der Ressource & Integration */}
      <Card className="mb-6">
        <SectionHeader number={8} title="Einschätzung der Ressource & Integration" onFillTest={fillTestRessourcenEinschaetzung} />
        
        <div className="space-y-6">
          <LikertScale
            label="Wie spürbar ist die Ressource?"
            value={editedProtocol.ressourcen_einschaetzung?.ressource_spuerbarkeit}
            onChange={(value) => updateField('ressourcen_einschaetzung', 'ressource_spuerbarkeit', value)}
            labels={{ min: 'kaum spürbar', max: 'sehr deutlich spürbar' }}
          />

          <LikertScale
            label="Erreichbarkeit im Alltag"
            value={editedProtocol.ressourcen_einschaetzung?.ressource_erreichbarkeit_im_alltag}
            onChange={(value) => updateField('ressourcen_einschaetzung', 'ressource_erreichbarkeit_im_alltag', value)}
            labels={{ min: 'eher nicht abrufbar', max: 'gut abrufbar' }}
          />

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Anker für den Alltag
            </label>
            <input
              type="text"
              value={editedProtocol.ressourcen_einschaetzung?.anker_fuer_alltag || ''}
              onChange={(e) => updateField('ressourcen_einschaetzung', 'anker_fuer_alltag', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              placeholder="Konkrete Anker/Strategien, um die Ressource im Alltag abrufen zu können..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Vereinbarte Hausaufgabe
            </label>
            <textarea
              value={editedProtocol.ressourcen_einschaetzung?.vereinbarte_hausaufgabe || ''}
              onChange={(e) => updateField('ressourcen_einschaetzung', 'vereinbarte_hausaufgabe', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
              placeholder="z.B. tägliches kurzes Erinnern an den positiven Moment, Körperübung etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Bemerkungen zu Risiko/Stabilität
            </label>
            <textarea
              value={editedProtocol.ressourcen_einschaetzung?.bemerkungen_risiko_stabilitaet || ''}
              onChange={(e) => updateField('ressourcen_einschaetzung', 'bemerkungen_risiko_stabilitaet', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
              placeholder="z.B. Stabilität nach der Übung, Hinweise auf Überforderung, zusätzliche Stabilisierungstechniken..."
            />
          </div>
        </div>
      </Card>

      {/* Section 9: Gesamtkommentar der Therapeut:in */}
      <Card className="mb-6">
        <SectionHeader number={9} title="Gesamtkommentar der Therapeut:in" onFillTest={fillTestGesamtkommentar} />
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Reflexion zum Verlauf
            </label>
            <textarea
              value={editedProtocol.abschluss?.therapeut_reflexion || ''}
              onChange={(e) => updateField('abschluss', 'therapeut_reflexion', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[100px]"
              placeholder="Einschätzung des Verlaufs, Besonderheiten, wichtige klinische Beobachtungen..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Nächste Schritte in der Behandlung
            </label>
            <textarea
              value={editedProtocol.abschluss?.naechste_schritte_behandlung || ''}
              onChange={(e) => updateField('abschluss', 'naechste_schritte_behandlung', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[100px]"
              placeholder="Planung, ob/wann weitere IRI, Übergang zu anderen EMDR-Phasen etc."
            />
          </div>
        </div>
      </Card>

      {/* Missing Fields Warning */}
      {missingFields.length > 0 && (
        <Card className="mb-6 border-2 border-amber-500/50 bg-amber-500/10">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-amber-400 font-bold text-sm mb-2">
                Fehlende Felder im IRI-Protokoll ({missingFields.length})
              </h3>
              <ul className="text-amber-300/90 text-sm space-y-1 columns-1 md:columns-2 gap-x-8">
                {missingFields.map((field, index) => (
                  <li key={index} className="flex items-center gap-2 break-inside-avoid">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

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

        {saveStatus === 'error' && missingFields.length > 0 && (
          <p className="text-red-500 text-sm mt-3">
            Fehler beim Speichern. Bitte füllen Sie alle oben aufgelisteten Felder aus.
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

