# Backend

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 03-12-2024                                                 |
| deciders | [Oliver Russmann](https://github.com/orussmann) |

## Kontext und Problemstellung

Das Backend ist primär für die Optimierung der Multimedia-Dateien, die Persistierung und Verwaltung der Daten und die Benachrichtigung 
der Nutzer zuständig.
Es werden somit sehr unterschiedliche APIs und Bibliotheken benötigt.
Diese müssen im Rahmen einer Software-Integration möglichst konfliktfrei funktionieren und einfach zu implementieren sein.

## Entscheidungsfaktoren

- Zugriff auf das Dateisystem
- Anbindung an relationale Datenbanken
- Verfügbarkeit von populären Multimedia-Optimierungs-APIs/ -Packages
- Gute Dokumentation
- Flache Lernkurve
- Leichtgewichtig

## Berücksichtigte Optionen

- Node.js + Express
- Deno + Express
- Bun + Express
- NestJS
- Spring Boot

## Entscheidungsergebnis

Gewählte Option: Node.js hat das größte Ökosystem und bietet mit dem Node Packet Manager die größte Auswahl an Libraries. Deno und Bun sind relativ junge Laufzeitumgebungen und bieten nicht die Stabilität von Node.js. NestJS und Spring Boot sind für unser Projekt zu schwergewichtig, was die mitgelieferten Abhängigkeiten angeht.

## Vor- und Nachteile der Optionen

### Node.js + Express
Node.js ist eine plattformübergreifende Open-Source-JavaScript-Laufzeitumgebung, die JavaScript-Code außerhalb eines Webbrowsers ausführen kann.

- Gut: Große Community und viele Codebeispiele
- Gut: JS auch im Backend, damit schnellere Entwicklungszeit
- Gut: Cross-Platform Compatibilität
- Gut: Großes Ökosystem von Libraries durch NPM
- Gut: Leichtgewichtiger als ein Framework wie etwa Spring Boot
- Gut: Built-in Data Storage (SQLite)
- Neutral: Unterstützung der meisten Web-APIs

### Deno + Express
Deno ist eine Laufzeitumgebung für JavaScript und TypeScript, die auf der V8-JavaScript-Engine basiert.

- Gut: Support von NPM (z.B. Sharp für Bildkonvertierung)
- Gut: Leichtgewichtiger als ein Framework wie etwa Spring Boot
- Gut: Ressourcenschonender als Node.js
- Gut: Schneller als Node.js
- Gut: Erhöhte Code-Qualität durch built-in Formatter und Linter
- Gut: Security-first Konzept
- Gut: Unterstützung aller Web-APIs
- Gut: Native Deployment Umgebung (Deno Deploy)
- Neutral: Kein built-in Data Storage
- Schlecht: Kleine Community und weniger Codebeospiele
- Schlecht: Nicht so stabil wie Node.js

### Bun + Express
Bun ist eine All-in-One-JavaScript-Laufzeit und ein Toolkit, das auf Geschwindigkeit ausgelegt ist und einen Bundler, einen Testläufer und einen Node.js-kompatiblen Paketmanager enthält.

- Gut: Support von NPM (z.B. Sharp für Bildkonvertierung)
- Gut: Schneller als Node und Deno
- Gut: Ressourcenschonender als Node.js als Deno
- Gut: Unterstützung aller Web-APIs
- Gut: Built-in Data Storage (SQLite)
- Neutral: Schnellere Installation von NPM-Packages
- Schlecht: Kleine Community und weniger Codebeospiele
- Schlecht: Nicht so stabil wie Node.js und Deno
- Schlecht: Unterstützt bei weitem nicht alle NPM-Packages

### NestJS
NestJS ist ein progressives Node.js Framework für den Bau von effizienten und skalierbaren serverseitigen Anwendungen.

- Gut: Support von NPM (z.B. Sharp für Bildkonvertierung)
- Gut: Viele built-in Module mit potentiell geringen Kompatibilitäts- und Stabilitätsproblemen (HTTP-Server, Securiy, Middleware, ..) 
- Gut: Gute Code-Struktur, Skalierbarkeit und Wartbarkeit, da NestJS der MVC-Architektur folgt
- Gut: Static Typing dank TS
- Schlecht: Schwergewichtig, viel Overhead
- Schlecht: Steile Lernkrurve

### Spring Boot
Das Spring Framework (kurz Spring) ist ein quelloffenes Framework für die Java-Plattform, welches oft für Web-Anwendungen verwendet wird. Ziel des Spring Frameworks ist es, die Entwicklung mit Java/Java EE zu vereinfachen und gute Programmierpraktiken zu fördern.
Spring Boot bietet die Möglichkeit eine Spring-Applikation nach dem Konvention-vor-Konfiguration-Prinzip zu erstellen, die alle notwendigen Komponenten mitbringt und keinen externen Application Server benötigt.

- Gut: Viele built-in Module mit potentiell geringen Kompatibilitäts- und Stabilitätsproblemen (HTTP-Server, Securiy, Middleware, ..) 
- Gut: Gute Code-Struktur, Skalierbarkeit und Wartbarkeit, da Spring der MVC-Architektur folgt
- Static Typing dank Java u. Kotlin
- Schlecht: Schwergewichtig, viel Overhead
- Schlecht: Steile Lernkrurve
- Schlecht: Keine Unterstützung von Sharp (als unserer primären Wahl für Bildkonvertierung)
