# Komprimierung

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 06-12-2024                                                 |
| deciders | [Yassi El Fraygui](https://github.com/yasabi04) |
## Kontext und Problemstellung
Die Komprimierung der Multimedia-Dateien erfordert eine leistungsstarke und flexible Lösung, die verschiedene Bildformate unterstützt, effiziente Methoden zur Bearbeitung bereitstellt und sich einfach in bestehende Anwendungen integrieren lässt.
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
### ImageMagick
- Lokale Verarbeitung
- Komplexe Integration in Webanwendungen
- Basiert auf CLI (Comand Line Interface)
- Skalierbarkeit ist auf Grund lokaler Infrastruktur begrenzt: Langsam bei hoher Auslastung.
- Open Source
### Sharp.js
- Open Source
- Basiert auf Node.js und verwendet libvips (Bildverarbeitungsbibliothek)
    - libvips gilt als schneller und ressourcenschonender als ImageMagick
- Funktionen: Bildkomprimierung, Formatänderungen, Bildskalierungen, ...
- Unterstütung von Promises
- Unterstützt PNG, WebP, JPEG, ...
- Funktioniert plattformübergreifend
- Da Open Source: Große Community und regelmäßige Updates
### Cloudinary
- Cloud basiert
- Hoch skalierbar, ist aber von Internetgechwindigkeit abhängig
- Bietet RESTful API, die leicht in jede Webanwendung integriert werden kann
- Unterstützt PNG, JPEG, AVIF, ...
- Caching Verfahren erlaubt Zugriff auf bereits abgerufene Daten
- Kostenpflichtig
