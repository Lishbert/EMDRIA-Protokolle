# EMDR Protokoll-Plattform - Benutzeranleitung

## Überblick

Die EMDR Protokoll-Plattform ist eine webbasierte Anwendung zur Erstellung und Verwaltung von EMDR-Protokollen mit verschiedenen Protokolltypen.

## Hauptfunktionen

### 1. Protokolltypen

Die Plattform unterstützt folgende Protokolltypen:
- **Reprozessieren** (Blau)
- **IRI** (Violett)
- **CIPOS** (Grün)
- **Sicherer Ort** (Gelb)
- **Custom** (Grau)

### 2. Tab-Navigation

Die Anwendung ist in zwei Hauptbereiche unterteilt:

#### Tab 1: Protokollübersicht
- Übersicht aller gespeicherten Protokolle
- Statistiken nach Protokolltyp
- Such- und Filterfunktionen
- Schnellzugriff auf Aktionen (Bearbeiten, Exportieren, Löschen)
- **Testdaten-Generator** (Beaker-Icon)

#### Tab 2: Protokoll-Editor
- Erstellen neuer Protokolle
- Bearbeiten bestehender Protokolle

## Anleitung: Neues Protokoll erstellen

### Schritt 1: Neues Protokoll anlegen

1. Klicken Sie auf "Neues Protokoll" in der Protokollübersicht
2. Sie werden automatisch zum Editor weitergeleitet

### Schritt 2: Metadaten eingeben

Füllen Sie die folgenden Pflichtfelder aus:
- **Chiffre**: Eindeutige Patientenkennung (z.B. "Patient-001")
- **Datum**: Datum des Protokolls (Date-Picker)
- **Protokollnummer**: Eindeutige Protokollnummer (z.B. "001")
- **Protokolltyp**: Wählen Sie aus dem Dropdown (Reprozessieren, IRI, CIPOS, Sicherer Ort, Custom)

### Schritt 3: Startknoten definieren

Beschreiben Sie den Ausgangspunkt/Startknoten des Protokolls im Textfeld.

### Schritt 4: Stimulation-Fragment-Paare hinzufügen

Für jeden Durchgang fügen Sie ein Paar hinzu:

#### Stimulation:
- **Anzahl Bewegungen**: Numerischer Wert (z.B. 24)
- **Geschwindigkeit**: Wählen Sie "langsam" oder "schnell"

#### Fragment:
- **Fragmentbeschreibung**: Beschreibung des Fragments (Pflichtfeld)
- **Notizen**: Optional - Zusätzliche Informationen (expandierbar)

#### Verwaltung der Paare:
- **Paar hinzufügen**: Neues Stimulation-Fragment-Paar hinzufügen
- **Nach oben/unten**: Reihenfolge der Paare ändern
- **Löschen**: Paar entfernen

### Schritt 5: Protokoll speichern

Klicken Sie auf "Speichern" am unteren Bildschirmrand. Das Protokoll wird automatisch in Ihrem Browser gespeichert (LocalStorage).

## Testdaten generieren

### Verwendung der Testdaten-Funktion

1. Klicken Sie in der Protokollübersicht auf "Testdaten" (Beaker-Icon)
2. Wählen Sie eine Option:
   - **1 Testprotokoll erstellen**: Erstellt ein einzelnes Protokoll
   - **5 Testprotokolle erstellen**: Erstellt fünf Protokolle
   - **10 Testprotokolle erstellen**: Erstellt zehn Protokolle
   - **Je 1 pro Protokolltyp**: Erstellt für jeden Typ ein Protokoll (5 insgesamt)

Die Testprotokolle enthalten:
- Realistische Chiffren und Protokollnummern
- Authentische Startknoten-Beschreibungen
- 3-8 Stimulation-Fragment-Paare pro Protokoll
- Verschiedene Anzahlen von Bewegungen
- Zufällige Geschwindigkeiten
- Optionale Notizen

## Protokolle verwalten

### Protokoll bearbeiten

1. Wählen Sie in der Protokollübersicht das gewünschte Protokoll
2. Klicken Sie auf "Bearbeiten" (Stift-Symbol)
3. Nehmen Sie Ihre Änderungen vor
4. Speichern Sie das Protokoll

### Protokoll löschen

1. Klicken Sie in der Protokollübersicht auf "Löschen" (Papierkorb-Symbol)
2. Bestätigen Sie das Löschen im Dialog
3. Das Protokoll wird permanent entfernt

### Protokoll exportieren

#### JSON-Export:
- Klicken Sie auf "JSON" um das Protokoll als JSON-Datei zu exportieren
- Dateiname: `EMDR_[Chiffre]_[Datum]_[Protokollnummer].json`
- Verwendung: Backup, Datenaustausch

#### PDF-Export:
- Klicken Sie auf "PDF" um das Protokoll als PDF zu exportieren
- Dateiname: `EMDR_[Chiffre]_[Datum]_[Protokollnummer].pdf`
- Inhalt: Vollständiges Protokoll mit Metadaten, Startknoten und allen Stimulation-Fragment-Paaren

## Such- und Filterfunktionen

### Suche
- Suchen Sie nach Chiffre oder Protokollnummer im Suchfeld
- Die Ergebnisse werden in Echtzeit gefiltert

### Filter
1. Klicken Sie auf "Filter"
2. Wählen Sie einen Protokolltyp aus dem Dropdown
3. Die Liste zeigt nur Protokolle des gewählten Typs

### Filter zurücksetzen
Klicken Sie auf "Filter zurücksetzen" um alle Filter und Suchbegriffe zu entfernen.

## Statistiken

Die Protokollübersicht zeigt farbcodierte Statistiken:
- Anzahl der Protokolle pro Typ
- Gesamtzahl aller Protokolle
- Farbcodierung nach Protokolltyp

## Datenspeicherung

### LocalStorage
- Alle Protokolle werden automatisch im Browser gespeichert
- Daten bleiben nach Schließen des Browsers erhalten
- Daten sind nur im verwendeten Browser verfügbar
- Auto-Speichern aktiv (erkennbar am Cloud-Symbol)

### Daten sichern
Exportieren Sie regelmäßig Ihre Protokolle als JSON oder PDF zur Sicherung.

## Tastaturkürzel

- **ESC**: Schließt Dialoge/Modals
- **Tab/Shift+Tab**: Navigation zwischen Eingabefeldern

## Fehlerbehebung

### "Mindestens ein Stimulation-Fragment-Paar ist erforderlich"
- Fügen Sie mindestens ein vollständiges Paar mit allen Pflichtfeldern hinzu

### "Fehler beim Speichern"
- Prüfen Sie, ob alle Pflichtfelder (*) ausgefüllt sind
- Prüfen Sie, ob der Browser-Speicher voll ist (LocalStorage-Limit)

### Daten gehen verloren
- Protokolle sind browserspezifisch
- Löschen Sie nicht den Browser-Cache ohne vorherigen Export
- Nutzen Sie regelmäßige JSON-Exports zur Datensicherung

## Technische Hinweise

### Browser-Kompatibilität
- Chrome/Edge (empfohlen)
- Firefox
- Safari
- Moderne Browser mit JavaScript aktiviert

### Speichergrenzen
- LocalStorage hat typischerweise ein Limit von 5-10 MB
- Bei vielen Protokollen regelmäßig exportieren und ältere löschen

---

**Version:** 1.0.0  
**Stand:** November 2025

