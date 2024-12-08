# Komprimierung
## Kontext und Problemstellung
Die Komprimierung von Bildern spielt eine wesentliche Rolle in Anwendungen, die mit großen Bilddateien arbeiten. Diese Anwednungen sind besonders relevant für Webentwickler, Fotografen oder Unternehmen, die eine effiziente Verwaltung von Medienressourcen benötigen. In den meisten Fällen kommt es allerdings client-seitig zu einem Qualitätsverlust der eingereichten Bilder, weshalb komprimierte Dateien häufig shclehcter darstehen als ihre Originale.
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
### ImageMagick
- Lokale Verarbeitung
- Komplexe Integration in Webanwendungen
- Basiert auf CLI (Comand Line Interface)
- Skalierbarkeit ist auf Grund lokaler Infrastruktur begrenzt: Langsam bei hoher Auslastung.
- Open Source
### Sharp.js
- Open Source
- 

### Cloudinary
- Cloud basiert
- Hoch skalierbar, ist aber von Internetgechwindigkeit abhängig
- Bietet RESTful API, die leicht in jede Webanwendung integriert werden kann
- Unterstützt PNG, JPEG, AVIF, ...
- Caching Verfahren erlaubt Zugriff auf bereits abgerufene Daten
- Kostenpflichtig
## Entschiedenes Ergebnis
Da uns Geschwindigkeit, Kostenkontrolle und Unabhängigkeit wichtig sind, haben wir und für Sharp.js entschieden.
## Vor- und Nachteile der Optionen
