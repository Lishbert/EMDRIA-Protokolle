import React, { useState, useEffect } from 'react';
import { Button, Card } from './ui';
import { SaveIcon, XMarkIcon, PrinterIcon } from './icons';
import { MetadataForm } from './MetadataForm';
import { ChannelEditor } from './ChannelEditor';
import { IRIProtocolEditor } from './IRIProtocolEditor';
import { CIPOSProtocolEditor } from './CIPOSProtocolEditor';
import { SichererOrtProtocolEditor } from './SichererOrtProtocolEditor';
import type { Protocol, StandardProtocol, IRIProtocol, CIPOSProtocol, SichererOrtProtocol, ProtocolType, StartKnoten, isIRIProtocol, isStandardProtocol, isCIPOSProtocol, isSichererOrtProtocol } from '../types';
import { saveProtocol } from '../utils/storage';
import { exportProtocolAsPDF } from '../utils/export';
import { DEFAULT_PROTOCOL_TYPE } from '../constants';
import { getRandomStartKnoten, getRandomChannelItem, getRandomChiffre, getRandomDate, getRandomProtocolNumber } from '../utils/testData';

interface ProtocolEditorProps {
  protocol: Protocol | null;
  onSave: () => void;
  onCancel: () => void;
}

// Check if a protocol is IRI type
function checkIsIRI(protocol: Protocol | Partial<Protocol> | null): boolean {
  return protocol?.protocolType === 'IRI';
}

// Check if a protocol is CIPOS type
function checkIsCIPOS(protocol: Protocol | Partial<Protocol> | null): boolean {
  return protocol?.protocolType === 'CIPOS';
}

// Check if a protocol is Sicherer Ort type
function checkIsSichererOrt(protocol: Protocol | Partial<Protocol> | null): boolean {
  return protocol?.protocolType === 'Sicherer Ort';
}

export const ProtocolEditor: React.FC<ProtocolEditorProps> = ({ protocol, onSave, onCancel }) => {
  // If it's an IRI protocol, use the IRI editor
  if (protocol && checkIsIRI(protocol)) {
    return (
      <IRIProtocolEditor
        protocol={protocol as IRIProtocol}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  // If it's a CIPOS protocol, use the CIPOS editor
  if (protocol && checkIsCIPOS(protocol)) {
    return (
      <CIPOSProtocolEditor
        protocol={protocol as CIPOSProtocol}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  // If it's a Sicherer Ort protocol, use the Sicherer Ort editor
  if (protocol && checkIsSichererOrt(protocol)) {
    return (
      <SichererOrtProtocolEditor
        protocol={protocol as SichererOrtProtocol}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  // For new protocols or standard protocols, use the standard editor
  return (
    <StandardProtocolEditor
      protocol={protocol as StandardProtocol | null}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
};

// Standard Protocol Editor (for non-IRI protocols)
interface StandardProtocolEditorProps {
  protocol: StandardProtocol | null;
  onSave: () => void;
  onCancel: () => void;
}

export const StandardProtocolEditor: React.FC<StandardProtocolEditorProps> = ({ protocol, onSave, onCancel }) => {
  const [editedProtocol, setEditedProtocol] = useState<Partial<StandardProtocol>>({});
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
        startKnoten: {
          bildSensorischeErinnerung: '',
          negativeKognition: '',
          positiveKognition: '',
          voc: 1,
          gefuehl: '',
          sud: 0,
          koerpersensation: '',
        },
        channel: [],
        createdAt: Date.now(),
        lastModified: Date.now(),
      });
    }
    setErrors({});
    setSaveStatus('idle');
  }, [protocol]);

  // If user changes protocol type to IRI, we need to switch to IRI editor
  // This is handled by the parent routing logic

  const handleMetadataChange = (metadata: Partial<StandardProtocol>) => {
    // If switching to IRI, we need to redirect
    if (metadata.protocolType === 'IRI' && editedProtocol.protocolType !== 'IRI') {
      // Create a new IRI protocol with the same metadata
      const iriProtocol: Partial<IRIProtocol> = {
        id: editedProtocol.id || crypto.randomUUID(),
        chiffre: metadata.chiffre || editedProtocol.chiffre || '',
        datum: metadata.datum || editedProtocol.datum || new Date().toISOString().split('T')[0],
        protokollnummer: metadata.protokollnummer || editedProtocol.protokollnummer || '',
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
          stimulation_typ: 'visuell',
          sets: [],
        },
        ressourcen_einschaetzung: {},
        abschluss: {
          einwilligung_dokumentation: false,
        },
      };
      // Save the partial protocol and trigger refresh
      setEditedProtocol(iriProtocol as unknown as Partial<StandardProtocol>);
      return;
    }

    // If switching to CIPOS, we need to redirect
    if (metadata.protocolType === 'CIPOS' && editedProtocol.protocolType !== 'CIPOS') {
      // Create a new CIPOS protocol with the same metadata
      const ciposProtocol: Partial<CIPOSProtocol> = {
        id: editedProtocol.id || crypto.randomUUID(),
        chiffre: metadata.chiffre || editedProtocol.chiffre || '',
        datum: metadata.datum || editedProtocol.datum || new Date().toISOString().split('T')[0],
        protokollnummer: metadata.protokollnummer || editedProtocol.protokollnummer || '',
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
      // Save the partial protocol and trigger refresh
      setEditedProtocol(ciposProtocol as unknown as Partial<StandardProtocol>);
      return;
    }

    // If switching to Sicherer Ort, we need to redirect
    if (metadata.protocolType === 'Sicherer Ort' && editedProtocol.protocolType !== 'Sicherer Ort') {
      // Create a new Sicherer Ort protocol with the same metadata
      const sichererOrtProtocol: Partial<SichererOrtProtocol> = {
        id: editedProtocol.id || crypto.randomUUID(),
        chiffre: metadata.chiffre || editedProtocol.chiffre || '',
        datum: metadata.datum || editedProtocol.datum || new Date().toISOString().split('T')[0],
        protokollnummer: metadata.protokollnummer || editedProtocol.protokollnummer || '',
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
      // Save the partial protocol and trigger refresh
      setEditedProtocol(sichererOrtProtocol as unknown as Partial<StandardProtocol>);
      return;
    }

    setEditedProtocol({
      ...editedProtocol,
      ...metadata,
    });
  };

  const handleStartKnotenChange = (field: keyof StartKnoten, value: string | number) => {
    setEditedProtocol({
      ...editedProtocol,
      startKnoten: {
        ...editedProtocol.startKnoten,
        [field]: value,
      } as StartKnoten,
    });
  };

  const handleChannelChange = (channel: StandardProtocol['channel']) => {
    setEditedProtocol({
      ...editedProtocol,
      channel,
    });
  };

  // Get human-readable list of missing fields
  const getMissingFields = (): string[] => {
    const missing: string[] = [];

    if (!editedProtocol.chiffre?.trim()) missing.push('Patient:innen-Chiffre');
    if (!editedProtocol.datum) missing.push('Datum');
    if (!editedProtocol.protokollnummer?.trim()) missing.push('Protokollnummer');
    if (!editedProtocol.protocolType) missing.push('Protokolltyp');
    
    // Check StartKnoten fields
    const sk = editedProtocol.startKnoten;
    if (!sk?.bildSensorischeErinnerung?.trim()) missing.push('Bild / sensorische Erinnerung');
    if (!sk?.negativeKognition?.trim()) missing.push('Negative Kognition');
    if (!sk?.positiveKognition?.trim()) missing.push('Positive Kognition');
    if (!sk?.gefuehl?.trim()) missing.push('Gefühl');
    if (!sk?.koerpersensation?.trim()) missing.push('Körpersensation');
    
    if (!editedProtocol.channel || editedProtocol.channel.length === 0) {
      missing.push('Mindestens ein Stimulation-Fragment-Paar');
    } else {
      editedProtocol.channel.forEach((item, index) => {
        if (!item.stimulation.anzahlBewegungen || item.stimulation.anzahlBewegungen <= 0) {
          missing.push(`Kanal ${index + 1}: Anzahl Bewegungen`);
        }
        if (!item.fragment.text.trim()) {
          missing.push(`Kanal ${index + 1}: Fragment-Text`);
        }
      });
    }

    return missing;
  };

  const validateProtocol = (): boolean => {
    const newErrors: { [key: string]: boolean } = {};

    if (!editedProtocol.chiffre?.trim()) newErrors.chiffre = true;
    if (!editedProtocol.datum) newErrors.datum = true;
    if (!editedProtocol.protokollnummer?.trim()) newErrors.protokollnummer = true;
    if (!editedProtocol.protocolType) newErrors.protocolType = true;
    
    // Validate StartKnoten fields
    const sk = editedProtocol.startKnoten;
    if (!sk?.bildSensorischeErinnerung?.trim()) newErrors.bildSensorischeErinnerung = true;
    if (!sk?.negativeKognition?.trim()) newErrors.negativeKognition = true;
    if (!sk?.positiveKognition?.trim()) newErrors.positiveKognition = true;
    if (!sk?.gefuehl?.trim()) newErrors.gefuehl = true;
    if (!sk?.koerpersensation?.trim()) newErrors.koerpersensation = true;
    
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

  const missingFields = getMissingFields();

  const handleSave = async () => {
    // Check if this is actually an IRI protocol that needs special handling
    if (editedProtocol.protocolType === 'IRI') {
      await saveProtocol(editedProtocol as unknown as Protocol);
      setSaveStatus('saved');
      setTimeout(() => {
        onSave();
      }, 500);
      return;
    }

    if (!validateProtocol()) {
      setSaveStatus('error');
      return;
    }

    try {
      setSaveStatus('saving');

      const protocolToSave: StandardProtocol = {
        id: editedProtocol.id!,
        chiffre: editedProtocol.chiffre!,
        datum: editedProtocol.datum!,
        protokollnummer: editedProtocol.protokollnummer!,
        protocolType: editedProtocol.protocolType as ProtocolType,
        startKnoten: editedProtocol.startKnoten as StartKnoten,
        channel: editedProtocol.channel!,
        createdAt: editedProtocol.createdAt || Date.now(),
        lastModified: Date.now(),
      };

      await saveProtocol(protocolToSave);
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
      const protocolToExport = editedProtocol as StandardProtocol;
      exportProtocolAsPDF(protocolToExport);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Fehler beim Erstellen der PDF.');
    }
  };

  const hasUnsavedChanges = saveStatus !== 'saved';

  const handleFillAllTestData = () => {
    // Generate 3-6 channel items
    const numItems = Math.floor(Math.random() * 4) + 3;
    const channel = Array.from({ length: numItems }, () => getRandomChannelItem());
    
    // Generate structured StartKnoten test data
    const startKnoten: StartKnoten = {
      bildSensorischeErinnerung: getRandomStartKnoten(),
      negativeKognition: ['Ich bin nicht sicher', 'Ich bin wertlos', 'Ich bin machtlos', 'Ich bin schuld', 'Ich bin nicht gut genug'][Math.floor(Math.random() * 5)],
      positiveKognition: ['Ich bin sicher', 'Ich bin wertvoll', 'Ich habe Kontrolle', 'Ich habe mein Bestes getan', 'Ich bin gut genug'][Math.floor(Math.random() * 5)],
      voc: Math.floor(Math.random() * 4) + 1, // 1-4 (initially low)
      gefuehl: ['Angst', 'Trauer', 'Scham', 'Hilflosigkeit', 'Wut', 'Schuld', 'Ohnmacht'][Math.floor(Math.random() * 7)],
      sud: Math.floor(Math.random() * 5) + 5, // 5-9 (initially high)
      koerpersensation: ['Enge in der Brust', 'Druck im Magen', 'Spannung im Nacken', 'Kloß im Hals', 'Schwere in den Beinen', 'Zittern in den Händen', 'Herzrasen'][Math.floor(Math.random() * 7)],
    };
    
    setEditedProtocol({
      ...editedProtocol,
      chiffre: getRandomChiffre(),
      datum: getRandomDate(),
      protokollnummer: getRandomProtocolNumber(),
      startKnoten,
      channel,
    });
  };

  // If the current protocol has switched to IRI type, render IRI editor
  if (editedProtocol.protocolType === 'IRI') {
    return (
      <IRIProtocolEditor
        protocol={editedProtocol as unknown as IRIProtocol}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  // If the current protocol has switched to CIPOS type, render CIPOS editor
  if (editedProtocol.protocolType === 'CIPOS') {
    return (
      <CIPOSProtocolEditor
        protocol={editedProtocol as unknown as CIPOSProtocol}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  // If the current protocol has switched to Sicherer Ort type, render Sicherer Ort editor
  if (editedProtocol.protocolType === 'Sicherer Ort') {
    return (
      <SichererOrtProtocolEditor
        protocol={editedProtocol as unknown as SichererOrtProtocol}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Metadata Section */}
      <MetadataForm
        metadata={editedProtocol}
        onChange={handleMetadataChange}
        errors={errors}
        onFillAllTestData={handleFillAllTestData}
      />

      {/* Startknoten Section */}
      <Card className="mb-6">
        <h2 className="text-lg font-bold text-on-surface-strong mb-4">Startknoten</h2>
        <div className="space-y-4">
          {/* Bild / sensorische Erinnerung */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Bild / sensorische Erinnerung *
            </label>
            <textarea
              value={editedProtocol.startKnoten?.bildSensorischeErinnerung || ''}
              onChange={(e) => handleStartKnotenChange('bildSensorischeErinnerung', e.target.value)}
              className={`w-full bg-background text-on-surface border ${
                errors.bildSensorischeErinnerung ? 'border-red-500' : 'border-muted'
              } rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[80px]`}
              placeholder="Welches Bild oder welche sensorische Erinnerung taucht auf?"
            />
            {errors.bildSensorischeErinnerung && (
              <p className="text-red-500 text-xs mt-1">Bild / sensorische Erinnerung ist erforderlich</p>
            )}
          </div>

          {/* Negative Kognition */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Negative Kognition *
            </label>
            <input
              type="text"
              value={editedProtocol.startKnoten?.negativeKognition || ''}
              onChange={(e) => handleStartKnotenChange('negativeKognition', e.target.value)}
              className={`w-full bg-background text-on-surface border ${
                errors.negativeKognition ? 'border-red-500' : 'border-muted'
              } rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none`}
              placeholder="z.B. 'Ich bin nicht sicher' oder 'Ich bin wertlos'"
            />
            {errors.negativeKognition && (
              <p className="text-red-500 text-xs mt-1">Negative Kognition ist erforderlich</p>
            )}
          </div>

          {/* Positive Kognition */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Positive Kognition *
            </label>
            <input
              type="text"
              value={editedProtocol.startKnoten?.positiveKognition || ''}
              onChange={(e) => handleStartKnotenChange('positiveKognition', e.target.value)}
              className={`w-full bg-background text-on-surface border ${
                errors.positiveKognition ? 'border-red-500' : 'border-muted'
              } rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none`}
              placeholder="z.B. 'Ich bin sicher' oder 'Ich bin wertvoll'"
            />
            {errors.positiveKognition && (
              <p className="text-red-500 text-xs mt-1">Positive Kognition ist erforderlich</p>
            )}
          </div>

          {/* VoC (1-7) */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              VoC (Validity of Cognition)
              <span className="text-xs text-on-surface/60 ml-2">
                1 = überhaupt nicht zutreffend, 7 = vollständig zutreffend
              </span>
            </label>
            <select
              value={editedProtocol.startKnoten?.voc ?? 1}
              onChange={(e) => handleStartKnotenChange('voc', parseInt(e.target.value))}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
            >
              <option value={1}>1 - Überhaupt nicht zutreffend</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7 - Vollständig zutreffend</option>
            </select>
          </div>

          {/* Gefühl */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Gefühl *
            </label>
            <input
              type="text"
              value={editedProtocol.startKnoten?.gefuehl || ''}
              onChange={(e) => handleStartKnotenChange('gefuehl', e.target.value)}
              className={`w-full bg-background text-on-surface border ${
                errors.gefuehl ? 'border-red-500' : 'border-muted'
              } rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none`}
              placeholder="z.B. Angst, Trauer, Scham, Hilflosigkeit..."
            />
            {errors.gefuehl && (
              <p className="text-red-500 text-xs mt-1">Gefühl ist erforderlich</p>
            )}
          </div>

          {/* SUD (0-10) */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              SUD (Subjective Units of Disturbance)
              <span className="text-xs text-on-surface/60 ml-2">
                0 = neutral, 10 = maximal vorstellbare Belastung
              </span>
            </label>
            <select
              value={editedProtocol.startKnoten?.sud ?? 0}
              onChange={(e) => handleStartKnotenChange('sud', parseInt(e.target.value))}
              className="w-full bg-background text-on-surface border border-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
            >
              <option value={0}>0 - Neutral / keine Belastung</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5 - Mittlere Belastung</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
              <option value={9}>9</option>
              <option value={10}>10 - Maximale Belastung</option>
            </select>
          </div>

          {/* Körpersensation */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Körpersensation *
            </label>
            <textarea
              value={editedProtocol.startKnoten?.koerpersensation || ''}
              onChange={(e) => handleStartKnotenChange('koerpersensation', e.target.value)}
              className={`w-full bg-background text-on-surface border ${
                errors.koerpersensation ? 'border-red-500' : 'border-muted'
              } rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none resize-y min-h-[60px]`}
              placeholder="Wo im Körper spüren Sie die Belastung? Wie fühlt es sich an?"
            />
            {errors.koerpersensation && (
              <p className="text-red-500 text-xs mt-1">Körpersensation ist erforderlich</p>
            )}
          </div>
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
                Fehlende Pflichtfelder ({missingFields.length})
              </h3>
              <ul className="text-amber-300/90 text-sm space-y-1">
                {missingFields.map((field, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
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
              <Button onClick={handleExportPDF} variant="primary" disabled={hasUnsavedChanges}>
                <PrinterIcon />
                PDF Export
              </Button>
            </div>
          )}
        </div>

        {saveStatus === 'error' && missingFields.length > 0 && (
          <p className="text-red-500 text-sm mt-3">
            Fehler beim Speichern. Bitte füllen Sie alle oben aufgelisteten Pflichtfelder aus.
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
