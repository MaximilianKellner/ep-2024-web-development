# Frontend Design

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 27-11-2024                                                 |
| deciders | [Maximilian Kellner](https://github.com/MaximilianKellner) |

## Kontext und Problemstellung

Wir benötigen eine Frontend-Sprache, die in der Lage ist, eine moderne, responsive und leistungsstarke Benutzeroberfläche zu erstellen.

## Entscheidungsfaktoren

- Bietet es wiederverwendbare Komponenten?
- Wie leistungsfähig ist es?
- Bietet es Optionen für Barrierefreiheit?

## Berücksichtigte Optionen

- HTML+CSS
- React

## Entscheidungsergebnis

Gewählte Option: "HTML+CSS", es ist möglich, ein leichtes Frontend zu schreiben, das responsiv und mit einer Vielzahl von Browsern kompatibel ist. Es gibt viele verfügbare Ressourcen, und es ist der Industriestandard.

## Vor- und Nachteile der Optionen

### HTML+CSS

HTML ist dei standard Markup language, die verwendet wird, um Inhalte im Web zu strukturieren, während CSS verwendet wird, um diese Inhalte zu gestalten und anzuordnen, wodurch die Erstellung von schönen und responsiven Webseiten möglich ist.

- Gut, HTML+CSS ist mit einer Vielzahl von Browsern kompatibel.
- Gut, HTML bietet eine lesbare Struktur, selbst wenn das Design nicht geladen wird.
- Neutral, der Code könnte mit einer Entwicklungspipeline optimiert werden.
- Schlecht, HTML bietet keine wiederverwendbaren Komponenten.

### React

React ist eine JavaScript-Bibliothek zur Erstellung von Benutzeroberflächen, die es ermöglicht, wiederverwendbare UI-Komponenten zu erstellen und den Zustand dynamischer Webanwendungen effizient zu verwalten.

- Gut, React ermöglicht die Erstellung wiederverwendbarer Komponenten, was die Modularität und Wartbarkeit des Codes fördert.
- Gut, React hat eine große und aktive Community, die umfangreiche Bibliotheken, Tools und Dokumentationen bereitstellt.
- Neutral, React erfordert einen Build-Prozess (z.B. mit Webpack oder Vite), was die Entwicklungseinrichtung komplexer macht.
- Schlecht, die Lernkurve von React kann steil sein.