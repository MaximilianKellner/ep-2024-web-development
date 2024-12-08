# Komprimierung

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 06-12-2024                                                 |
| deciders | [Yassin El Fraygui](https://github.com/yasabi04) |
## Kontext und Problemstellung
Die Komprimierung der Bilddateien erfordert eine leistungsstarke und flexible Lösung, die verschiedene Bildformate unterstützt, effiziente Methoden zur Bearbeitung bereitstellt und sich einfach in bestehende Anwendungen integrieren lässt.
## Entscheidungsfaktoren
### Leistung und Effizienz
Große Bilddateien müssen schnell und zuverlässig bearbeitet werden, ohne Server Ressourcen zu überlasten.
### Einfache Integration
Die Anwendung muss leicht zu bedienen und in das System zu integrieren sein.
### Skalierbarkeit und Caching
Die Anwendung muss zukünftiges Wachstum und Veränderungen unterstützen, zum Beispiel mehr Nutzer und größere Bilddateien als bis jetzt geplant.
### Unabhängigkeit
Die Anwendung sollte unabhängig von Drittanbietern sein, 
## Berücksichtigte Optionen
* ImageMagick
* Sharp.js
* Cloudinary
## Entschiedenes Ergebnis
Da uns Geschwindigkeit, Kostenkontrolle und Unabhängigkeit wichtig sind, haben wir und für Sharp.js entschieden.
## Vor- und Nachteile der Optionen
ImageMagick

ImageMagick ist eine Open-Source-Software-Suite für die Erstellung, Bearbeitung und Konvertierung von Rastergrafiken. Sie unterstützt eine Vielzahl von Bildformaten (z. B. PNG, JPEG, GIF, TIFF) und bietet eine breite Palette von Funktionen, darunter 
    - Gut: Sehr hohe Anzahl an Tools und Bildbearbeitungsoptionen
    - Gut: Open Source
    - Gut: Unterstützung von über 200 Bildformaten
    - Neutral: Lokale Bildverarbeitung
    - Schlecht: Komplexe Befehlzeilennutzung
    - Schlecht: Performanz kann bei großen Bildmengen nachlassen

Sharp.js

Sharp.js ist eine leistungsstarke Node.js-Bibliothek zur schnellen und effizienten Bildverarbeitung. Sie basiert auf der libvips-Bibliothek, die für ihre hohe Geschwindigkeit und geringe Speichernutzung bekannt ist. Sharp.js ist sowohl nützlich für serverseitige Anwendungen, bei denen Bildoptimierung oder Transformation erforderlich sind, als auch für Bildkomprimierungen.

    - Gut: Open Source
    - Gut: Basiert auf Node.js -> Große Community -> Viel Support -> Regelmäßige Updates
    - Gut: Plattformübergreifend
    - Schlecht: Basiert auf libvips -> Muss während Installation kompiliert werden
    - Schlecht: Bietet wenger Tools, als Cloudinary oder ImageMagick

Cloudinary

Cloudinary ist eine umfassende Cloud-basierte Plattform für die Verwaltung, Optimierung und Bereitstellung von Medieninhalten wie Bildern und Videos. Sie bietet Entwicklern und Unternehmen leistungsstarke Tools, um visuelle Inhalte effizient zu speichern, zu transformieren und weltweit zu verteilen.
    - Gut: Umfassende Cloud-basierte Bildverarbeitung
    - Gut: Automatische Optimierung und Komprimierung
    - Gut: Integriertes Caching-Verfahren
    - Schlecht: Einfache Intgeration in bestehende Systeme
    - Neutral: Cloud-basiert
    - Schlecht: Kostenpflichtig
    - Schlecht: Abhängig von Internetverbindung und dem daraus resultierenden Cloud-Service
