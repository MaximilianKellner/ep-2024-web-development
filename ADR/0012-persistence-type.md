# Persistence type

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 19-01-2025                                                 |
| deciders | [Oliver Russmann](https://github.com/orussmann) |

## Kontext und Problemstellung
Unsere Webanwendung muss Daten für den Service-Nutzer und den Content-Manager speichern können. Auf Seiten des Service-Nutzers sind das seine persönlichen Informationen (z.B. Anschrift, Telefonnummer)
und seine anwendungsbezogenen Informationen (z.B. Credits, personalisierte Optimierungseinstellungen). Für den Content-Manager müssen u.a.
Daten für das Monitoring, die Zugriffsberechtigungen und Medienverwaltung gespeichert werden. Zentrale Anforderungen an die gesuchte Lösung ergeben sich aus den ACID-Prinzipien,
da z.B. mehrere Nutzer/ Geräte ein und den selben Account/ Endpoint nutzen können, um Daten zu optimieren (etwa als Firmen-Account), was in einer (fast) gleichzeitigen
Anpassung der Credit-Points resultiert.


## Entscheidungsfaktoren
- Einhaltung der ACID-Prinzipien (oder analoge Mechanismen)
- Verbindung von Daten (Links, Referenzen)
- Geschwindigkeit (Lesen, Schreiben)
- Zuverlässigkeit
- Leichtgewichtig
- Constraints oder eine Form der Validierung

## Berücksichtigte Optionen
- SQL
- NoSQL
- Einfache JSON


## Entscheidungsergebnis
Wir haben uns für eine NoSQL-Lösung (dokumentenbasiert) entschieden. Einerseits benötigen wir ein anpassungsfähiges Datenschema, das sich noch entwickeln wird. Wir möchten z.B. die Optimierungskonfiguration in näherer Zukunft erweitern,
haben uns aber jetzt noch nicht endgültig auf die neuen Optionen festgelegt. Andererseits benötigen wir keine komplexen Beziehungen zwischen Daten, da eigentlich nur die Credits regelmäßig aktualisiert werden. Angesichts der Zukunft unserer Anwendung:
Falls unsere Webanwendung einen erhöhten Datenverkehr aufweist, können wir mit einer NoSQL-Lösung am besten horizontal skalieren.
Und schließlich brauchen wir auch keine Transaktionen, da wir nur isoliert auf Daten zugreifen.


## Vor- und Nachteile der Optionen

### SQL

Eine SQL-Datenbank speichert die Daten in Form von Tabellen, die über sogenannte Schlüssel (z.B. Primary Key) in Verbindung gesetzt werden können (relationales Modell).
Eine Abfrage an so eine Datenbank erfolgt in der Regel als Transaktion (mehrere zusammengehörende Aktionen) unter Einsatz von SQL-Befehlen und Object-Relational-Mapping.

- Gut: Transaktionszentriert (garantierte Datenintegrität)
- Gut: Fördert Normalisierung (weniger Anomalien)
- Gut: Flexible Anpassung der Anfragen
- Neutral: Skaliert vertikal
- Schlecht: Genaue Planung notwendig (nachträgliche Änderungen sind umständlich)
- Schlecht: Mehr Rechenleistung nötig, als bei NoSQL

### NoSQL

Eine NoSQL-Datenbank speichert die Daten in Form von Key-Value-Paaren, Dokumenten, Graphen oder Spalten. Eine Abfrage erfolgt z.B. über Methoden-Aufrufe auf der DB-Instanz unter verwendung eines Schlüssels.

- Gut: Dynamische Strukturierung (Flexibilität) bzw. Strukturfreiheit
- Gut: Schnellere Entwicklungszeit
- Gut: Bei vielen gleichzeitigen Zugriffen performanter als SQL (Hashing-Storage)
- Gut: Lesen von dokumentenbasierten DBs ist schneller, als bei SQL-DBs 
- Neutral: Skaliert horizontal
- Neutral: JSON als eine der zentralen Strukturen (Dokumentorientierung)
- Neutral: Beziehung nicht als Referenz, sondern in Form von eingebetteten Daten
- Schlecht: Schreiben/ Aktualisieren von dokumentenbasierten DBs ist langsamer, als bei SQL-DBs 
- Schelecht: Weniger flexible Anfragen
- Schlecht: Meist keine volle Unterstützung der ACID-Prinzipien

### Einfache JSON

Eine JSON, die z.B. im Root-Verzeichnis des Projekts liegt und auf die mittels der Node.js-eigenen Libraries (fs, path) zugegriffen werden kann. Eine Abfrage erfolgt unter Verwendung eines Schlüssels.

- Gut: Volle Kontrolle über die Daten
- Gut: Geringer Overhead für die Speicherung an sich (Nutzung von fs und path reicht aus)
- Gut: Schneller Zugriff (Lesen, Schreiben)
- Gut: Völlige Schemafreiheit
- Schlecht: Um die ACID-Prinzipien einhalten zu können, bedarf es weiterer Methoden und Libraries (z.B. Mutex, Queues) -> Erhöhtes Fehlerpotential (z.B. Dirty Read Problem)