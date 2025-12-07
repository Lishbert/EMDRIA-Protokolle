import type { 
  ProtocolType, 
  Speed, 
  IndikationOption, 
  KoerperlokalisationOption, 
  KoerperempfindungQualitaet,
  StimulationTyp,
  SetGeschwindigkeit,
  CIPOSStimulationMethode,
  ReorientierungsMethode,
  OrtTyp,
  SichererOrtStimulationTyp,
  BLSReaktion,
  SubjektiverZustand,
  EignungEinschaetzung
} from './types';

// Storage keys
export const STORAGE_KEY_PREFIX = 'emdr_protocol_';
export const PROTOCOLS_LIST_KEY = 'emdr_protocols_list';

// Protocol types
export const PROTOCOL_TYPES: ProtocolType[] = [
  'Reprozessieren',
  'IRI',
  'CIPOS',
  'Sicherer Ort'
];

// Speed options
export const SPEED_OPTIONS: Speed[] = ['langsam', 'schnell'];

// Protocol type colors
export const PROTOCOL_TYPE_COLORS: Record<ProtocolType, string> = {
  'Reprozessieren': 'from-blue-500 to-blue-600',
  'IRI': 'from-purple-500 to-purple-600',
  'CIPOS': 'from-green-500 to-green-600',
  'Sicherer Ort': 'from-yellow-500 to-yellow-600'
};

// Protocol type border colors
export const PROTOCOL_TYPE_BORDER_COLORS: Record<ProtocolType, string> = {
  'Reprozessieren': 'border-blue-500',
  'IRI': 'border-purple-500',
  'CIPOS': 'border-green-500',
  'Sicherer Ort': 'border-yellow-500'
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

// CIPOS Reorientierung methods - Evidenzbasierte Techniken
export const CIPOS_REORIENTIERUNG_OPTIONS: { value: ReorientierungsMethode; label: string }[] = [
  // Kognitive Orientierung
  { value: 'gegenstaende_benennen', label: 'Gegenstände im Raum benennen' },
  { value: 'orientierung_raum', label: 'Orientierung: "Wo bin ich? Welcher Tag ist heute?"' },
  { value: 'rueckwaerts_rechnen', label: 'Rückwärts rechnen (1000–7–7–…)' },
  
  // 5-4-3-2-1 Grounding-Technik
  { value: 'fuenf_vier_drei_zwei_eins', label: '5-4-3-2-1 Technik (5 Dinge sehen, 4 hören, 3 fühlen…)' },
  
  // Sensorische/Körperorientierte Techniken
  { value: 'blickkontakt', label: 'Blickkontakt mit Therapeut:in halten' },
  { value: 'atemuebung', label: 'Atemübung (z.B. verlängertes Ausatmen, 4-7-8)' },
  { value: 'koerperwahrnehmung', label: 'Körperwahrnehmung (Hände auf Oberschenkel)' },
  { value: 'fuesse_boden', label: 'Füße fest auf den Boden drücken / Erdung' },
  { value: 'selbstberuehrung', label: 'Selbstberührung (Arme um sich selbst, Butterfly-Hug)' },
  
  // Externe Stimuli
  { value: 'sensorische_uebungen', label: 'Ball zuwerfen / sensorische Übungen' },
  { value: 'kaltes_wasser', label: 'Kaltes Wasser / Eiswürfel in den Händen' },
  { value: 'starke_sinnesreize', label: 'Starke Sinnesreize (Duft, Geschmack, Textur)' },
  
  // Bewegung & Stimulation
  { value: 'bewegung_aufstehen', label: 'Bewegung / Aufstehen / Im Raum umhergehen' },
  { value: 'bilaterale_stimulation', label: 'Kurze bilaterale Stimulation zur Stabilisierung' },
  
  // Imagination
  { value: 'safe_place', label: 'Kurze Safe-Place Imagination' },
  
  // Sonstiges
  { value: 'sonstiges', label: 'Sonstiges (bitte unten beschreiben)' },
];

// Default duration options for CIPOS (3-10 seconds)
export const CIPOS_DAUER_OPTIONS = [3, 4, 5, 6, 7, 8, 9, 10];

// =============================================================
// Sicherer Ort Protocol Constants
// =============================================================

// Ort Typ options
export const SICHERER_ORT_TYP_OPTIONS: { value: OrtTyp; label: string; hinweis?: string }[] = [
  { value: 'fantasieort', label: 'Fantasieort' },
  { value: 'realer_vergangenheit', label: 'Realer Ort aus der Vergangenheit' },
  { value: 'realer_gegenwart', label: 'Realer Ort aus der Gegenwart', hinweis: 'Kritisch → ggf. Alternativen gesucht' },
];

// Stimulation Art options
export const SICHERER_ORT_STIMULATION_OPTIONS: { value: SichererOrtStimulationTyp; label: string }[] = [
  { value: 'augenbewegungen', label: 'Augenbewegungen' },
  { value: 'taps', label: 'Taps' },
  { value: 'auditiv', label: 'Auditiv' },
  { value: 'anderes', label: 'Anderes' },
];

// BLS Reaktion options
export const BLS_REAKTION_OPTIONS: { value: BLSReaktion; label: string }[] = [
  { value: 'positiv', label: 'Positive Veränderung' },
  { value: 'keine', label: 'Keine Veränderung' },
  { value: 'negativ', label: 'Negative Veränderung' },
];

// Subjektiver Zustand options
export const SUBJEKTIVER_ZUSTAND_OPTIONS: { value: SubjektiverZustand; label: string }[] = [
  { value: 'ruhiger', label: 'Ruhiger' },
  { value: 'verbundener', label: 'Verbundener' },
  { value: 'stabiler', label: 'Stabiler' },
  { value: 'unveraendert', label: 'Unverändert' },
  { value: 'dysreguliert', label: 'Dysreguliert' },
];

// Eignung Einschätzung options
export const EIGNUNG_EINSCHAETZUNG_OPTIONS: { value: EignungEinschaetzung; label: string }[] = [
  { value: 'geeignet', label: 'Geeignet' },
  { value: 'bedingt_geeignet', label: 'Bedingt geeignet' },
  { value: 'nicht_geeignet', label: 'Nicht geeignet' },
  { value: 'weiter_explorieren', label: 'Weiter explorieren' },
];
