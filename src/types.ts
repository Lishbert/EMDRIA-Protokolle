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
// CIPOS Protocol Types
// =============================================================

// Section 2: Einschätzung der Gegenwartsorientierung (vor Beginn)
export interface CIPOSGegenwartsorientierungVorher {
  prozent_gegenwartsorientierung: number; // 0-100%
  indikatoren_patient: string; // Freitext
  beobachtungen_therapeut?: string; // Optional
}

// Section 3: Verstärkung der sicheren Gegenwart – Durchführung
export type CIPOSStimulationMethode = 
  | 'visuell'
  | 'taktil'
  | 'auditiv'
  | 'kombination';

export interface CIPOSVerstaerkungGegenwart {
  stimulation_methode: CIPOSStimulationMethode;
  stimulation_methode_sonstiges?: string;
  dauer_anzahl_sets: string;
  reaktion_verbesserung: boolean | null; // Ja/Nein
  gegenwartsorientierung_nach_stimulation: number; // 0-100%, Ziel: ≥70%
  kommentar?: string;
}

// Section 4.4: Reorientierungsmethoden
export type ReorientierungsMethode = 
  | 'gegenstaende_benennen'
  | 'rueckwaerts_rechnen'
  | 'sensorische_uebungen'
  | 'fuenf_vier_drei_zwei_eins'
  | 'blickkontakt'
  | 'atemuebung'
  | 'koerperwahrnehmung'
  | 'orientierung_raum'
  | 'fuesse_boden'
  | 'kaltes_wasser'
  | 'starke_sinnesreize'
  | 'bilaterale_stimulation'
  | 'safe_place'
  | 'bewegung_aufstehen'
  | 'selbstberuehrung'
  | 'sonstiges';

// Section 4: Erster Kontakt mit der belastenden Erinnerung
export interface CIPOSDurchgang {
  id: string;
  durchgang_nummer: number;
  
  // Bereitschaft (für Durchgänge 2 und 3)
  bereitschaft_patient?: boolean | null;
  bereitschaft_kommentar?: string;
  
  // Durchführung
  zaehl_technik: boolean | null;
  dauer_sekunden: number; // 3-10 Sekunden
  reorientierung_methoden: ReorientierungsMethode[];
  reorientierung_sonstiges?: string;
  reorientierung_freitext?: string; // Eigene Reorientierungstechniken
  
  // Gegenwartsorientierung nach Reorientierung
  gegenwartsorientierung_nach: number; // 0-100%
  stimulation_verstaerkung?: boolean | null; // 5 langsame Sets
  kommentar?: string;
}

export interface CIPOSErsterKontakt {
  // 4.1 Beschreibung der Zielerinnerung
  zielerinnerung_beschreibung: string;
  
  // 4.2 SUD vor dem Kontakt
  sud_vor_kontakt: number; // 0-10
  
  // 4.3 Festlegung der Belastungsdauer
  belastungsdauer_sekunden: number; // 3-10 Sekunden
}

// Section 7: Abschlussbewertung
export interface CIPOSAbschlussbewertung {
  // 7.1 SUD nach dem letzten Durchgang
  sud_nach_letztem_durchgang: number; // 0-10
  
  // 7.2 Veränderungsverlauf (automatisch berechenbar)
  // ausgangs_sud und abschluss_sud sind aus anderen Feldern ableitbar
  
  // 7.3 Patient:innen-Rückmeldung
  rueckmeldung_erinnerung?: string; // Wie fühlt sich die Erinnerung nun an?
  rueckmeldung_koerper?: string; // Veränderung im Körper?
  subjektive_sicherheit?: number; // 0-100%, optional
}

// Section 8: Nachbesprechung / Abschluss
export interface CIPOSNachbesprechung {
  nachbesprechung_durchgefuehrt: boolean | null;
  hinweis_inneres_prozessieren: boolean | null;
  aufgabe_tagebuch?: string;
  beobachtungen_therapeut?: string;
}

// Section 9: Falls Schwierigkeiten auftraten
export interface CIPOSSchwierigkeiten {
  probleme_reorientierung: boolean | null;
  stabilisierungstechniken?: string;
  cipos_vorzeitig_beendet: boolean | null;
  cipos_vorzeitig_grund?: string;
}

// Section 10: Abschluss der Dokumentation
export interface CIPOSAbschlussDokumentation {
  gesamteinschaetzung_therapeut?: string;
  planung_naechste_sitzung?: string;
  signatur_therapeut?: string;
}

// Complete CIPOS Protocol
export interface CIPOSProtocol extends ProtocolMetadata {
  // Section 2: Gegenwartsorientierung vor Beginn
  gegenwartsorientierung_vorher: CIPOSGegenwartsorientierungVorher;
  
  // Section 3: Verstärkung der sicheren Gegenwart
  verstaerkung_gegenwart: CIPOSVerstaerkungGegenwart;
  
  // Section 4: Erster Kontakt
  erster_kontakt: CIPOSErsterKontakt;
  
  // Durchgänge (1-3)
  durchgaenge: CIPOSDurchgang[];
  
  // Section 7: Abschlussbewertung
  abschlussbewertung: CIPOSAbschlussbewertung;
  
  // Section 8: Nachbesprechung
  nachbesprechung: CIPOSNachbesprechung;
  
  // Section 9: Schwierigkeiten
  schwierigkeiten: CIPOSSchwierigkeiten;
  
  // Section 10: Abschluss Dokumentation
  abschluss_dokumentation: CIPOSAbschlussDokumentation;
}

// Default empty CIPOS protocol data
export function createEmptyCIPOSData(): Omit<CIPOSProtocol, keyof ProtocolMetadata> {
  return {
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
}

// =============================================================
// Union Types for Compatibility
// =============================================================

// Union type for all protocol types
export type Protocol = StandardProtocol | IRIProtocol | CIPOSProtocol;

// Type guard to check if protocol is IRI
export function isIRIProtocol(protocol: Protocol): protocol is IRIProtocol {
  return protocol.protocolType === 'IRI';
}

// Type guard to check if protocol is CIPOS
export function isCIPOSProtocol(protocol: Protocol): protocol is CIPOSProtocol {
  return protocol.protocolType === 'CIPOS';
}

// Type guard to check if protocol is Standard
export function isStandardProtocol(protocol: Protocol): protocol is StandardProtocol {
  return protocol.protocolType !== 'IRI' && protocol.protocolType !== 'CIPOS';
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
