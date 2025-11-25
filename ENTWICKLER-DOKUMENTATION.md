# EMDR Protokoll-Plattform - Entwickler-Dokumentation

## Architektur-Übersicht

### Technologie-Stack

- **Framework**: React 19 mit TypeScript
- **Build-Tool**: Vite 6
- **Styling**: Tailwind CSS (Dark Theme)
- **PDF-Export**: jsPDF
- **State Management**: React useState/useEffect
- **Datenpersistierung**: Browser LocalStorage

### Projektstruktur

```
emdr-protocols/
├── src/
│   ├── App.tsx                    # Haupt-App mit Tab-Navigation
│   ├── types.ts                   # TypeScript Interfaces
│   ├── constants.ts               # Konstanten & Konfiguration
│   ├── index.tsx                  # Entry Point
│   ├── index.css                  # Global Styles
│   ├── components/
│   │   ├── ui/                    # Wiederverwendbare UI-Komponenten
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── index.ts
│   │   ├── ProtocolList.tsx       # Protokollübersicht
│   │   ├── ProtocolEditor.tsx     # Protokoll-Editor
│   │   ├── MetadataForm.tsx       # Metadaten-Formular
│   │   ├── ChannelEditor.tsx      # Kanal-Editor
│   │   ├── StimulationFragment.tsx # Einzelnes Paar
│   │   └── icons.tsx              # SVG Icons
│   └── utils/
│       ├── storage.ts             # LocalStorage CRUD
│       ├── export.ts              # Export-Funktionen
│       └── testData.ts            # Testdaten-Generierung
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## Datenmodell

### TypeScript Interfaces

```typescript
type ProtocolType = 'Reprozessieren' | 'IRI' | 'CIPOS' | 'Sicherer Ort' | 'Custom';
type Speed = 'langsam' | 'schnell';

interface ProtocolMetadata {
  id: string;                    // UUID
  chiffre: string;               // Patientenkennung
  datum: string;                 // ISO Date (YYYY-MM-DD)
  protokollnummer: string;       // Protokollnummer
  protocolType: ProtocolType;    // Protokolltyp
  createdAt: number;             // Timestamp
  lastModified: number;          // Timestamp
}

interface Stimulation {
  id: string;                    // UUID
  anzahlBewegungen: number;      // Anzahl Augenbewegungen
  geschwindigkeit: Speed;        // Geschwindigkeit
}

interface Fragment {
  id: string;                    // UUID
  text: string;                  // Hauptbeschreibung
  notizen?: string;              // Optional: Zusätzliche Notizen
}

interface ChannelItem {
  id: string;                    // UUID
  stimulation: Stimulation;      // Stimulation-Daten
  fragment: Fragment;            // Fragment-Daten
}

interface Protocol extends ProtocolMetadata {
  startKnoten: string;           // Startknoten-Beschreibung
  channel: ChannelItem[];        // Array von Paaren
}
```

## Komponenten-Dokumentation

### App.tsx

Haupt-App-Komponente mit:
- Tab-Navigation (List/Editor)
- Global State Management
- Notification System
- Confirm Modal System
- CRUD-Handler für Protokolle

### ProtocolList.tsx

Listenansicht mit:
- Statistiken nach Protokolltyp
- Such- und Filterfunktion
- Testdaten-Generator (Dropdown-Menü)
- Aktionsbuttons pro Protokoll

### ProtocolEditor.tsx

Editor-Komponente mit:
- Metadaten-Sektion
- Startknoten-Sektion
- Channel-Editor
- Validierung
- Save/Cancel/Export Actions

### ChannelEditor.tsx

Verwaltet Array von ChannelItems:
- Add/Delete Items
- Reorder (Move Up/Down)
- Update Items

### StimulationFragment.tsx

Einzelnes Stimulation-Fragment-Paar:
- Stimulation: Anzahl + Geschwindigkeit
- Fragment: Text + Notizen (expandierbar)
- Up/Down/Delete Actions

## Utility-Funktionen

### storage.ts

LocalStorage-Verwaltung:

```typescript
// Protokoll speichern
saveProtocol(protocol: Protocol): void

// Protokoll laden
loadProtocol(id: string): Protocol | null

// Protokoll löschen
deleteProtocol(id: string): void

// Liste aller Protokolle
getProtocolsList(): ProtocolListItem[]
```

**Storage-Keys:**
- `emdr_protocol_{id}`: Einzelnes Protokoll
- `emdr_protocols_list`: Liste aller Protokolle (Metadaten)

### export.ts

Export-Funktionen:

```typescript
// JSON-Export
exportProtocolAsJSON(protocol: Protocol): void

// PDF-Export
exportProtocolAsPDF(protocol: Protocol): void
```

### testData.ts

Testdaten-Generierung:

```typescript
// Einzelnes Testprotokoll generieren
generateTestProtocol(protocolType?: ProtocolType, chiffre?: string): Protocol

// Mehrere Testprotokolle generieren
generateMultipleTestProtocols(count: number = 5): Protocol[]

// Testprotokolle für alle Typen generieren
generateTestProtocolsAllTypes(): Protocol[]
```

**Features:**
- Realistische Sample-Daten für:
  - Chiffren (P-001, K-101, M-201, etc.)
  - Startknoten-Beschreibungen
  - Fragment-Texte
  - Notizen
- Zufällige Datumsangaben (letzte 6 Monate)
- Verschiedene Bewegungsanzahlen (12, 18, 24, 30, 36, 42, 48)
- 40% Wahrscheinlichkeit für Notizen bei Fragmenten
- 3-8 Stimulation-Fragment-Paare pro Protokoll

## Styling-System

### Tailwind Theme

```javascript
colors: {
  background: '#0f1419',           // Hintergrund
  surface: '#1a2332',              // Karten/Oberflächen
  'on-surface': '#cbd5e1',         // Text auf Oberflächen
  'on-surface-strong': '#f1f5f9',  // Hervorgehobener Text
  muted: '#64748b',                // Gedämpfter Text
  'brand-primary': '#3b82f6',      // Primärfarbe (Blau)
  'brand-secondary': '#10b981',    // Sekundärfarbe (Grün)
}
```

### Protokolltyp-Farben

```javascript
PROTOCOL_TYPE_COLORS: {
  'Reprozessieren': 'from-blue-500 to-blue-600',
  'IRI': 'from-purple-500 to-purple-600',
  'CIPOS': 'from-green-500 to-green-600',
  'Sicherer Ort': 'from-yellow-500 to-yellow-600',
  'Custom': 'from-gray-500 to-gray-600'
}
```

## Entwicklungs-Workflows

### Development

```bash
npm install
npm run dev
```

Läuft auf: `http://localhost:5173/`

### Production Build

```bash
npm run build
```

Output: `dist/` Ordner

### Testdaten in Entwicklung nutzen

1. Starten Sie die Anwendung
2. Klicken Sie auf "Testdaten" in der Protokollübersicht
3. Wählen Sie gewünschte Anzahl
4. Testprotokolle werden sofort erstellt

Dies ist nützlich für:
- UI-Testing
- Performance-Testing
- Demonstrations-Zwecke
- Schulungen

## Code-Konventionen

### TypeScript
- Strikte Type-Checks aktiviert
- Interfaces statt Types (wo sinnvoll)
- Explizite Return-Types bei komplexen Funktionen

### Komponenten
- Functional Components mit Hooks
- Props-Interfaces immer definieren
- React.FC<Props> Pattern

### Styling
- Tailwind Utility Classes
- Keine inline Styles (außer Dynamic)
- Konsistente Spacing (mb-4, gap-4, p-6)

---

**Version:** 1.0.0  
**Stand:** November 2025

