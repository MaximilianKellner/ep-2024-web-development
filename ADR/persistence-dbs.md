# Persistence DBS

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
- Unterstützung der ACID-Prinzipien
- Unterstützung von Transaktionen
- Einfacher Einstieg
- 

## Berücksichtigte Optionen
- MongoDB
- CouchDB
- CouchBase
- Postresql
- MySQL

## Entscheidungsergebnis
Wir haben uns für eine SQL-Lösung entschieden. Das ausschlaggebende Argument ist die Einhaltung der ACID-Kriterien und die Möglichkeit, DB-Queries als Transaktionen durchzuführen.
Diese Aspekte sind einerseits relevant, weil unsere Anwendung im Mehrbenutzerbetrieb arbeitet. Andererseits wächst mit der Erweiterung der Anwendung die Komplexität und damit die Ansprüche an die Queries.
Zwar gibt es mit z.B. Couchbase auch NoSQL-DBS, die komplexe Queries mit JOINs unterstützen, aber diese Lösungen sind dort nicht in Gänze umgesetzt, wie etwa bei Postgresql.
Was Geschwindigkeit von Schreib-Operationen angeht, erwarten wir von einem RDBMS eine bessere Performanz gegenüber den NoSQL-Alternativen.
<br>Postresql hat alle Funktionalitäten von MySQL, aber darüber hinaus noch MVCC, was für den Mehrbenutzerbetrieb wichtig ist. Zudem ist es völlig kostenlos und bietet stellt somit eine massive Kostenersparnis dar.

## Vor- und Nachteile der Optionen

### MySQL

Ein rein relationales DBMS. 

- Gut: Open Source
- Gut: ACID-konform (bei Nutzung von z.B. Inno-DB)
- Gut: Unterstützt alle gängigen Datentypen, inklusive JSON.
- Gut: Bekannter SQL-Dialekt
- Schlecht: Kein MVCC

Abo-Modelle:
- Community Edition (Free)
- Standard Edition
- Enterprise Edition

### Postgresql

Das populärste RDBMS für Node.js. Es ist ein Objekt-RDMS und speichert Daten als Objekte (Vererbung möglich).
<br>Es existiert bereits seit 1986.

- Gut: Open Source
- Gut: Vollständig ACID-konform
- Gut: MVCC (Multi Version Concurrency Control), garantiert gleichzeitiges Lesen und Schreiben
- Gut: Unterstützt alle MySQL-Datentypen, und mehr (z.B. Arrays)
- Neutral: Schwerere Einstieg, als in MySQL
- Neutral: Teils starke Unterschiede zum SQL-Dialekt, das das Entwickler-Team beherrscht
- Neutral: Steilere Lernkurve


Abo-Modelle:
- Free (Open Source Lincense)

### MongoDB

Das populärste DBS für Node.js. Ein "general purpose", dokumentenbasiertes DBS, das die Daten im BSON-Format (Binary JSON) speichert. Dabei können Dokumente in Gruppen verwaltet werden.
Intern werden die Daten als Nodes verwaltet.

- Gut: Open Source
- Gut: Schemafreiheit
- Gut: Multi-Dokument ACID-Transaktionen
- Gut: Concurrency
- Gut: Durability
- Gut: Cache
- Gut: Built-in Admin-Console
- Gut: Loadbalancing über Nodes 
- Gut: Unterstützt Transaktionen
- Gut: Vordefinierte Datentypen
- Neutral: Eigene Query-Language

Abo-Modelle:
- Shared (Free)
- Serverless
- Dedicated

### CouchDB

Ein "general purpose", dokumentenbasiertes DBS, das Daten im JSON-Format speichert.

- Gut: Open Source
- Gut: Schemafreiheit
- Schlecht: Eventual Consistency
- Schlecht: Keine Transaktionen
- Schlecht: Keine Durability
- Schlecht: Kein Cache

Abo-Modelle:
- Free

### Couchbase

Ein "general purpose", dokumentenbasiertes DBS, das Daten im JSON-Format speichert.

Abo-Modelle:
- Free
- Basic
- Developer
- Enterprise

- Gut: Open Source
- Gut: Schemafreiheit
- Gut: ANSI-Erweiterung (SQL++ als eigener SQL-Dialekt, Document-JOINS)
- Gut: Concurrency
- Gut: Durability
- Gut: Cache
- Gut: Built-in Admin-Console
- Gut: Loadbalancing über Nodes
- Gut: Unterstützt Transaktionen 
- Schlecht: Eingeschränkte Unterstützung von ACID-Transaktionen für mehrere Dokumente
