# Web-Framework

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 03-12-2024                                                 |
| deciders | [Oliver Russmann](https://github.com/orussmann) |

## Kontext und Problemstellung
Das Web Framework ist zuständig für die Kommunikation zwischen Client und Server mittels HTTP. Hierüber kann eine RESTful API realisiert werden.
Dazu bietet ein solches Framework eine Menge nützlicher Funktionen, die als Middleware zusammengefasst werden können, wie z.B. Compression oder Multer.
Diese Features sind essentiell für eine Anwendung, in der die Übertragung von größeren Mengen an Multimedia-Dateien eine zentrale Rolle einnimmt.
Zudem vereinfacht ein Framework die Implementierungsarbeit, da es mit seinen Funktionen eine Abstraktion von Node.js-nativen Funktionen bietet.

## Entscheidungsfaktoren
- Vereinfachung der Architektur
- Essentielle Funktionen wie Routing, Serialization, asynchrone Aufrufe, Caching, File Uploads
- Zuverlässige Verarbeitung von simultanen Requests und größeren Dateien
- Unterstützung von Server-sent Events
- Unterstützung von SQL und NoSQL
- Leichtgewichtig
- Flache Lernkurve

## Berücksichtigte Optionen
- Express
- Fastify
- Vanilla JS Implementierung

## Entscheidungsergebnis
Gewählte Option: Auf den ersten Blick erscheint Fastify als die bessere Lösung.
Da die Mehrheit unseres Teams mehr Erfahrung mit Express hat und unsere Entwicklungszeit sehr begrenzt ist, haben wir uns für Express entschieden. 

## Vor- und Nachteile der Optionen

### Express
Express.js ist ein serverseitiges Webframework für die JavaScript-basierte Plattform Node.js.
Es erweitert Node.js um Werkzeuge, mit denen das Entwickeln moderner Webanwendungen einfacher gestaltet wird.

- Gut: Große Community und viele Codebespiele
- Gut: Gute und ausführliche Dokumentation
- Gut: Modularisierbarkeit
- Gut: Unterstützt async-await
- Gut: Unterstützt die wichtigsten DBS

### Fastify
Fastify ist ein Web-Framework, das primär dafür entwickelt wurde, die beste Entwickler-Erfahrung mit dem geringsten Overhead und einer leistungsstarken Plugin-Architektur zu bieten.
Dessen Entwicklung wurde durch Express inspiriert.

- Gut: Gute und ausführliche Dokumentation
- Gut: Unterstützt async-await
- Gut: Bessere Performance und Ressourcenverbrauch
- Gut: Mehr built-in Middleware (sogenannte Plugins)
- Gut: Built-in Server-sent Events, Caching, Parser, Serializer, Compressor, File Uploads
- Gut: Unterstützt die wichtigsten DBS
- Neutral: Kleinere Community
- Neutral: Weniger Third-Party Extensions

### Vanilla JS Implementierung 
Implementierung eines Web-Servers unter Nutzung der Node.js-eigenen Module und Third-Party Packages.

- Gut: Erhöhte Stabilität und Kompatibilität durch Nutzung nativer Node.js Packages
- Schlecht: Längere Entwicklungszeit
- Schlecht: Höhere Fehleranfälligkeit
- Schlecht: Funktionalitäten, die out-of-the-box fehlen (z.B. Body-Parser)
