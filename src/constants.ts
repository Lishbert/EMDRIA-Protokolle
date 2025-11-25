import type { ProtocolType, Speed } from './types';

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

