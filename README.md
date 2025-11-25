# EMDR Protokoll-Plattform

Webbasierte Plattform zur Erstellung und Verwaltung von EMDR-Protokollen mit verschiedenen Protokolltypen.

## ✨ Features

### Protokollverwaltung
- 📋 **Mehrere Protokolltypen**: Reprozessieren, IRI, CIPOS, Sicherer Ort, Custom
- 🎨 **Farbcodierung**: Jeder Protokolltyp hat eine eigene Farbe
- 🔍 **Such- und Filterfunktion**: Schnelles Finden von Protokollen
- 📊 **Statistiken**: Übersicht nach Protokolltyp

### Protokoll-Editor
- 📝 **Strukturierte Eingabe**: Metadaten, Startknoten, Stimulation-Fragment-Paare
- ➕ **Dynamische Paare**: Beliebig viele Stimulation-Fragment-Paare hinzufügen
- ↕️ **Reihenfolge ändern**: Paare per Klick verschieben
- 📖 **Notizen**: Optionale Notizen zu jedem Fragment

### Datenverwaltung
- 💾 **Auto-Save**: Automatische Speicherung im Browser (LocalStorage)
- 📦 **JSON-Export**: Daten als JSON exportieren
- 📄 **PDF-Export**: Professionelle PDF-Dokumente erstellen
- 🔒 **Lokal & Sicher**: Alle Daten bleiben im Browser

### Design
- 🌙 **Dark Theme**: Augenfreundliches dunkles Design
- 📱 **Responsive**: Funktioniert auf Desktop, Tablet und Mobile
- ⚡ **Schnell**: Optimierte Performance mit Vite

## 🚀 Schnellstart

### Installation

```bash
npm install
```

### Entwicklung

```bash
npm run dev
```

Die Anwendung läuft auf: `http://localhost:5173/`

### Build für Production

```bash
npm run build
```

Output-Ordner: `dist/`

### Vorschau des Builds

```bash
npm run preview
```

## 📖 Dokumentation

- **[Benutzeranleitung](./BENUTZERANLEITUNG.md)** - Ausführliche Anleitung für Endbenutzer
- **[Entwickler-Dokumentation](./ENTWICKLER-DOKUMENTATION.md)** - Technische Dokumentation für Entwickler

## 🛠️ Technologie-Stack

- **React 19** - UI Framework
- **TypeScript** - Type-Safety
- **Vite 6** - Build Tool & Dev Server
- **Tailwind CSS** - Styling
- **jsPDF** - PDF-Export
- **LocalStorage** - Datenpersistierung

## 📋 Erste Schritte

1. **Neues Protokoll erstellen**
   - Klicken Sie auf "Neues Protokoll"
   - Füllen Sie die Metadaten aus
   - Beschreiben Sie den Startknoten
   - Fügen Sie Stimulation-Fragment-Paare hinzu
   - Speichern Sie das Protokoll

2. **Protokoll bearbeiten**
   - Wählen Sie ein Protokoll aus der Liste
   - Klicken Sie auf "Bearbeiten"
   - Nehmen Sie Änderungen vor
   - Speichern Sie

3. **Protokoll exportieren**
   - JSON-Export für Backup/Datenaustausch
   - PDF-Export für Dokumentation

## 🎯 Anwendungsbeispiel

### Protokolltypen

- **Reprozessieren**: Standard EMDR-Reprozessierung
- **IRI**: Imagery Rescripting and Reprocessing
- **CIPOS**: Constant Installation of Present Orientation and Safety
- **Sicherer Ort**: Safe-Place Protokoll
- **Custom**: Benutzerdefinierte Protokolle

### Datenstruktur

Ein Protokoll besteht aus:
- **Metadaten**: Chiffre, Datum, Protokollnummer, Typ
- **Startknoten**: Ausgangspunkt der Sitzung
- **Kanal**: Sequenz von Stimulation-Fragment-Paaren
  - **Stimulation**: Anzahl Bewegungen + Geschwindigkeit
  - **Fragment**: Beschreibung + optionale Notizen

## 🔧 Konfiguration

### Tailwind Theme

Passen Sie die Farben in `tailwind.config.js` an:

```javascript
colors: {
  background: '#0f1419',
  surface: '#1a2332',
  'brand-primary': '#3b82f6',
  // ...
}
```

### Konstanten

Anpassen in `src/constants.ts`:
- Protokolltypen
- Standard-Werte (Anzahl Bewegungen, Geschwindigkeit)
- Farben nach Protokolltyp

## 📦 Deployment

Die Anwendung besteht aus statischen Dateien und kann deployed werden auf:

- **Netlify**: Einfaches Drag & Drop
- **Vercel**: Automatisches Deployment via Git
- **GitHub Pages**: Kostenloses Hosting
- **Beliebiger Static Host**: Nginx, Apache, etc.

Keine Backend-Infrastruktur erforderlich!

## 🤝 Beitragen

Contributions sind willkommen! Bitte beachten Sie:

1. TypeScript strict mode
2. Tailwind für Styling
3. Functional Components mit Hooks
4. Dokumentation aktualisieren

## 📄 Lizenz

Proprietary - Alle Rechte vorbehalten

## 🆘 Support

Bei Fragen oder Problemen:
- Siehe [Benutzeranleitung](./BENUTZERANLEITUNG.md) für Hilfe
- Siehe [Entwickler-Dokumentation](./ENTWICKLER-DOKUMENTATION.md) für technische Details

## 🎨 Screenshots

### Protokollübersicht
- Übersichtliche Liste aller Protokolle
- Farbcodierung nach Typ
- Such- und Filterfunktion
- Statistiken

### Protokoll-Editor
- Strukturierte Eingabefelder
- Dynamische Stimulation-Fragment-Paare
- Drag-and-Drop Reihenfolge
- Echtzeit-Validierung

---

**Version:** 1.0.0  
**Stand:** November 2025  
**Erstellt mit:** ❤️ und React

