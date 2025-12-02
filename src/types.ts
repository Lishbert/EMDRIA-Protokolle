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

export interface Protocol extends ProtocolMetadata {
  startKnoten: string;  // Starting node description
  channel: ChannelItem[];  // Array of stimulation-fragment pairs
}

export interface ProtocolListItem {
  id: string;
  chiffre: string;
  datum: string;
  protokollnummer: string;
  protocolType: ProtocolType;
  lastModified: number;
}

