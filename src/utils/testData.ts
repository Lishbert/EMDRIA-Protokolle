import type { 
  Protocol, 
  StandardProtocol, 
  IRIProtocol,
  SichererOrtProtocol,
  ProtocolType, 
  Speed, 
  ChannelItem, 
  Fragment, 
  Stimulation,
  StartKnoten,
  IndikationOption,
  KoerperlokalisationOption,
  KoerperempfindungQualitaet,
  StimulationTyp,
  SetGeschwindigkeit,
  IRIStimulationSet,
  OrtTyp,
  SichererOrtStimulationTyp,
  BLSReaktion,
  SubjektiverZustand,
  EignungEinschaetzung,
} from '../types';
import { PROTOCOL_TYPES } from '../constants';
import { saveProtocol } from './storage';

// Sample data for generating realistic test protocols - exported for individual field generation
export const SAMPLE_CHIFFRES = ['P-001', 'P-002', 'P-003', 'K-101', 'K-102', 'M-201', 'M-202', 'T-301'];

export const SAMPLE_BILD_SENSORISCH = [
  'Bild: Dunkler Raum, Gefühl der Enge, höre laute Stimmen',
  'Sehe das Auto auf mich zukommen, spüre den Aufprall, rieche Benzin',
  'Gesicht des Vaters, seine zornige Stimme, Gefühl der Hilflosigkeit',
  'Klassenzimmer, alle lachen, Gefühl der Scham und Einsamkeit',
  'Krankenhausflur, grelles Licht, piepende Geräte, Angst',
  'Leerer Raum, Stille, Gefühl des Verlassenseins',
  'Menschenmenge, Gesichter starren, Herz rast, Fluchtimpuls',
  'Büro, Stapel Arbeit, Chef steht vor mir, Gefühl der Überforderung',
];

export const SAMPLE_NEGATIVE_KOGNITIONEN = [
  'Ich bin nicht sicher',
  'Ich bin wertlos',
  'Ich bin machtlos',
  'Ich bin schuld',
  'Ich bin nicht gut genug',
  'Ich verdiene es nicht',
  'Ich bin hilflos',
  'Ich habe keine Kontrolle',
];

export const SAMPLE_POSITIVE_KOGNITIONEN = [
  'Ich bin sicher',
  'Ich bin wertvoll',
  'Ich habe Kontrolle',
  'Ich habe mein Bestes getan',
  'Ich bin gut genug',
  'Ich verdiene Gutes',
  'Ich kann für mich sorgen',
  'Ich bin stark',
];

export const SAMPLE_GEFUEHLE = [
  'Angst',
  'Trauer',
  'Scham',
  'Hilflosigkeit',
  'Wut',
  'Schuld',
  'Ohnmacht',
  'Verzweiflung',
  'Einsamkeit',
  'Ekel',
];

export const SAMPLE_KOERPERSENSATIONEN = [
  'Enge in der Brust',
  'Druck im Magen',
  'Spannung im Nacken und Schultern',
  'Kloß im Hals',
  'Schwere in den Beinen',
  'Zittern in den Händen',
  'Herzrasen',
  'Flache Atmung',
  'Taubheitsgefühl',
  'Kribbeln in den Armen',
];

// Legacy sample for backward compatibility
export const SAMPLE_START_KNOTEN = SAMPLE_BILD_SENSORISCH;

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

// CIPOS-specific sample data
export const SAMPLE_CIPOS_INDIKATOREN = [
  'Klarer Blick, aufrechte Haltung, orientiert zu Person, Ort und Zeit.',
  'Patient nimmt Gegenstände im Raum wahr, beschreibt aktuelle Empfindungen.',
  'Körperwahrnehmung präsent, kann Unterschiede zwischen damals und jetzt benennen.',
  'Fokus auf Therapeut:in, ruhige Atmung, verankert im Hier und Jetzt.',
  'Blickkontakt stabil, kann Geräusche im Raum wahrnehmen und benennen.',
];

export const SAMPLE_CIPOS_BEOBACHTUNGEN = [
  'Patient wirkt präsent und ansprechbar.',
  'Leichte Anspannung erkennbar, aber gute Grundorientierung.',
  'Deutliche Verbesserung der Körperhaltung nach Stabilisierung.',
  'Mimik entspannt sich zunehmend.',
  'Atmung wird ruhiger und tiefer.',
];

export const SAMPLE_CIPOS_DAUER_SETS = [
  '3 kurze Sets à 10-15 Sekunden',
  '5 langsame Sets à 15 Sekunden',
  '4 Sets mit je 20 Sekunden',
  '2-3 kurze Stabilisierungssets',
  '5 Sets mit fokussierter Aufmerksamkeit',
];

export const SAMPLE_CIPOS_ZIELERINNERUNG = [
  'Erinnerung an belastendes Ereignis in der Kindheit: Streit der Eltern',
  'Flashback-auslösende Situation: Enger Raum / Aufzug',
  'Traumatische Erfahrung: Autounfall vor 3 Jahren',
  'Auslöser: Konfliktsituation am Arbeitsplatz',
  'Belastende Erinnerung: Verlust eines nahestehenden Menschen',
  'Zukunftsangst: Bevorstehende medizinische Untersuchung',
];

export const SAMPLE_CIPOS_RUECKMELDUNG_ERINNERUNG = [
  'Die Erinnerung fühlt sich distanzierter an, weniger bedrohlich.',
  'Es ist immer noch belastend, aber ich kann es besser aushalten.',
  'Das Bild ist blasser geworden, die Emotionen weniger intensiv.',
  'Ich fühle mich ruhiger, wenn ich daran denke.',
  'Die Anspannung hat deutlich nachgelassen.',
];

export const SAMPLE_CIPOS_RUECKMELDUNG_KOERPER = [
  'Die Enge in der Brust ist weg, ich kann wieder frei atmen.',
  'Die Schultern sind entspannter, der Nacken weniger verspannt.',
  'Das Zittern hat aufgehört, meine Hände sind ruhig.',
  'Ich spüre mehr Wärme und Entspannung im ganzen Körper.',
  'Der Druck im Magen ist verschwunden.',
];

export const SAMPLE_CIPOS_AUFGABE_TAGEBUCH = [
  'Täglich Stabilisierungsübung durchführen und Veränderungen notieren.',
  'Bei Belastung: Sichere-Ort-Übung anwenden und dokumentieren.',
  'Achtsam auf Trigger achten und Reorientierungstechniken anwenden.',
  'Tagebuch führen über Momente der Gegenwartsorientierung.',
];

export const SAMPLE_CIPOS_STABILISIERUNG = [
  'Sichere-Ort-Imaginationsübung',
  'Atemübung mit Fokus auf Ausatmung',
  'Sensorische Erdung (5-4-3-2-1 Technik)',
  'Containment-Übung',
  'Körperliche Bewegung zur Regulation',
];

export const SAMPLE_CIPOS_GESAMTEINSCHAETZUNG = [
  'CIPOS verlief planmäßig. Gute Toleranz der Belastungsexposition bei ausreichender Gegenwartsorientierung.',
  'Erfolgreiche Durchführung mit deutlicher SUD-Reduktion. Patient zeigt gute Reorientierungsfähigkeit.',
  'Zunächst schwierige Reorientierung, nach zusätzlicher Stabilisierung aber guter Verlauf.',
  'Patient konnte dosierte Exposition gut tolerieren. Ressourcen zur Selbstregulation gestärkt.',
];

export const SAMPLE_CIPOS_NAECHSTE_SITZUNG = [
  'Fortsetzung CIPOS mit gleicher Erinnerung zur weiteren Verarbeitung.',
  'Bei guter Stabilität: Standardprotokoll zur Reprozessierung einleiten.',
  'Zunächst weitere Ressourcenstärkung, dann erneuter CIPOS-Versuch.',
  'Review der Hausaufgaben, dann Entscheidung über weiteres Vorgehen.',
];

// =============================================================
// Sicherer Ort Protocol Test Data
// =============================================================

export const SAMPLE_SICHERER_ORT_EINBETTUNG = [
  'Patient zeigt erhöhte Anspannung, benötigt Stabilisierungstechnik vor weiterer Arbeit.',
  'Vorbereitung auf belastende Traumaarbeit – Ressourcenaufbau als Grundlage.',
  'Nach schwieriger Woche: Selbstregulationsfähigkeit stärken.',
  'Regelmäßige Stabilisierungsübung zur Vertiefung der Ressource.',
  'Erstmalige Einführung des sicheren Ortes als Stabilisierungstechnik.',
];

export const SAMPLE_SICHERER_ORT_ORTE = [
  { typ: 'fantasieort' as OrtTyp, name: 'Waldlichtung mit weichem Moos und Sonnenstrahlen', gefuehl: 'Ruhe und Geborgenheit' },
  { typ: 'fantasieort' as OrtTyp, name: 'Wolkeninsel über dem Meer', gefuehl: 'Leichtigkeit und Freiheit' },
  { typ: 'realer_vergangenheit' as OrtTyp, name: 'Großmutters Garten mit Apfelbaum', gefuehl: 'Geborgenheit und Wärme' },
  { typ: 'realer_vergangenheit' as OrtTyp, name: 'Lieblingsstrand aus dem Urlaub 2019', gefuehl: 'Entspannung und Weite' },
  { typ: 'realer_gegenwart' as OrtTyp, name: 'Gemütliche Leseecke im Wohnzimmer', gefuehl: 'Sicherheit und Ruhe' },
  { typ: 'fantasieort' as OrtTyp, name: 'Berggipfel mit Panoramablick', gefuehl: 'Freiheit und Stärke' },
];

export const SAMPLE_KOERPERSTELLEN_GEFUEHL = [
  'Wärme in der Brust, die sich ausbreitet',
  'Leichtes Kribbeln im Bauch',
  'Entspannung in den Schultern',
  'Weites Gefühl im Brustkorb',
  'Ruhe im ganzen Körper',
  'Wärme in den Händen',
];

export const SAMPLE_BLS_REAKTION_BESCHREIBUNG = [
  'Das Bild wird klarer und leuchtender, die Farben intensiver.',
  'Das Gefühl von Sicherheit breitet sich im ganzen Körper aus.',
  'Tiefe Entspannung setzt ein, Schultern sinken herab.',
  'Der Ort fühlt sich noch vertrauter und sicherer an.',
  'Die Atmung wird tiefer und ruhiger.',
];

export const SAMPLE_WORTE_FUER_ORT = [
  'Ruhe',
  'Geborgenheit',
  'Frieden',
  'Sicherheit',
  'Kraft',
  'Heimat',
  'Licht',
  'Wärme',
];

export const SAMPLE_TRANSFER_REAKTION = [
  'Patient:in kann den Ort gut visualisieren und das positive Gefühl aufrufen.',
  'Nach kurzer Konzentration gelingt der Zugang zum sicheren Ort gut.',
  'Ort und Gefühl sind schnell erreichbar, Entspannung tritt ein.',
  'Mit dem Wort als Anker gelingt der Zugang zuverlässig.',
];

export const SAMPLE_ALLTAG_HINWEISE = [
  'Bei aufkommender Anspannung kurz die Augen schließen und das Wort innerlich sagen.',
  'Morgens und abends je 2 Minuten den sicheren Ort aufsuchen.',
  'In stressigen Momenten: Hand aufs Herz, drei Atemzüge, Wort denken.',
  'Als Vorbereitung vor schwierigen Situationen nutzen.',
];

export const SAMPLE_KOERPERLICHE_WAHRNEHMUNG_ABSCHLUSS = [
  'Ganzer Körper entspannt, angenehme Schwere in Armen und Beinen.',
  'Ruhige, tiefe Atmung, Wärme im Brustbereich.',
  'Gelöste Schultern, entspannte Gesichtszüge.',
  'Gefühl von Erdung und Stabilität.',
];

export const SAMPLE_BESONDERE_BEOBACHTUNGEN = [
  'Guter Zugang zur Imagination, lebhafte Visualisierung möglich.',
  'Leichte Unsicherheit zu Beginn, die sich im Verlauf auflöste.',
  'Tiefe emotionale Resonanz beim Finden des sicheren Ortes.',
  'Patient:in zeigt deutliche körperliche Entspannungsreaktion.',
];

export const SAMPLE_PLANUNG_WEITERE_SITZUNGEN = [
  'Vertiefung des sicheren Ortes in nächster Sitzung, dann Beginn der Traumaarbeit.',
  'Regelmäßiges Üben zu Hause, in zwei Wochen Überprüfung der Stabilität.',
  'Nächste Sitzung: Erweiterung um weitere Ressourcen-Imaginationen.',
  'Bei stabiler Ressource: Übergang zur EMDR-Reprozessierung planen.',
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
export const getRandomStartKnoten = (): string => getRandomItem(SAMPLE_BILD_SENSORISCH);
export const getRandomFragmentText = (): string => getRandomItem(SAMPLE_FRAGMENTS);
export const getRandomNotiz = (): string => getRandomItem(SAMPLE_NOTIZEN);
export const getRandomEinwebung = (): string => getRandomItem(SAMPLE_EINWEBUNGEN);

// Generate structured StartKnoten data
export const getRandomStartKnotenStructured = (): StartKnoten => {
  return {
    bildSensorischeErinnerung: getRandomItem(SAMPLE_BILD_SENSORISCH),
    negativeKognition: getRandomItem(SAMPLE_NEGATIVE_KOGNITIONEN),
    positiveKognition: getRandomItem(SAMPLE_POSITIVE_KOGNITIONEN),
    voc: Math.floor(Math.random() * 4) + 1, // 1-4 (initially low)
    gefuehl: getRandomItem(SAMPLE_GEFUEHLE),
    sud: Math.floor(Math.random() * 5) + 5, // 5-9 (initially high)
    koerpersensation: getRandomItem(SAMPLE_KOERPERSENSATIONEN),
  };
};

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

// Generate a random SUD value (0-10)
export const getRandomSUD = (min: number = 0, max: number = 10): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a random percentage value
export const getRandomPercentage = (min: number = 0, max: number = 100): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generate a random boolean or null
export const getRandomBooleanOrNull = (): boolean | null => {
  const rand = Math.random();
  if (rand < 0.4) return true;
  if (rand < 0.8) return false;
  return null;
};

// Generate a random boolean
export const getRandomBoolean = (): boolean => {
  return Math.random() > 0.5;
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

// Generate a single test protocol (Standard, IRI, or Sicherer Ort based on type)
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
  
  // If Sicherer Ort, generate Sicherer Ort protocol
  if (type === 'Sicherer Ort') {
    return generateSichererOrtTestProtocol(cipher, date, now);
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
    startKnoten: getRandomStartKnotenStructured(),
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

// Generate a Sicherer Ort test protocol
export const generateSichererOrtTestProtocol = (
  chiffre?: string,
  datum?: string,
  timestamp?: number
): SichererOrtProtocol => {
  const cipher = chiffre || getRandomItem(SAMPLE_CHIFFRES);
  const date = datum || getRandomDate();
  const now = timestamp || Date.now();
  
  const ortData = getRandomItem(SAMPLE_SICHERER_ORT_ORTE);
  const stimulationArten: SichererOrtStimulationTyp[] = ['augenbewegungen', 'taps', 'auditiv'];
  const reaktionen: BLSReaktion[] = ['positiv', 'keine'];
  const subjektiveZustaende: SubjektiverZustand[] = ['ruhiger', 'verbundener', 'stabiler'];
  const eignungen: EignungEinschaetzung[] = ['geeignet', 'bedingt_geeignet'];
  
  const set1Reaktion = getRandomItem(reaktionen);
  const set2Reaktion = getRandomItem(reaktionen);
  
  const protocol: SichererOrtProtocol = {
    id: crypto.randomUUID(),
    chiffre: cipher,
    datum: date,
    protokollnummer: getRandomProtocolNumber(),
    protocolType: 'Sicherer Ort',
    createdAt: now,
    lastModified: now,
    
    einfuehrung: {
      einbettung_kurzbeschreibung: getRandomItem(SAMPLE_SICHERER_ORT_EINBETTUNG),
      psychoedukation_gegeben: getRandomBoolean() ? 'ja' : 'nein',
      psychoedukation_kommentar: getRandomBoolean() ? 'Konzept des sicheren Ortes als innere Ressource erklärt.' : undefined,
      anker_konzept_erklaert: getRandomBoolean(),
    },
    
    findung: {
      ort_typ: ortData.typ,
      ort_nennung: ortData.name,
      gefuehl_beim_ort: ortData.gefuehl,
      koerperstelle_gefuehl: getRandomItem(SAMPLE_KOERPERSTELLEN_GEFUEHL),
    },
    
    set1: {
      bls_durchgefuehrt: true,
      stimulation_art: getRandomItem(stimulationArten),
      reaktion_nach_set: set1Reaktion,
      reaktion_beschreibung: getRandomItem(SAMPLE_BLS_REAKTION_BESCHREIBUNG),
      interpretation_fall: 'fall1_weiter',
    },
    
    set2: {
      bls_durchgefuehrt: true,
      reaktion_nach_set: set2Reaktion,
      kommentar: 'Verstärkung des positiven Gefühls, Ort wird noch klarer.',
    },
    
    wortarbeit: {
      wort_fuer_ort: getRandomItem(SAMPLE_WORTE_FUER_ORT),
      set3_bls_durchgefuehrt: true,
      set3_patient_denkt_wort_ort: true,
      set3_reaktion: 'Wort verstärkt den Zugang zum Gefühl deutlich.',
      set4_durchgefuehrt: getRandomBoolean(),
      set4_reaktion: getRandomBoolean() ? 'Weitere Vertiefung der Verbindung Wort-Ort-Gefühl.' : undefined,
    },
    
    transfer: {
      anleitung_durchgefuehrt: true,
      patient_erreicht_ort: 'ja',
      reaktion_beschreibung: getRandomItem(SAMPLE_TRANSFER_REAKTION),
      alltag_nutzbar: 'ja',
      alltag_hinweise: getRandomItem(SAMPLE_ALLTAG_HINWEISE),
    },
    
    abschluss: {
      subjektiver_zustand: getRandomItems(subjektiveZustaende, 1, 3) as SubjektiverZustand[],
      koerperliche_wahrnehmung: getRandomItem(SAMPLE_KOERPERLICHE_WAHRNEHMUNG_ABSCHLUSS),
      stabilisierung_ausreichend: true,
    },
    
    therapeutische_einschaetzung: {
      eignung_sicherer_ort: getRandomItem(eignungen),
      besondere_beobachtungen: getRandomItem(SAMPLE_BESONDERE_BEOBACHTUNGEN),
      planung_weitere_sitzungen: getRandomItem(SAMPLE_PLANUNG_WEITERE_SITZUNGEN),
      signatur_therapeut: `Dr. Muster, ${new Date(now).toLocaleDateString('de-DE')}`,
    },
  };
  
  return protocol;
};

// Generate multiple test protocols
export const generateMultipleTestProtocols = async (count: number = 5): Promise<Protocol[]> => {
  const protocols: Protocol[] = [];

  for (let i = 0; i < count; i++) {
    const protocol = generateTestProtocol();
    protocols.push(protocol);
    await saveProtocol(protocol);
  }

  return protocols;
};

// Generate one protocol of each type
export const generateTestProtocolsAllTypes = async (): Promise<Protocol[]> => {
  const protocols: Protocol[] = [];

  for (const type of PROTOCOL_TYPES) {
    const protocol = generateTestProtocol(type);
    protocols.push(protocol);
    await saveProtocol(protocol);
  }

  return protocols;
};
