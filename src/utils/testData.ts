import type { 
  Protocol, 
  StandardProtocol, 
  IRIProtocol,
  ProtocolType, 
  Speed, 
  ChannelItem, 
  Fragment, 
  Stimulation,
  IndikationOption,
  KoerperlokalisationOption,
  KoerperempfindungQualitaet,
  StimulationTyp,
  SetGeschwindigkeit,
  IRIStimulationSet,
} from '../types';
import { PROTOCOL_TYPES } from '../constants';
import { saveProtocol } from './storage';

// Sample data for generating realistic test protocols - exported for individual field generation
export const SAMPLE_CHIFFRES = ['P-001', 'P-002', 'P-003', 'K-101', 'K-102', 'M-201', 'M-202', 'T-301'];

export const SAMPLE_START_KNOTEN = [
  'Patient berichtet von belastender Erinnerung aus der Kindheit',
  'Aktueller Auslöser: Konflikt am Arbeitsplatz',
  'Traumatisches Ereignis: Autounfall vor 2 Jahren',
  'Beziehungskonflikt mit Partner',
  'Verlusterfahrung: Tod eines nahestehenden Menschen',
  'Angst vor öffentlichen Auftritten',
  'Selbstwertproblematik seit der Schulzeit',
  'Chronische Überforderung und Erschöpfung',
];

export const SAMPLE_FRAGMENTS = [
  'Bild wird heller, weniger bedrohlich',
  'Körperempfindung im Brustbereich nimmt ab',
  'Gefühl von Anspannung lässt nach',
  'Erinnerung wird distanzierter',
  'Negative Gedanken verlieren an Intensität',
  'Gefühl von Sicherheit nimmt zu',
  'Neue Perspektive auf die Situation',
  'Ressource: Unterstützung durch Freunde',
  'Positive Körperempfindung: Entspannung',
  'Kognition: "Ich schaffe das"',
  'Emotionale Entlastung spürbar',
  'Distanz zum Ereignis wird größer',
  'Gefühl von Kontrolle kehrt zurück',
  'Belastung reduziert sich deutlich',
  'Neue Einsicht: "Es war nicht meine Schuld"',
  'Ressource: Eigene Stärke wird spürbar',
  'Sicherer Ort wird klarer visualisiert',
  'Positive Affekte nehmen zu',
  'Körperliche Entspannung breitet sich aus',
  'Adaptive Kognition verfestigt sich',
];

export const SAMPLE_NOTIZEN = [
  'Patient zeigt deutliche Entlastung',
  'Kurze Pause nach diesem Set',
  'VoC steigt von 3 auf 5',
  'SUD sinkt von 8 auf 4',
  'Körperscan zeigt Restspannung im Nacken',
  'Patient berichtet spontane positive Erinnerung',
  'Assoziation zu früherer erfolgreicher Bewältigung',
  'Therapeutische Intervention: Ressourcenaktivierung',
];

export const SAMPLE_EINWEBUNGEN = [
  'Sie haben schon viel geschafft. Was hat Ihnen dabei geholfen?',
  'Was würden Sie heute anders machen?',
  'Was sagt Ihr erwachsenes Ich dem Kind?',
  'Was brauchen Sie jetzt, um sich sicher zu fühlen?',
  'Stellen Sie sich vor, Sie haben diese Situation gemeistert.',
  'Welche Stärke hat Ihnen in der Vergangenheit geholfen?',
  'Was würde Ihr bester Freund Ihnen jetzt sagen?',
  'Denken Sie an einen Moment, in dem Sie sich kompetent gefühlt haben.',
  'Wo im Körper spüren Sie Ihre Kraft?',
  'Was möchten Sie dem jüngeren Ich mitgeben?',
];

// IRI-specific sample data
export const SAMPLE_IRI_AUSGANGSZUSTAND = [
  'Patient zeigt Schwierigkeiten, positive Erfahrungen zu aktivieren. Hohe Grundanspannung, wenig Zugang zu inneren Ressourcen.',
  'Nach mehreren belastenden Sitzungen benötigt der Patient Stabilisierung. Ressourcenarbeit zur Stärkung vor weiterer Reprozessierung.',
  'Patient berichtet von Erschöpfung und Hoffnungslosigkeit. Wenig positiver Selbstbezug erkennbar.',
  'Bindungsunsicherheit zeigt sich in der therapeutischen Beziehung. Aufbau von Sicherheit und positiver Erfahrung notwendig.',
];

export const SAMPLE_IRI_ZIELE = [
  'Stärkung des positiven Selbstbildes und der Selbstwirksamkeit.',
  'Integration einer positiven Bindungserfahrung zur Stabilisierung.',
  'Aufbau von Ressourcen für bevorstehende belastende Arbeit.',
  'Verankerung eines sicheren inneren Ortes als Stabilisierungstechnik.',
];

export const SAMPLE_POSITIVE_MOMENTE = [
  'Patient erinnert sich an einen Spaziergang am Meer mit der Großmutter. Gefühl von Geborgenheit und Ruhe.',
  'Erinnerung an den erfolgreichen Abschluss der Ausbildung. Stolz und Selbstwirksamkeit.',
  'Moment der Verbundenheit mit dem eigenen Kind. Tiefe Liebe und Zugehörigkeit.',
  'Wanderung in den Bergen mit Freunden. Gefühl von Freiheit und Lebendigkeit.',
];

export const SAMPLE_KONTEXT_POSITIVE_MOMENTE = [
  'Im Gespräch über Kindheitserinnerungen',
  'Bei der Exploration von Stärken und Ressourcen',
  'Beim Thema Beziehungen und Unterstützung',
  'Während der Stabilisierungsübung',
];

export const SAMPLE_KOERPERWAHRNEHMUNG = [
  'Wärme in der Brust, die sich ausbreitet. Leichte, offene Atmung.',
  'Weites Gefühl im ganzen Körper. Schultern entspannen sich.',
  'Kribbeln in den Händen. Gefühl von Energie und Lebendigkeit.',
  'Ruhe im Bauch. Fester Stand auf dem Boden.',
];

export const SAMPLE_INSTRUKTIONEN = [
  'Denken Sie an diesen positiven Moment und achten Sie auf das angenehme Körpergefühl. Folgen Sie dann mit den Augen meinen Fingern.',
  'Bleiben Sie bei diesem warmen Gefühl in der Brust und folgen Sie meiner Handbewegung.',
  'Halten Sie das Bild und das gute Gefühl und lassen Sie sich von der Stimulation begleiten.',
];

export const SAMPLE_WAHRNEHMUNG_NACH_SET = [
  'Das Gefühl wird stärker und breitet sich aus.',
  'Es fühlt sich klarer und stabiler an.',
  'Die Wärme ist jetzt im ganzen Oberkörper spürbar.',
  'Das Bild ist lebendiger geworden.',
];

export const SAMPLE_ANKER = [
  'Hand aufs Herz legen und an das warme Gefühl denken',
  'Drei tiefe Atemzüge und das Bild visualisieren',
  'Schlüsselwort "Geborgenheit" innerlich sagen',
];

export const SAMPLE_HAUSAUFGABEN = [
  'Täglich morgens 2 Minuten die Ressource aktivieren und das Körpergefühl wahrnehmen.',
  'Bei Stress kurz innehalten und den Anker nutzen.',
  'Tagebuch führen über Momente, in denen die Ressource zugänglich war.',
];

export const SAMPLE_THERAPEUT_REFLEXION = [
  'Gelungene Ressourceninstallation. Patient zeigt deutlich verbesserten Zugang zu positiven Körperempfindungen.',
  'Integration verlief gut, LOPE-Anstieg deutlich. Basis für weitere Stabilisierungsarbeit geschaffen.',
  'Patient konnte die Ressource gut aktivieren und verankern. Gute Voraussetzungen für nächste Sitzung.',
];

// Helper functions for generating random test data - exported for individual field generation
export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const getRandomItems = <T>(array: T[], min: number = 1, max: number = 3): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, array.length));
};

export const getRandomChiffre = (): string => getRandomItem(SAMPLE_CHIFFRES);
export const getRandomStartKnoten = (): string => getRandomItem(SAMPLE_START_KNOTEN);
export const getRandomFragmentText = (): string => getRandomItem(SAMPLE_FRAGMENTS);
export const getRandomNotiz = (): string => getRandomItem(SAMPLE_NOTIZEN);
export const getRandomEinwebung = (): string => getRandomItem(SAMPLE_EINWEBUNGEN);

// Generate a random date within the last 6 months
export const getRandomDate = (): string => {
  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (today.getTime() - sixMonthsAgo.getTime());
  const randomDate = new Date(randomTime);
  
  return randomDate.toISOString().split('T')[0];
};

// Generate a random protocol number
export const getRandomProtocolNumber = (): string => {
  const num = Math.floor(Math.random() * 999) + 1;
  return num.toString().padStart(3, '0');
};

// Generate random stimulation data
export const getRandomStimulation = (): Stimulation => {
  const speeds: Speed[] = ['langsam', 'schnell'];
  const movements = [12, 18, 24, 30, 36, 42, 48];
  
  return {
    id: crypto.randomUUID(),
    anzahlBewegungen: movements[Math.floor(Math.random() * movements.length)],
    geschwindigkeit: speeds[Math.floor(Math.random() * speeds.length)],
  };
};

// Generate random movement count
export const getRandomBewegungen = (): number => {
  const movements = [12, 18, 24, 30, 36, 42, 48];
  return movements[Math.floor(Math.random() * movements.length)];
};

// Generate random speed
export const getRandomSpeed = (): Speed => {
  const speeds: Speed[] = ['langsam', 'schnell'];
  return speeds[Math.floor(Math.random() * speeds.length)];
};

// Generate a random fragment
export const getRandomFragment = (): Fragment => {
  const hasNotes = Math.random() > 0.6; // 40% chance of having notes
  const hasEinwebung = Math.random() > 0.5; // 50% chance of having Einwebung
  
  return {
    id: crypto.randomUUID(),
    text: getRandomItem(SAMPLE_FRAGMENTS),
    einwebung: hasEinwebung ? getRandomItem(SAMPLE_EINWEBUNGEN) : undefined,
    notizen: hasNotes ? getRandomItem(SAMPLE_NOTIZEN) : undefined,
  };
};

// Generate a random channel item (stimulation + fragment pair)
export const getRandomChannelItem = (): ChannelItem => {
  return {
    id: crypto.randomUUID(),
    stimulation: getRandomStimulation(),
    fragment: getRandomFragment(),
  };
};

// Generate a random LOPE value (0-10)
export const getRandomLOPE = (min: number = 0, max: number = 10): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a random IRI stimulation set
export const getRandomIRISet = (setNummer: number): IRIStimulationSet => {
  const geschwindigkeiten: SetGeschwindigkeit[] = ['langsam', 'mittel', 'eher_schnell'];
  
  return {
    id: crypto.randomUUID(),
    set_nummer: setNummer,
    set_dauer: `${Math.floor(Math.random() * 30) + 15} Sekunden`,
    set_geschwindigkeit: getRandomItem(geschwindigkeiten),
    set_anzahl_durchgaenge: Math.floor(Math.random() * 3) + 1,
    instruktion_text: getRandomItem(SAMPLE_INSTRUKTIONEN),
    subjektive_wahrnehmung_nach_set: getRandomItem(SAMPLE_WAHRNEHMUNG_NACH_SET),
    lope_nach_set: getRandomLOPE(4, 9),
  };
};

// Generate a single test protocol (Standard or IRI based on type)
export const generateTestProtocol = (
  protocolType?: ProtocolType,
  chiffre?: string
): Protocol => {
  const type = protocolType || PROTOCOL_TYPES[Math.floor(Math.random() * PROTOCOL_TYPES.length)];
  const cipher = chiffre || SAMPLE_CHIFFRES[Math.floor(Math.random() * SAMPLE_CHIFFRES.length)];
  const date = getRandomDate();
  const now = Date.now();
  
  // If IRI, generate IRI protocol
  if (type === 'IRI') {
    return generateIRITestProtocol(cipher, date, now);
  }
  
  // Otherwise generate standard protocol
  // Generate 3-8 channel items
  const numItems = Math.floor(Math.random() * 6) + 3;
  const channel = Array.from({ length: numItems }, () => ({
    id: crypto.randomUUID(),
    stimulation: getRandomStimulation(),
    fragment: getRandomFragment(),
  }));

  const protocol: StandardProtocol = {
    id: crypto.randomUUID(),
    chiffre: cipher,
    datum: date,
    protokollnummer: getRandomProtocolNumber(),
    protocolType: type,
    startKnoten: SAMPLE_START_KNOTEN[Math.floor(Math.random() * SAMPLE_START_KNOTEN.length)],
    channel,
    createdAt: now,
    lastModified: now,
  };

  return protocol;
};

// Generate an IRI test protocol
export const generateIRITestProtocol = (
  chiffre?: string,
  datum?: string,
  timestamp?: number
): IRIProtocol => {
  const cipher = chiffre || getRandomItem(SAMPLE_CHIFFRES);
  const date = datum || getRandomDate();
  const now = timestamp || Date.now();
  
  const indikationOptions: IndikationOption[] = ['bindungsdefizite', 'schwierigkeiten_ressourcen', 'wenig_ressourcen', 'erhoehte_anspannung'];
  const koerperlokalisationOptions: KoerperlokalisationOption[] = ['kopf', 'hals_nacken', 'brustkorb', 'bauch', 'ruecken', 'arme_haende', 'beine_fuesse', 'ganzkoerper'];
  const qualitaetOptions: KoerperempfindungQualitaet[] = ['warm', 'weit', 'leicht', 'ruhig', 'kraftvoll', 'lebendig'];
  const stimulationTypen: StimulationTyp[] = ['visuell', 'taktil', 'auditiv'];
  
  const lopeVorher = getRandomLOPE(2, 5);
  const lopeNachher = Math.min(10, lopeVorher + getRandomLOPE(2, 4));
  
  // Generate 2-4 stimulation sets
  const numSets = Math.floor(Math.random() * 3) + 2;
  const sets = Array.from({ length: numSets }, (_, i) => getRandomIRISet(i + 1));
  
  const protocol: IRIProtocol = {
    id: crypto.randomUUID(),
    chiffre: cipher,
    datum: date,
    protokollnummer: getRandomProtocolNumber(),
    protocolType: 'IRI',
    createdAt: now,
    lastModified: now,
    
    indikation: {
      indikation_checklist: getRandomItems(indikationOptions, 1, 3),
      ausgangszustand_beschreibung: getRandomItem(SAMPLE_IRI_AUSGANGSZUSTAND),
      ziel_der_iri: getRandomItem(SAMPLE_IRI_ZIELE),
    },
    
    positiver_moment: {
      positiver_moment_beschreibung: getRandomItem(SAMPLE_POSITIVE_MOMENTE),
      kontext_positiver_moment: getRandomItem(SAMPLE_KONTEXT_POSITIVE_MOMENTE),
      wahrgenommene_positive_veraenderung: 'Patient zeigt entspannte Mimik, aufrechte Haltung, lebendiger Ausdruck.',
      veraenderung_mimik: 'Lächeln, Entspannung um die Augen',
      veraenderung_verbale_ausdrucksweise: 'Lebendiger, hoffnungsvoller Tonfall',
      veraenderung_koerperhaltung: 'Aufrechter, offener',
    },
    
    koerperwahrnehmung: {
      koerperwahrnehmung_rohtext: getRandomItem(SAMPLE_KOERPERWAHRNEHMUNG),
      koerperlokalisation: getRandomItems(koerperlokalisationOptions, 1, 3),
      qualitaet_koerperempfindung: getRandomItems(qualitaetOptions, 2, 4),
    },
    
    lope_vorher: lopeVorher,
    
    bilaterale_stimulation: {
      stimulation_typ: getRandomItem(stimulationTypen),
      stimulation_bemerkungen_allgemein: 'Verlauf ohne Besonderheiten. Patient konnte gut folgen.',
      sets,
    },
    
    lope_nachher: lopeNachher,
    
    ressourcen_einschaetzung: {
      ressource_spuerbarkeit: Math.floor(Math.random() * 2) + 4, // 4-5
      ressource_erreichbarkeit_im_alltag: Math.floor(Math.random() * 2) + 3, // 3-4
      anker_fuer_alltag: getRandomItem(SAMPLE_ANKER),
      vereinbarte_hausaufgabe: getRandomItem(SAMPLE_HAUSAUFGABEN),
      bemerkungen_risiko_stabilitaet: 'Stabil nach der Übung. Keine Anzeichen von Überforderung.',
    },
    
    abschluss: {
      therapeut_reflexion: getRandomItem(SAMPLE_THERAPEUT_REFLEXION),
      naechste_schritte_behandlung: 'Fortsetzung der Ressourcenarbeit in der nächsten Sitzung. Bei guter Stabilität ggf. Beginn der Reprozessierung.',
      einwilligung_dokumentation: true,
      signatur_therapeut: `Dr. Muster, ${new Date(now).toLocaleDateString('de-DE')}`,
    },
  };
  
  return protocol;
};

// Generate multiple test protocols
export const generateMultipleTestProtocols = (count: number = 5): Protocol[] => {
  const protocols: Protocol[] = [];
  
  for (let i = 0; i < count; i++) {
    const protocol = generateTestProtocol();
    protocols.push(protocol);
    saveProtocol(protocol);
  }
  
  return protocols;
};

// Generate one protocol of each type
export const generateTestProtocolsAllTypes = (): Protocol[] => {
  const protocols: Protocol[] = [];
  
  PROTOCOL_TYPES.forEach(type => {
    const protocol = generateTestProtocol(type);
    protocols.push(protocol);
    saveProtocol(protocol);
  });
  
  return protocols;
};
