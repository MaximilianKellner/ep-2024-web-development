# File Download

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 14-12-2024                                                 |
| deciders | [Oliver Russmann](https://github.com/orussmann) |

## Kontext und Problemstellung
In unserem Szenario existieren potentiell Hunderte Service-Nutzer, die alle gleichzeitig auf ihre optimierten Dateien zugreifen wollen.
Diese Dateien können einzeln, in einer größeren Menge und als Zip-Datei vom Server geliefert werden. Wir benötigen eine Download-Lösung, die uns bei unerwarteten Ereignissen (z.B. bei Download-Abbrüchen) Feedback gibt,
die zugeschnitten ist auf den Download von größeren Datei-Mengen und das Komprimieren von Multimedia-Dateien ermöglicht. Darüber hinaus muss bedacht werden, dass die Ressourcen (RAM, Festplatte) des Servers begrenzt sind
und nur begrenzt viele Dateien ins RAM geladen werden können um an den Client gesendet zu werden.
Da wir aber unsere Dateien nicht auslagern wollen (z.B. S3 Buckets), müssen die Ressourcen möglichst effizient eingesetzt werden. Ob eine zusätzliche Kompression (z.B. mittels Zlib) bei bereits optimierten Dateien sinnvoll ist,
muss ebenfalls abgewägt und untersucht werden. 

## Entscheidungsfaktoren
- Zip-Komprimierung
- Bulk Download
- Streaming
- Verarbeitung diverser Multimedia-Formate
- Dateien liegen lokal auf der Festplatte
- Error Feedback & Error Handling (bei Download-Abbrüchen, schlechter Konnektivität, Server-Auslastung)
- Ressourcenschonend

## Berücksichtigte Optionen
- Node.js Stream-API (createReadStream()), Zlib, Archiver, P-Limit & progress-steam
- Express Filetransfer-Methoden (download(), sendFile()), Zlib, Archiver, P-Limit & progress-stream


## Entscheidungsergebnis


## Vor- und Nachteile der Optionen

### Option 1

Option 1 beschreibung

- Gut,
- Neutral,
- Schlecht,

### Option 2

Option 2 beschreibung

- Gut,
- Neutral,
- Schlecht,
