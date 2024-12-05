# Dateispeicherung

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 26-11-2024                                                 |
| deciders | [Maximilian Kellner](https://github.com/MaximilianKellner) |

## Kontext und Problemstellung

Um die Dateien komprimieren zu können, müssen wir diese zwischenspeichern. Dieser ADR behandelt die Art der Speicherung.

## Entscheidungsfaktoren

- Geschwindigkeit
- Sicherheit vor Verlust
- Struktur
- Kompatibilität mit sharp.js

## Berücksichtigte Optionen

- Ein Dateiverzeichnis pro Kunde
- Speicherung in einer Datenbank

## Entscheidungsergebnis

Ein Dateiverzeichnis pro Kunde, dort werden die Dateien anhand des Dateinamens erkannt.

## Vor- und Nachteile der Optionen

### Option 1: Ein Dateiverzeichnis pro Kunde

- Gut, einfache Implementierung und Verwaltung.
- Gut, simple Anbindung an Sharp.js.
- Neutral, erfordert eine gute Strukturierung der Verzeichnisse.
- Schlecht, kann bei einer großen Anzahl von Dateien unübersichtlich werden.

### Option 2: Speicherung in einer Datenbank

- Gut, ermöglicht eine zentrale Verwaltung und einfache Abfragen.
- Neutral, erfordert eine Datenbank, die große Dateien effizient speichern kann.
- Schlecht, kann komplexer in der Implementierung und Wartung sein.