# File Download

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 14-12-2024                                                 |
| deciders | [Oliver Russmann](https://github.com/orussmann) |

## Kontext und Problemstellung
In unserem Szenario existieren potenziell Hunderte Service-Nutzer, die alle gleichzeitig auf ihre optimierten Dateien zugreifen wollen.
Diese Dateien können einzeln, in einer größeren Mengen und als Zip-Datei vom Server geliefert werden. Wir benötigen eine Download-Lösung, die uns bei unerwarteten Ereignissen (z.B. bei Download-Abbrüchen) Feedback gibt,
die zugeschnitten ist auf den Download von größeren Datei-Mengen und das Komprimieren von Multimedia-Dateien ermöglicht. Darüber hinaus muss bedacht werden, dass die Ressourcen (RAM, Festplatte) des Servers begrenzt sind
und nur begrenzt viele Dateien ins RAM geladen werden können um an den Client gesendet zu werden.
Da wir aber unsere Dateien nicht auslagern wollen (z.B. S3 Buckets), müssen die Ressourcen möglichst effizient eingesetzt werden. Ob eine zusätzliche Komprimierung (z.B. mittels Zlib) bei bereits optimierten Dateien sinnvoll ist, muss ebenfalls abgewägt und untersucht werden. 

## Entscheidungsfaktoren
- Komprimierung
- Bulk Download
- Verarbeitung diverser Multimedia-Formate
- Dateien liegen lokal auf der Festplatte
- Error-Feedback & Error-Handling (bei Download-Abbrüchen, schlechter Konnektivität, Server-Auslastung)
- Ressourcenschonend
- Gute, ausführliche Dokumentation
- Viele Tutorials & Code-Beispiele

## Berücksichtigte Optionen
- Node.js Stream-API (createReadStream())
- Express Filetransfer-Funktionen (download(), sendFile())

## Entscheidungsergebnis
Wir haben uns für die Node.js Stream-API entschieden, da diese mehr Funktionalitäten bietet. Obgleich die Express-Funktionen selbst die Node.js APIs nutzen, wird hier viel an Kontrolle zugunsten einer vereinfachten Bedienung abgegeben. Da File Download eine der Kernfunktionalitäten ist, möchten wir hier möglichst viel Kontrolle haben, u.a. um Statistiken zu erstellen (für den Content Manager).<br>
Zusätzlich verfügt die Stream-API über besseres (Error-)Feedback in Form von Events.

## Vor- und Nachteile der Optionen

### Node.js Stream-API
Ein Node.js Modul aus der Standard-Bibliothek, das das Lesen und Schreiben (und auch als Duplex) in und aus verschiedene/n Quellen (HTTP-Requests, HTTP-Responses, Files, ..) ermöglicht. Die Dateien werden als Chunks versendet und können vor dem Versenden modifiziert werden.

- Gut: Native Lösung mit bester Kompatibilität
- Gut: Native Komprimierung (Zlib)
- Gut: Chunking/ Buffering (Spart RAM)
- Gut: Große Kontrolle über das Verarbeiten und Verschicken von Dateien
- Gut: Piping (erlaubt das nahtlose Übertragen von Dateien aus dem Filesystem zum Client)
- Gut: Ereignisse wie error, data, end bieten die Möglichkeit, den Download-Fortschritt zu überwachen
- Gut: Sehr ausfürliche Doku
- Gut: Viele Code-Beispiele
- Neutral: Range, als optionale Steuerung des Downloads mittels Ranged Requests (z.B. clientseitiges Pausieren)
- Schlecht: Erhöhte Komplexität
- Schlecht: Erhöhes Fehlerpotenzial (seitens Programmierer)

### Express Filetransfer-Funktionen
Funktionen der Express Standardbibliothek zum Übertragen von Dateien (download(), sendFile()). Als Node.js-Framework nutzt Express die Node.js API.

- Gut: Leichtere Nutzung, da mehr Abstraktion (Setzen der richtigen HTTP-Header)
- Gut: Wir nutzen bereits Express für das Handling der HTTP-Anfragen
- Neutral: Benötigt zusätzliche Kompression-Middleware (deflate, gzip)
- Neutral: Range, als optionale Steuerung des Downloads mittels Ranged Requests (z.B. clientseitiges Pausieren)
- Neutral: Nutzt "unter der Haube" die Stream-Api
- Neutral: Übersichtliche, vergleichsweise knappe Doku
- Schlecht: Mehr Abstraktion, dadurch z.B. keine Events (da automatisches Error-Handling)
