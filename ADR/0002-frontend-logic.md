# Frontend Logic

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 26-11-2024                                                 |
| deciders | [Maximilian Kellner](https://github.com/MaximilianKellner) |

## Kontext und Problemstellung

Um ein Frontend zu schreiben, das in der Lage ist, Daten-Eingaben, Uploads und Serveranfragen zu verarbeiten, ist eine gewisse Logik erforderlich.


## Entscheidungsfaktoren

- Wie einfach ist die Integration?
- Wie schwer ist es zu lernen?
- Wie performant ist es?
- Ist es möglich, Dateien zu verarbeiten?

## Berücksichtigte Optionen

- JavaScript
- TypeScript

## Entscheidungsergebnis

Gewählte Option: "JavaScript", weil wir damit bereits vertraut sind, viele Ressourcen verfügbar sind und es der Industriestandard ist.

## Vor- und Nachteile der Optionen

### JavaScript

JavaScript ist eine vielseitige, high-level Programmiersprache, die hauptsächlich für dynamische und interaktive Webanwendungen sowohl auf der Client- als auch auf der Serverseite verwendet wird.

- Gut, JavaScript wird von allen modernen Browsern weitgehend unterstützt.
- Gut, JavaScript-Grundlagen sind leicht zu erlernen, und wir haben bereits eine solide Grundlage.
- Gut, JavaScript kann über den gesamten Stack hinweg verwendet werden.
- Schlecht, die dynamische Typisierung von JavaScript kann zu unerwarteten Laufzeitfehlern führen und das Debuggen erschweren.
- Schlecht, die Single-Threaded-Natur von JavaScript kann zu Leistungsengpässen bei CPU-intensiven Aufgaben führen.
- Schlecht, Sicherheitslücken wie Cross-Site Scripting (XSS) sind häufige Probleme, wenn JavaScript nicht sicher implementiert wird.

### TypeScript

TypeScript ist eine statisch typisierte Obermenge von JavaScript, die zu reinem JavaScript kompiliert und erweiterte Werkzeuge und Typsicherheit für groß angelegte Anwendungen bietet.

- Gut, die statische Typisierung von TypeScript hilft, Fehler zur Kompilierzeit zu erkennen und verringert die Wahrscheinlichkeit von Laufzeitfehlern.
- Gut, TypeScript verbessert die Wartbarkeit und Lesbarkeit des Codes, insbesondere in großen Codebasen, durch klare Typen und Schnittstellen.
- Neutral, TypeScript erfordert einen Kompilierungsschritt, der den Build-Prozess verkomplizieren und die Entwicklung verlangsamen kann, aber möglicherweise die Laufzeitleistung verbessert.
- Schlecht, Entwickler müssen Typannotationen und TypeScript-spezifische Funktionen erlernen und übernehmen, was eine steilere Lernkurve im Vergleich zu JavaScript haben kann.
- Schlecht, das Typsystem von TypeScript kann für kleinere Projekte oder einfache Skripte manchmal übertrieben sein und zu unnötiger Komplexität führen.
