import type { 
  ProtocolType, 
  Speed, 
  IndikationOption, 
  KoerperlokalisationOption, 
  KoerperempfindungQualitaet,
  StimulationTyp,
  SetGeschwindigkeit,
  CIPOSStimulationMethode,
  ReorientierungsMethode
} from './types';

// Storage keys
export const STORAGE_KEY_PREFIX = 'emdr_protocol_';
export const PROTOCOLS_LIST_KEY = 'emdr_protocols_list';

// Protocol types
export const PROTOCOL_TYPES: ProtocolType[] = [
  'Reprozessieren',
  'IRI',
  'CIPOS',
  'Sicherer Ort',
  'Custom'
];

// Speed options
export const SPEED_OPTIONS: Speed[] = ['langsam', 'schnell'];

// Protocol type colors
export const PROTOCOL_TYPE_COLORS: Record<ProtocolType, string> = {
  'Reprozessieren': 'from-blue-500 to-blue-600',
  'IRI': 'from-purple-500 to-purple-600',
  'CIPOS': 'from-green-500 to-green-600',
  'Sicherer Ort': 'from-yellow-500 to-yellow-600',
  'Custom': 'from-gray-500 to-gray-600'
};

// Protocol type border colors
export const PROTOCOL_TYPE_BORDER_COLORS: Record<ProtocolType, string> = {
  'Reprozessieren': 'border-blue-500',
  'IRI': 'border-purple-500',
  'CIPOS': 'border-green-500',
  'Sicherer Ort': 'border-yellow-500',
  'Custom': 'border-gray-500'
};

// Default values
export const DEFAULT_PROTOCOL_TYPE: ProtocolType = 'Reprozessieren';
export const DEFAULT_SPEED: Speed = 'schnell';
export const DEFAULT_ANZAHL_BEWEGUNGEN = 24;

// =============================================================
// IRI Protocol Constants
// =============================================================

// Section 2: Indikation options with labels
export const INDIKATION_OPTIONS: { value: IndikationOption; label: string }[] = [
  { value: 'bindungsdefizite', label: 'Bindungsdefizite' },
  { value: 'schwierigkeiten_ressourcen', label: 'Schwierigkeiten, mit Ressourcen in Kontakt zu kommen' },
  { value: 'wenig_ressourcen', label: 'Wenig Ressourcen verfügbar' },
  { value: 'erhoehte_anspannung', label: 'Erhöhte Anspannung / Instabilität' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

// Section 4: Körperlokalisation options with labels
export const KOERPERLOKALISATION_OPTIONS: { value: KoerperlokalisationOption; label: string }[] = [
  { value: 'kopf', label: 'Kopf' },
  { value: 'hals_nacken', label: 'Hals/Nacken' },
  { value: 'brustkorb', label: 'Brustkorb' },
  { value: 'bauch', label: 'Bauch' },
  { value: 'ruecken', label: 'Rücken' },
  { value: 'arme_haende', label: 'Arme/Hände' },
  { value: 'beine_fuesse', label: 'Beine/Füße' },
  { value: 'ganzkoerper', label: 'Ganzkörper' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

// Section 4: Körperempfindung quality options with labels
export const KOERPEREMPFINDUNG_OPTIONS: { value: KoerperempfindungQualitaet; label: string }[] = [
  { value: 'warm', label: 'Warm' },
  { value: 'weit', label: 'Weit' },
  { value: 'leicht', label: 'Leicht' },
  { value: 'ruhig', label: 'Ruhig' },
  { value: 'kraftvoll', label: 'Kraftvoll' },
  { value: 'lebendig', label: 'Lebendig' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

// Section 6: Stimulation type options with labels
export const STIMULATION_TYP_OPTIONS: { value: StimulationTyp; label: string }[] = [
  { value: 'visuell', label: 'Visuell (Augen folgen Fingerbewegung)' },
  { value: 'taktil', label: 'Taktil (Taps)' },
  { value: 'auditiv', label: 'Auditiv (Töne)' },
  { value: 'kombination', label: 'Kombination / Sonstiges' },
];

// Section 6: Set geschwindigkeit options with labels
export const SET_GESCHWINDIGKEIT_OPTIONS: { value: SetGeschwindigkeit; label: string }[] = [
  { value: 'langsam', label: 'Langsam' },
  { value: 'mittel', label: 'Mittel' },
  { value: 'eher_schnell', label: 'Eher schnell' },
];

// =============================================================
// CIPOS Protocol Constants
// =============================================================

// CIPOS Stimulation methods
export const CIPOS_STIMULATION_METHODE_OPTIONS: { value: CIPOSStimulationMethode; label: string }[] = [
  { value: 'visuell', label: 'Visuell (langsame Augenbewegungen)' },
  { value: 'taktil', label: 'Taktil (langsame Taps)' },
  { value: 'auditiv', label: 'Auditiv (langsame Töne)' },
  { value: 'kombination', label: 'Kombination / Sonstiges' },
];

// CIPOS Reorientierung methods
export const CIPOS_REORIENTIERUNG_OPTIONS: { value: ReorientierungsMethode; label: string }[] = [
  { value: 'gegenstaende_benennen', label: 'Gegenstände im Raum benennen' },
  { value: 'rueckwaerts_rechnen', label: 'Rückwärts rechnen (1000–7–7–…)' },
  { value: 'sensorische_uebungen', label: 'Ball zuwerfen / sensorische Übungen' },
  { value: 'sonstiges', label: 'Sonstiges' },
];

// Default duration options for CIPOS (3-10 seconds)
export const CIPOS_DAUER_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10];
