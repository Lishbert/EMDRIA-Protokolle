import React, { useState, useEffect } from 'react';
import { Button, Card } from './ui';
import { SaveIcon, XMarkIcon, DownloadIcon, PrinterIcon, PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon, SparklesIcon } from './icons';
import { MetadataForm } from './MetadataForm';
import type { 
  CIPOSProtocol, 
  CIPOSStimulationMethode,
  ReorientierungsMethode,
  CIPOSDurchgang,
} from '../types';
import { saveProtocol } from '../utils/storage';
import { exportProtocolAsJSON, exportProtocolAsPDF } from '../utils/export';
import {
  CIPOS_STIMULATION_METHODE_OPTIONS,
  CIPOS_REORIENTIERUNG_OPTIONS,
  CIPOS_DAUER_OPTIONS,
} from '../constants';
import {
  getRandomItem,
  getRandomPercentage,
  getRandomSUD,
  getRandomBoolean,
  getRandomBooleanOrNull,
  SAMPLE_CIPOS_INDIKATOREN,
  SAMPLE_CIPOS_BEOBACHTUNGEN,
  SAMPLE_CIPOS_DAUER_SETS,
  SAMPLE_CIPOS_ZIELERINNERUNG,
  SAMPLE_CIPOS_RUECKMELDUNG_ERINNERUNG,
  SAMPLE_CIPOS_RUECKMELDUNG_KOERPER,
  SAMPLE_CIPOS_AUFGABE_TAGEBUCH,
  SAMPLE_CIPOS_STABILISIERUNG,
  SAMPLE_CIPOS_GESAMTEINSCHAETZUNG,
  SAMPLE_CIPOS_NAECHSTE_SITZUNG,
} from '../utils/testData';

interface CIPOSProtocolEditorProps {
  protocol: CIPOSProtocol | null;
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

// Percentage Slider Component
interface PercentageSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  targetValue?: number;
}

const PercentageSlider: React.FC<PercentageSliderProps> = ({ 
  label, 
  value, 
  onChange, 
  description,
  targetValue 
}) => {
  const isTargetMet = targetValue !== undefined && value >= targetValue;
  
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
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-green-500"
        />
        <span className={`min-w-[4rem] text-center text-lg font-bold ${
          isTargetMet ? 'text-green-400' : value >= 50 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {value}%
        </span>
      </div>
      <div className="flex justify-between text-xs text-on-surface/50">
        <span>0%</span>
        {targetValue && (
          <span className="text-green-400">Ziel: ≥{targetValue}%</span>
        )}
        <span>100%</span>
      </div>
    </div>
  );
};

// SUD Slider Component
interface SUDSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
}

const SUDSlider: React.FC<SUDSliderProps> = ({ label, value, onChange, description }) => {
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
          min={0}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-green-500"
        />
        <span className={`min-w-[3rem] text-center text-lg font-bold ${
          value <= 3 ? 'text-green-400' : value <= 6 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {value}
        </span>
      </div>
      <div className="flex justify-between text-xs text-on-surface/50">
        <span>0 = keine Belastung</span>
        <span>10 = max. Belastung</span>
      </div>
    </div>
  );
};

// Yes/No/Null Toggle Component
interface YesNoToggleProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}

const YesNoToggle: React.FC<YesNoToggleProps> = ({ label, value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-on-surface">{label}</label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            value === true
              ? 'bg-green-500 text-white'
              : 'bg-surface text-on-surface hover:bg-green-500/20'
          }`}
        >
          Ja
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            value === false
              ? 'bg-red-500 text-white'
              : 'bg-surface text-on-surface hover:bg-red-500/20'
          }`}
        >
          Nein
        </button>
      </div>
    </div>
  );
};

// Test Button Component
interface TestButtonProps {
  onClick: () => void;
  title?: string;
}

const TestButton: React.FC<TestButtonProps> = ({ onClick, title = 'Testdaten einfügen' }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
    title={title}
  >
    <SparklesIcon />
    Testdaten
  </button>
);

// Section Header Component
interface SectionHeaderProps {
  number: number | string;
  title: string;
  subtitle?: string;
  onTestData?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ number, title, subtitle, onTestData }) => (
  <div className="flex items-start justify-between mb-4">
    <div className="flex items-start gap-3">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-sm flex-shrink-0">
        {number}
      </span>
      <div>
        <h2 className="text-lg font-bold text-on-surface-strong">{title}</h2>
        {subtitle && <p className="text-sm text-on-surface/70">{subtitle}</p>}
      </div>
    </div>
    {onTestData && <TestButton onClick={onTestData} />}
  </div>
);

// Subsection Header Component
interface SubsectionHeaderProps {
  number: string;
  title: string;
}

const SubsectionHeader: React.FC<SubsectionHeaderProps> = ({ number, title }) => (
  <div className="flex items-center gap-2 mb-3 mt-6">
    <span className="text-sm font-bold text-green-400">{number}</span>
    <h3 className="text-md font-semibold text-on-surface">{title}</h3>
  </div>
);

export const CIPOSProtocolEditor: React.FC<CIPOSProtocolEditorProps> = ({ protocol, onSave, onCancel }) => {
  const [editedProtocol, setEditedProtocol] = useState<Partial<CIPOSProtocol>>({});
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [expandedDurchgang, setExpandedDurchgang] = useState<number | null>(null);
  const [showDurchgangTestMenu, setShowDurchgangTestMenu] = useState(false);

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

  // Update nested fields helper
  const updateField = <K extends keyof CIPOSProtocol>(
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

  // Add a new Durchgang
  const addDurchgang = () => {
    const currentDurchgaenge = editedProtocol.durchgaenge || [];
    const newDurchgang: CIPOSDurchgang = {
      id: crypto.randomUUID(),
      durchgang_nummer: currentDurchgaenge.length + 1,
      bereitschaft_patient: null,
      zaehl_technik: null,
      dauer_sekunden: editedProtocol.erster_kontakt?.belastungsdauer_sekunden || 5,
      reorientierung_methoden: [],
      gegenwartsorientierung_nach: 50,
    };
    setEditedProtocol({
      ...editedProtocol,
      durchgaenge: [...currentDurchgaenge, newDurchgang],
    });
    setExpandedDurchgang(currentDurchgaenge.length);
  };

  // Remove a Durchgang
  const removeDurchgang = (id: string) => {
    const currentDurchgaenge = editedProtocol.durchgaenge || [];
    const filtered = currentDurchgaenge.filter((d) => d.id !== id);
    const renumbered = filtered.map((d, i) => ({ ...d, durchgang_nummer: i + 1 }));
    setEditedProtocol({
      ...editedProtocol,
      durchgaenge: renumbered,
    });
  };

  // Update a Durchgang
  const updateDurchgang = (id: string, field: keyof CIPOSDurchgang, value: unknown) => {
    const currentDurchgaenge = editedProtocol.durchgaenge || [];
    const updated = currentDurchgaenge.map((d) =>
      d.id === id ? { ...d, [field]: value } : d
    );
    setEditedProtocol({
      ...editedProtocol,
      durchgaenge: updated,
    });
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
        durchgaenge: editedProtocol.durchgaenge || [],
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

  // Calculate SUD change
  const sudVorher = editedProtocol.erster_kontakt?.sud_vor_kontakt;
  const sudNachher = editedProtocol.abschlussbewertung?.sud_nach_letztem_durchgang;
  const sudChange = sudVorher !== undefined && sudNachher !== undefined 
    ? sudNachher - sudVorher 
    : null;

  // Test data functions for each section
  const fillTestDataSection2 = () => {
    setEditedProtocol((prev) => ({
      ...prev,
      gegenwartsorientierung_vorher: {
        ...prev.gegenwartsorientierung_vorher,
        prozent_gegenwartsorientierung: getRandomPercentage(40, 75),
        indikatoren_patient: getRandomItem(SAMPLE_CIPOS_INDIKATOREN),
        beobachtungen_therapeut: getRandomItem(SAMPLE_CIPOS_BEOBACHTUNGEN),
      },
    }));
  };

  const fillTestDataSection3 = () => {
    const methoden: CIPOSStimulationMethode[] = ['visuell', 'taktil', 'auditiv', 'kombination'];
    setEditedProtocol((prev) => ({
      ...prev,
      verstaerkung_gegenwart: {
        ...prev.verstaerkung_gegenwart,
        stimulation_methode: getRandomItem(methoden),
        dauer_anzahl_sets: getRandomItem(SAMPLE_CIPOS_DAUER_SETS),
        reaktion_verbesserung: getRandomBoolean(),
        gegenwartsorientierung_nach_stimulation: getRandomPercentage(65, 90),
        kommentar: getRandomItem(SAMPLE_CIPOS_BEOBACHTUNGEN),
      },
    }));
  };

  const fillTestDataSection4 = () => {
    setEditedProtocol((prev) => ({
      ...prev,
      erster_kontakt: {
        ...prev.erster_kontakt,
        zielerinnerung_beschreibung: getRandomItem(SAMPLE_CIPOS_ZIELERINNERUNG),
        sud_vor_kontakt: getRandomSUD(5, 9),
        belastungsdauer_sekunden: getRandomItem(CIPOS_DAUER_OPTIONS),
      },
    }));
  };

  const fillTestDataSection7 = () => {
    setEditedProtocol((prev) => ({
      ...prev,
      abschlussbewertung: {
        ...prev.abschlussbewertung,
        sud_nach_letztem_durchgang: getRandomSUD(1, 5),
        rueckmeldung_erinnerung: getRandomItem(SAMPLE_CIPOS_RUECKMELDUNG_ERINNERUNG),
        rueckmeldung_koerper: getRandomItem(SAMPLE_CIPOS_RUECKMELDUNG_KOERPER),
        subjektive_sicherheit: getRandomPercentage(60, 90),
      },
    }));
  };

  const fillTestDataSection8 = () => {
    setEditedProtocol((prev) => ({
      ...prev,
      nachbesprechung: {
        ...prev.nachbesprechung,
        nachbesprechung_durchgefuehrt: true,
        hinweis_inneres_prozessieren: getRandomBoolean(),
        aufgabe_tagebuch: getRandomItem(SAMPLE_CIPOS_AUFGABE_TAGEBUCH),
        beobachtungen_therapeut: getRandomItem(SAMPLE_CIPOS_BEOBACHTUNGEN),
      },
    }));
  };

  const fillTestDataSection9 = () => {
    const hasProblems = getRandomBoolean();
    const wasEnded = !hasProblems && getRandomBoolean();
    setEditedProtocol((prev) => ({
      ...prev,
      schwierigkeiten: {
        ...prev.schwierigkeiten,
        probleme_reorientierung: hasProblems,
        stabilisierungstechniken: hasProblems ? getRandomItem(SAMPLE_CIPOS_STABILISIERUNG) : '',
        cipos_vorzeitig_beendet: wasEnded,
        cipos_vorzeitig_grund: wasEnded ? 'Patient:in nicht ausreichend stabilisierbar.' : '',
      },
    }));
  };

  const fillTestDataSection10 = () => {
    setEditedProtocol((prev) => ({
      ...prev,
      abschluss_dokumentation: {
        ...prev.abschluss_dokumentation,
        gesamteinschaetzung_therapeut: getRandomItem(SAMPLE_CIPOS_GESAMTEINSCHAETZUNG),
        planung_naechste_sitzung: getRandomItem(SAMPLE_CIPOS_NAECHSTE_SITZUNG),
        signatur_therapeut: `Dr. Muster, ${new Date().toLocaleDateString('de-DE')}`,
      },
    }));
  };

  // Generate a single test durchgang
  const generateTestDurchgang = (nummer: number): CIPOSDurchgang => {
    const reorientierungMethoden: ReorientierungsMethode[] = ['orientierung_raum', 'blickkontakt', 'atemuebung', 'koerperwahrnehmung'];
    const randomMethoden = reorientierungMethoden.filter(() => Math.random() > 0.5);
    if (randomMethoden.length === 0) randomMethoden.push('blickkontakt');
    
    return {
      id: crypto.randomUUID(),
      durchgang_nummer: nummer,
      bereitschaft_patient: nummer > 1 ? true : null,
      zaehl_technik: getRandomBoolean(),
      dauer_sekunden: getRandomItem(CIPOS_DAUER_OPTIONS),
      reorientierung_methoden: randomMethoden,
      gegenwartsorientierung_nach: getRandomPercentage(65, 95),
      stimulation_verstaerkung: nummer === 1 ? getRandomBooleanOrNull() : undefined,
      kommentar: getRandomItem(SAMPLE_CIPOS_BEOBACHTUNGEN),
    };
  };

  // Fill durchgänge with test data
  const fillDurchgaengeWithTestData = (count: number) => {
    const newDurchgaenge = Array.from({ length: count }, (_, i) => generateTestDurchgang(i + 1));
    setEditedProtocol((prev) => ({
      ...prev,
      durchgaenge: newDurchgaenge,
    }));
    setExpandedDurchgang(null);
    setShowDurchgangTestMenu(false);
  };

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDurchgangTestMenu) {
        const target = event.target as HTMLElement;
        if (!target.closest('.durchgang-test-dropdown')) {
          setShowDurchgangTestMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDurchgangTestMenu]);

  return (
    <div className="space-y-6">
      {/* Section 1: Metadata */}
      <MetadataForm
        metadata={editedProtocol}
        onChange={handleMetadataChange}
        errors={errors}
        lockProtocolType={true}
      />

      {/* Section 2: Einschätzung der Gegenwartsorientierung (vor Beginn) */}
      <Card className="mb-6">
        <SectionHeader 
          number={2} 
          title="Einschätzung der Gegenwartsorientierung" 
          subtitle="vor Beginn"
          onTestData={fillTestDataSection2}
        />
        
        <div className="space-y-6">
          <PercentageSlider
            label="Prozentuale Gegenwartsorientierung"
            description={'"Zu wie viel Prozent sind Sie in der Gegenwart?"'}
            value={editedProtocol.gegenwartsorientierung_vorher?.prozent_gegenwartsorientierung || 50}
            onChange={(value) => updateField('gegenwartsorientierung_vorher', 'prozent_gegenwartsorientierung', value)}
            targetValue={70}
          />

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Indikatoren / Woran Patient:in das merkt
            </label>
            <textarea
              value={editedProtocol.gegenwartsorientierung_vorher?.indikatoren_patient || ''}
              onChange={(e) => updateField('gegenwartsorientierung_vorher', 'indikatoren_patient', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[100px]"
              placeholder="Beschreibung der Patient:in..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Beobachtungen der Therapeut:in <span className="text-on-surface/50">(optional)</span>
            </label>
            <textarea
              value={editedProtocol.gegenwartsorientierung_vorher?.beobachtungen_therapeut || ''}
              onChange={(e) => updateField('gegenwartsorientierung_vorher', 'beobachtungen_therapeut', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
              placeholder="Eigene Beobachtungen..."
            />
          </div>
        </div>
      </Card>

      {/* Section 3: Verstärkung der sicheren Gegenwart – Durchführung */}
      <Card className="mb-6">
        <SectionHeader 
          number={3} 
          title="Verstärkung der sicheren Gegenwart" 
          subtitle="Durchführung"
          onTestData={fillTestDataSection3}
        />
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Art der Stimulation
              </label>
              <select
                value={editedProtocol.verstaerkung_gegenwart?.stimulation_methode || 'visuell'}
                onChange={(e) => updateField('verstaerkung_gegenwart', 'stimulation_methode', e.target.value as CIPOSStimulationMethode)}
                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              >
                {CIPOS_STIMULATION_METHODE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            
            {editedProtocol.verstaerkung_gegenwart?.stimulation_methode === 'kombination' && (
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Beschreibung Kombination/Sonstiges
                </label>
                <input
                  type="text"
                  value={editedProtocol.verstaerkung_gegenwart?.stimulation_methode_sonstiges || ''}
                  onChange={(e) => updateField('verstaerkung_gegenwart', 'stimulation_methode_sonstiges', e.target.value)}
                  className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  placeholder="Bitte beschreiben..."
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Dauer / Anzahl kurzer Sets
            </label>
            <input
              type="text"
              value={editedProtocol.verstaerkung_gegenwart?.dauer_anzahl_sets || ''}
              onChange={(e) => updateField('verstaerkung_gegenwart', 'dauer_anzahl_sets', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              placeholder="z.B. 5 kurze Sets à 15 Sekunden"
            />
          </div>

          <YesNoToggle
            label="Reaktion / Verbesserung wahrgenommen?"
            value={editedProtocol.verstaerkung_gegenwart?.reaktion_verbesserung ?? null}
            onChange={(value) => updateField('verstaerkung_gegenwart', 'reaktion_verbesserung', value)}
          />

          <PercentageSlider
            label="Gegenwartsorientierung nach Stimulation"
            description="Ziel: ≥ 70%"
            value={editedProtocol.verstaerkung_gegenwart?.gegenwartsorientierung_nach_stimulation || 50}
            onChange={(value) => updateField('verstaerkung_gegenwart', 'gegenwartsorientierung_nach_stimulation', value)}
            targetValue={70}
          />

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Kommentar / Beobachtungen
            </label>
            <textarea
              value={editedProtocol.verstaerkung_gegenwart?.kommentar || ''}
              onChange={(e) => updateField('verstaerkung_gegenwart', 'kommentar', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
              placeholder="Weitere Beobachtungen..."
            />
          </div>
        </div>
      </Card>

      {/* Section 4: Erster Kontakt mit der belastenden Erinnerung */}
      <Card className="mb-6">
        <SectionHeader 
          number={4} 
          title="Erster Kontakt mit der belastenden Erinnerung"
          onTestData={fillTestDataSection4}
        />
        
        <div className="space-y-6">
          <SubsectionHeader number="4.1" title="Beschreibung der Zielerinnerung / Auslöser" />
          <div>
            <textarea
              value={editedProtocol.erster_kontakt?.zielerinnerung_beschreibung || ''}
              onChange={(e) => updateField('erster_kontakt', 'zielerinnerung_beschreibung', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[100px]"
              placeholder="Kurze Beschreibung der Erinnerung / Trigger / Zukunftsangst..."
            />
          </div>

          <SubsectionHeader number="4.2" title="SUD-Wert vor dem Kontakt" />
          <SUDSlider
            label="SUD vor dem 1. Durchgang"
            value={editedProtocol.erster_kontakt?.sud_vor_kontakt || 5}
            onChange={(value) => updateField('erster_kontakt', 'sud_vor_kontakt', value)}
          />

          <SubsectionHeader number="4.3" title="Festlegung der Belastungsdauer" />
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Gewählte Dauer für den Kontakt (Sekunden)
            </label>
            <select
              value={editedProtocol.erster_kontakt?.belastungsdauer_sekunden || 5}
              onChange={(e) => updateField('erster_kontakt', 'belastungsdauer_sekunden', parseInt(e.target.value))}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
            >
              {CIPOS_DAUER_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec} Sekunden
                </option>
              ))}
            </select>
            <p className="text-xs text-on-surface/50 mt-1">Empfohlen: 3–10 Sekunden</p>
          </div>
        </div>
      </Card>

      {/* Durchgänge (Sections 4.4/5/6) */}
      <Card className="mb-6">
        {/* Header with title and test data dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-sm">
              4-6
            </span>
            <h2 className="text-lg font-bold text-on-surface-strong">Durchgänge (Kontakt & Reorientierung)</h2>
          </div>
          <div className="relative durchgang-test-dropdown">
            <button
              type="button"
              onClick={() => setShowDurchgangTestMenu(!showDurchgangTestMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-secondary hover:text-white bg-brand-secondary/10 hover:bg-brand-secondary rounded-lg transition-colors"
              title="Durchgänge mit Testdaten füllen"
            >
              <SparklesIcon />
              Testdaten einfügen
              <svg className={`w-4 h-4 transition-transform ${showDurchgangTestMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showDurchgangTestMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border-2 border-brand-secondary/30 rounded-lg shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200">
                <div className="p-1">
                  <button
                    onClick={() => fillDurchgaengeWithTestData(5)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                  >
                    5 Durchgänge erstellen
                  </button>
                  <button
                    onClick={() => fillDurchgaengeWithTestData(10)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                  >
                    10 Durchgänge erstellen
                  </button>
                  <button
                    onClick={() => fillDurchgaengeWithTestData(15)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-background text-on-surface text-sm transition-colors"
                  >
                    15 Durchgänge erstellen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {(editedProtocol.durchgaenge || []).length === 0 ? (
            <div className="text-center py-8 text-on-surface/60 bg-surface/50 rounded-lg border-2 border-dashed border-muted">
              <p>Noch keine Durchgänge dokumentiert.</p>
              <p className="text-sm mt-1">Klicken Sie auf "Durchgang hinzufügen" um zu beginnen.</p>
            </div>
          ) : (
            <>
              {(editedProtocol.durchgaenge || []).map((durchgang, index) => {
                const isExpanded = expandedDurchgang === index;
                const durchgangTitel = `Durchgang ${durchgang.durchgang_nummer}`;
                const sectionNum = durchgang.durchgang_nummer === 1 ? '4.4/4.5' : durchgang.durchgang_nummer === 2 ? '5' : `${durchgang.durchgang_nummer + 3}`;
                
                return (
                  <div
                    key={durchgang.id}
                    className={`border-2 rounded-lg transition-colors ${
                      isExpanded ? 'border-green-500/50 bg-surface/30' : 'border-muted/30 bg-background'
                    }`}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer"
                      onClick={() => setExpandedDurchgang(isExpanded ? null : index)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-green-400">{sectionNum}</span>
                        <span className="font-bold text-on-surface">{durchgangTitel}</span>
                        {!isExpanded && durchgang.gegenwartsorientierung_nach !== undefined && (
                          <span className={`text-sm px-2 py-0.5 rounded-full ${
                            durchgang.gegenwartsorientierung_nach >= 70 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            GO: {durchgang.gegenwartsorientierung_nach}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDurchgang(durchgang.id);
                          }}
                          className="p-1 text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Durchgang entfernen"
                        >
                          <TrashIcon />
                        </button>
                        {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      </div>
                    </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 pt-0 space-y-6">
                      {/* Bereitschaft (für Durchgänge 2 und 3) */}
                      {durchgang.durchgang_nummer > 1 && (
                        <>
                          <SubsectionHeader 
                            number={`${durchgang.durchgang_nummer === 2 ? '5.1' : '6.1'}`} 
                            title="Bereitschaft der Patient:in" 
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <YesNoToggle
                              label="Bereit für weiteren Durchgang?"
                              value={durchgang.bereitschaft_patient ?? null}
                              onChange={(value) => updateDurchgang(durchgang.id, 'bereitschaft_patient', value)}
                            />
                            <div>
                              <label className="block text-sm font-medium text-on-surface mb-2">
                                Kommentar zur Bereitschaft
                              </label>
                              <input
                                type="text"
                                value={durchgang.bereitschaft_kommentar || ''}
                                onChange={(e) => updateDurchgang(durchgang.id, 'bereitschaft_kommentar', e.target.value)}
                                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                                placeholder="Optional..."
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Durchführung */}
                      <SubsectionHeader 
                        number={durchgang.durchgang_nummer === 1 ? '4.4' : durchgang.durchgang_nummer === 2 ? '5.2' : '6.2'} 
                        title="Durchführung" 
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <YesNoToggle
                          label="Zähltechnik angewendet?"
                          value={durchgang.zaehl_technik ?? null}
                          onChange={(value) => updateDurchgang(durchgang.id, 'zaehl_technik', value)}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-on-surface mb-2">
                            Dauer (Sekunden)
                          </label>
                          <select
                            value={durchgang.dauer_sekunden}
                            onChange={(e) => updateDurchgang(durchgang.id, 'dauer_sekunden', parseInt(e.target.value))}
                            className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
                          >
                            {CIPOS_DAUER_OPTIONS.map((sec) => (
                              <option key={sec} value={sec}>
                                {sec} Sekunden
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-on-surface mb-3">
                          Reorientierung nach Kontakt (Mehrfachauswahl möglich)
                        </label>
                        <CheckboxGroup<ReorientierungsMethode>
                          options={CIPOS_REORIENTIERUNG_OPTIONS}
                          selected={durchgang.reorientierung_methoden || []}
                          onChange={(selected) => updateDurchgang(durchgang.id, 'reorientierung_methoden', selected)}
                          hasSonstiges={true}
                          sonstigesValue={durchgang.reorientierung_sonstiges || ''}
                          onSonstigesChange={(value) => updateDurchgang(durchgang.id, 'reorientierung_sonstiges', value)}
                        />
                      </div>

                      {/* Gegenwartsorientierung nach Reorientierung */}
                      <SubsectionHeader 
                        number={durchgang.durchgang_nummer === 1 ? '4.5' : durchgang.durchgang_nummer === 2 ? '5.3' : '6.3'} 
                        title="Gegenwartsorientierung nach Reorientierung" 
                      />
                      
                      <PercentageSlider
                        label="Prozentwert"
                        value={durchgang.gegenwartsorientierung_nach}
                        onChange={(value) => updateDurchgang(durchgang.id, 'gegenwartsorientierung_nach', value)}
                        targetValue={70}
                      />

                      {durchgang.durchgang_nummer === 1 && (
                        <YesNoToggle
                          label="Kurze Stimulation zur Verstärkung (5 langsame Sets)?"
                          value={durchgang.stimulation_verstaerkung ?? null}
                          onChange={(value) => updateDurchgang(durchgang.id, 'stimulation_verstaerkung', value)}
                        />
                      )}

                      <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">
                          Kommentar / Beobachtung
                        </label>
                        <textarea
                          value={durchgang.kommentar || ''}
                          onChange={(e) => updateDurchgang(durchgang.id, 'kommentar', e.target.value)}
                          className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
                          placeholder="Weitere Beobachtungen..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </>
          )}

          {/* Add Durchgang button at the bottom */}
          <div className="pt-4">
            <Button onClick={addDurchgang} className="w-full md:w-auto">
              <PlusIcon />
              Durchgang hinzufügen
            </Button>
          </div>
        </div>
      </Card>

      {/* Section 7: Abschlussbewertung */}
      <Card className="mb-6">
        <SectionHeader number={7} title="Abschlussbewertung" onTestData={fillTestDataSection7} />
        
        <div className="space-y-6">
          <SubsectionHeader number="7.1" title="SUD nach dem letzten Durchgang" />
          <SUDSlider
            label="SUD jetzt"
            value={editedProtocol.abschlussbewertung?.sud_nach_letztem_durchgang || 5}
            onChange={(value) => updateField('abschlussbewertung', 'sud_nach_letztem_durchgang', value)}
          />

          <SubsectionHeader number="7.2" title="Veränderungsverlauf" />
          {sudChange !== null && (
            <div className="p-4 bg-surface/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-on-surface">
                  Ausgangs-SUD: <strong>{sudVorher}</strong> → Abschluss-SUD: <strong>{sudNachher}</strong>
                </span>
                <span className={`font-bold text-lg ${
                  sudChange < 0 ? 'text-green-400' : sudChange > 0 ? 'text-red-400' : 'text-on-surface'
                }`}>
                  {sudChange > 0 ? '+' : ''}{sudChange}
                </span>
              </div>
            </div>
          )}

          <SubsectionHeader number="7.3" title="Patient:innen-Rückmeldung" />
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Wie fühlt sich die Erinnerung nun an?
            </label>
            <textarea
              value={editedProtocol.abschlussbewertung?.rueckmeldung_erinnerung || ''}
              onChange={(e) => updateField('abschlussbewertung', 'rueckmeldung_erinnerung', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
              placeholder="Patientenaussage..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Veränderung im Körper?
            </label>
            <textarea
              value={editedProtocol.abschlussbewertung?.rueckmeldung_koerper || ''}
              onChange={(e) => updateField('abschlussbewertung', 'rueckmeldung_koerper', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
              placeholder="Körperwahrnehmung..."
            />
          </div>

          <PercentageSlider
            label="Subjektive Sicherheit jetzt (optional)"
            value={editedProtocol.abschlussbewertung?.subjektive_sicherheit || 50}
            onChange={(value) => updateField('abschlussbewertung', 'subjektive_sicherheit', value)}
          />
        </div>
      </Card>

      {/* Section 8: Nachbesprechung / Abschluss */}
      <Card className="mb-6">
        <SectionHeader number={8} title="Nachbesprechung / Abschluss" onTestData={fillTestDataSection8} />
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <YesNoToggle
              label="Nachbesprechung durchgeführt?"
              value={editedProtocol.nachbesprechung?.nachbesprechung_durchgefuehrt ?? null}
              onChange={(value) => updateField('nachbesprechung', 'nachbesprechung_durchgefuehrt', value)}
            />
            
            <YesNoToggle
              label="Hinweis auf weiteres inneres Prozessieren gegeben?"
              value={editedProtocol.nachbesprechung?.hinweis_inneres_prozessieren ?? null}
              onChange={(value) => updateField('nachbesprechung', 'hinweis_inneres_prozessieren', value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Aufgabe / Empfehlung für Tagebuch
            </label>
            <textarea
              value={editedProtocol.nachbesprechung?.aufgabe_tagebuch || ''}
              onChange={(e) => updateField('nachbesprechung', 'aufgabe_tagebuch', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
              placeholder="Hausaufgaben oder Tagebuchempfehlungen..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Besondere Beobachtungen der Therapeut:in
            </label>
            <textarea
              value={editedProtocol.nachbesprechung?.beobachtungen_therapeut || ''}
              onChange={(e) => updateField('nachbesprechung', 'beobachtungen_therapeut', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
              placeholder="Wichtige klinische Beobachtungen..."
            />
          </div>
        </div>
      </Card>

      {/* Section 9: Falls Schwierigkeiten auftraten */}
      <Card className="mb-6">
        <SectionHeader number={9} title="Falls Schwierigkeiten auftraten" onTestData={fillTestDataSection9} />
        
        <div className="space-y-6">
          <YesNoToggle
            label="Probleme bei der Reorientierung?"
            value={editedProtocol.schwierigkeiten?.probleme_reorientierung ?? null}
            onChange={(value) => updateField('schwierigkeiten', 'probleme_reorientierung', value)}
          />

          {editedProtocol.schwierigkeiten?.probleme_reorientierung && (
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Erforderliche zusätzliche Stabilisierungstechniken
              </label>
              <textarea
                value={editedProtocol.schwierigkeiten?.stabilisierungstechniken || ''}
                onChange={(e) => updateField('schwierigkeiten', 'stabilisierungstechniken', e.target.value)}
                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
                placeholder="Welche Techniken wurden angewendet..."
              />
            </div>
          )}

          <YesNoToggle
            label="CIPOS vorzeitig beendet?"
            value={editedProtocol.schwierigkeiten?.cipos_vorzeitig_beendet ?? null}
            onChange={(value) => updateField('schwierigkeiten', 'cipos_vorzeitig_beendet', value)}
          />

          {editedProtocol.schwierigkeiten?.cipos_vorzeitig_beendet && (
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Grund für vorzeitige Beendigung
              </label>
              <textarea
                value={editedProtocol.schwierigkeiten?.cipos_vorzeitig_grund || ''}
                onChange={(e) => updateField('schwierigkeiten', 'cipos_vorzeitig_grund', e.target.value)}
                className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
                placeholder="Warum wurde CIPOS vorzeitig beendet..."
              />
            </div>
          )}
        </div>
      </Card>

      {/* Section 10: Abschluss der Dokumentation */}
      <Card className="mb-6">
        <SectionHeader number={10} title="Abschluss der Dokumentation" onTestData={fillTestDataSection10} />
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Gesamteinschätzung der Therapeut:in
            </label>
            <textarea
              value={editedProtocol.abschluss_dokumentation?.gesamteinschaetzung_therapeut || ''}
              onChange={(e) => updateField('abschluss_dokumentation', 'gesamteinschaetzung_therapeut', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[100px]"
              placeholder="Zusammenfassende Einschätzung des Verlaufs..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Planung für nächste Sitzung
            </label>
            <textarea
              value={editedProtocol.abschluss_dokumentation?.planung_naechste_sitzung || ''}
              onChange={(e) => updateField('abschluss_dokumentation', 'planung_naechste_sitzung', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]"
              placeholder="Geplante nächste Schritte..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Signatur / Name der Therapeut:in
            </label>
            <input
              type="text"
              value={editedProtocol.abschluss_dokumentation?.signatur_therapeut || ''}
              onChange={(e) => updateField('abschluss_dokumentation', 'signatur_therapeut', e.target.value)}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              placeholder="Name der Therapeut:in"
            />
          </div>
        </div>
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

