export type ProtocolType = 'Reprozessieren' | 'IRI' | 'CIPOS' | 'Sicherer Ort' | 'Custom';
export type Speed = 'langsam' | 'schnell';

export interface ProtocolMetadata {
  id: string;
  chiffre: string;  // Patient cipher
  datum: string;    // Date (ISO format)
  protokollnummer: string;
  protocolType: ProtocolType;
  createdAt: number;
  lastModified: number;
}

// =============================================================
// Standard Protocol Types (Reprozessieren, CIPOS, etc.)
// =============================================================

export interface Stimulation {
  id: string;
  anzahlBewegungen: number;
  geschwindigkeit: Speed;
}

export interface Fragment {
  id: string;
  text: string;  // Fragment description
  einwebung?: string;  // Optional weaving/interweaving
  notizen?: string;
}

export interface ChannelItem {
  id: string;
  stimulation: Stimulation;
  fragment: Fragment;
}

export interface StandardProtocol extends ProtocolMetadata {
  startKnoten: string;  // Starting node description
  channel: ChannelItem[];  // Array of stimulation-fragment pairs
}

// =============================================================
// IRI Protocol Types
// =============================================================

// Section 2: Indikation / Ausgangslage
export type IndikationOption = 
  | 'bindungsdefizite'
  | 'schwierigkeiten_ressourcen'
  | 'wenig_ressourcen'
  | 'erhoehte_anspannung'
  | 'sonstiges';

export interface IRIIndikation {
  indikation_checklist: IndikationOption[];
  indikation_sonstiges?: string;
  ausgangszustand_beschreibung: string;
  ziel_der_iri: string;
}

// Section 3: Auslöser der Ressource / positiver Moment
export interface IRIPositiverMoment {
  positiver_moment_beschreibung: string;
  kontext_positiver_moment: string;
  wahrgenommene_positive_veraenderung: string;
  veraenderung_mimik?: string;
  veraenderung_verbale_ausdrucksweise?: string;
  veraenderung_koerperhaltung?: string;
}

// Section 4: Körperwahrnehmung
export type KoerperlokalisationOption = 
  | 'kopf'
  | 'hals_nacken'
  | 'brustkorb'
  | 'bauch'
  | 'ruecken'
  | 'arme_haende'
  | 'beine_fuesse'
  | 'ganzkoerper'
  | 'sonstiges';

export type KoerperempfindungQualitaet = 
  | 'warm'
  | 'weit'
  | 'leicht'
  | 'ruhig'
  | 'kraftvoll'
  | 'lebendig'
  | 'sonstiges';

export interface IRIKoerperwahrnehmung {
  koerperwahrnehmung_rohtext: string;
  koerperlokalisation: KoerperlokalisationOption[];
  koerperlokalisation_sonstiges?: string;
  qualitaet_koerperempfindung: KoerperempfindungQualitaet[];
  qualitaet_sonstiges?: string;
}

// Section 6: Bilaterale Stimulation
export type StimulationTyp = 
  | 'visuell'
  | 'taktil'
  | 'auditiv'
  | 'kombination';

export type SetGeschwindigkeit = 'langsam' | 'mittel' | 'eher_schnell';

export interface IRIStimulationSet {
  id: string;
  set_nummer: number;
  set_dauer?: string;
  set_geschwindigkeit: SetGeschwindigkeit;
  set_anzahl_durchgaenge?: number;
  instruktion_text?: string;
  subjektive_wahrnehmung_nach_set?: string;
  lope_nach_set?: number;
}

export interface IRIBilateraleStimulation {
  stimulation_typ: StimulationTyp;
  stimulation_typ_sonstiges?: string;
  stimulation_bemerkungen_allgemein?: string;
  sets: IRIStimulationSet[];
}

// Section 8: Einschätzung der Ressource & Integration
export interface IRIRessourcenEinschaetzung {
  ressource_spuerbarkeit?: number; // 1-5
  ressource_erreichbarkeit_im_alltag?: number; // 1-5
  anker_fuer_alltag?: string;
  vereinbarte_hausaufgabe?: string;
  bemerkungen_risiko_stabilitaet?: string;
}

// Section 9 & 10: Gesamtkommentar und Einwilligung
export interface IRIAbschluss {
  therapeut_reflexion?: string;
  naechste_schritte_behandlung?: string;
  einwilligung_dokumentation: boolean;
  signatur_therapeut?: string;
}

// Complete IRI Protocol
export interface IRIProtocol extends ProtocolMetadata {
  // Section 2: Indikation
  indikation: IRIIndikation;
  
  // Section 3: Positiver Moment
  positiver_moment: IRIPositiverMoment;
  
  // Section 4: Körperwahrnehmung
  koerperwahrnehmung: IRIKoerperwahrnehmung;
  
  // Section 5: LOPE vorher
  lope_vorher?: number; // 0-10
  
  // Section 6: Bilaterale Stimulation
  bilaterale_stimulation: IRIBilateraleStimulation;
  
  // Section 7: LOPE Abschluss
  lope_nachher?: number; // 0-10
  
  // Section 8: Ressourcen-Einschätzung
  ressourcen_einschaetzung: IRIRessourcenEinschaetzung;
  
  // Section 9 & 10: Abschluss
  abschluss: IRIAbschluss;
}

// =============================================================
// Union Types for Compatibility
// =============================================================

// Union type for all protocol types
export type Protocol = StandardProtocol | IRIProtocol;

// Type guard to check if protocol is IRI
export function isIRIProtocol(protocol: Protocol): protocol is IRIProtocol {
  return protocol.protocolType === 'IRI';
}

// Type guard to check if protocol is Standard
export function isStandardProtocol(protocol: Protocol): protocol is StandardProtocol {
  return protocol.protocolType !== 'IRI';
}

export interface ProtocolListItem {
  id: string;
  chiffre: string;
  datum: string;
  protokollnummer: string;
  protocolType: ProtocolType;
  lastModified: number;
}

// Default empty IRI protocol data
export function createEmptyIRIData(): Omit<IRIProtocol, keyof ProtocolMetadata> {
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
      stimulation_typ: 'visuell',
      sets: [],
    },
    lope_nachher: undefined,
    ressourcen_einschaetzung: {},
    abschluss: {
      einwilligung_dokumentation: false,
    },
  };
}
