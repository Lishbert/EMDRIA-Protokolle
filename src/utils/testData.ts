import type { Protocol, ProtocolType, Speed } from '../types';
import { PROTOCOL_TYPES } from '../constants';
import { saveProtocol } from './storage';

// Sample data for generating realistic test protocols
const SAMPLE_CHIFFRES = ['P-001', 'P-002', 'P-003', 'K-101', 'K-102', 'M-201', 'M-202', 'T-301'];

const SAMPLE_START_KNOTEN = [
  'Patient berichtet von belastender Erinnerung aus der Kindheit',
  'Aktueller Auslöser: Konflikt am Arbeitsplatz',
  'Traumatisches Ereignis: Autounfall vor 2 Jahren',
  'Beziehungskonflikt mit Partner',
  'Verlusterfahrung: Tod eines nahestehenden Menschen',
  'Angst vor öffentlichen Auftritten',
  'Selbstwertproblematik seit der Schulzeit',
  'Chronische Überforderung und Erschöpfung',
];

const SAMPLE_FRAGMENTS = [
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

const SAMPLE_NOTIZEN = [
  'Patient zeigt deutliche Entlastung',
  'Kurze Pause nach diesem Set',
  'VoC steigt von 3 auf 5',
  'SUD sinkt von 8 auf 4',
  'Körperscan zeigt Restspannung im Nacken',
  'Patient berichtet spontane positive Erinnerung',
  'Assoziation zu früherer erfolgreicher Bewältigung',
  'Therapeutische Intervention: Ressourcenaktivierung',
  '',
  '',
  '',
];

const SAMPLE_EINWEBUNGEN = [
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

// Generate a random date within the last 6 months
const getRandomDate = (): string => {
  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(today.getMonth() - 6);
  
  const randomTime = sixMonthsAgo.getTime() + Math.random() * (today.getTime() - sixMonthsAgo.getTime());
  const randomDate = new Date(randomTime);
  
  return randomDate.toISOString().split('T')[0];
};

// Generate a random protocol number
const getRandomProtocolNumber = (): string => {
  const num = Math.floor(Math.random() * 999) + 1;
  return num.toString().padStart(3, '0');
};

// Generate random stimulation data
const getRandomStimulation = () => {
  const speeds: Speed[] = ['langsam', 'schnell'];
  const movements = [12, 18, 24, 30, 36, 42, 48];
  
  return {
    id: crypto.randomUUID(),
    anzahlBewegungen: movements[Math.floor(Math.random() * movements.length)],
    geschwindigkeit: speeds[Math.floor(Math.random() * speeds.length)],
  };
};

// Generate a random fragment
const getRandomFragment = () => {
  const hasNotes = Math.random() > 0.6; // 40% chance of having notes
  const hasEinwebung = Math.random() > 0.5; // 50% chance of having Einwebung
  
  return {
    id: crypto.randomUUID(),
    text: SAMPLE_FRAGMENTS[Math.floor(Math.random() * SAMPLE_FRAGMENTS.length)],
    einwebung: hasEinwebung ? SAMPLE_EINWEBUNGEN[Math.floor(Math.random() * SAMPLE_EINWEBUNGEN.length)] : undefined,
    notizen: hasNotes ? SAMPLE_NOTIZEN[Math.floor(Math.random() * SAMPLE_NOTIZEN.length)] : undefined,
  };
};

// Generate a single test protocol
export const generateTestProtocol = (
  protocolType?: ProtocolType,
  chiffre?: string
): Protocol => {
  const type = protocolType || PROTOCOL_TYPES[Math.floor(Math.random() * PROTOCOL_TYPES.length)];
  const cipher = chiffre || SAMPLE_CHIFFRES[Math.floor(Math.random() * SAMPLE_CHIFFRES.length)];
  const date = getRandomDate();
  const now = Date.now();
  
  // Generate 3-8 channel items
  const numItems = Math.floor(Math.random() * 6) + 3;
  const channel = Array.from({ length: numItems }, () => ({
    id: crypto.randomUUID(),
    stimulation: getRandomStimulation(),
    fragment: getRandomFragment(),
  }));

  const protocol: Protocol = {
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

