# Docker als Containerisierungstechnologie

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | completed                                                |
| date     | 04-01-2025                                                 |
| deciders | [Yassin El Fraygui](https://github.com/Yasabi04) |

## Kontext und Problemstellung

Um zu entscheiden, ob sich Docker für uns als Containerisierungstechnologie lohnt, müssen geschaut werden, ob sich der Entwicklungsprozess durch dessen Implementation vereinfacht.

## Entscheidungsfaktoren

- Wie einfach ist die Integration?
- Merhwert für das Projekt?

## Berücksichtigte Optionen

- Docker für Containerisierung
- Kein Docker und somit keine Containerisierung

## Entscheidungsergebnis

Gewählte Option: "Kein Docker": Während Docker für einige Anwendungsfälle erhebliche Vorteile bietet, ist es für unsere spezifischen Anforderungen auf Grund einer größeren Komplexität im Projektrahmen nicht die richtige Wahl.

## Vor- und Nachteile der Optionen

### Pro

Docker ist eine open-source Platform zur Conatinerisierung, die es Applikationen erlaubt, in einer isolierten und somit gesicherten Umgebung zu laufen.

- Gut, weil es eine gute Integration mit CI/CD-Tools gibt (Vorteil bei häufigen Änderungen und damit Deployment von Code)
- Gut, da es bereits eine große Anzahl von verfügbaren, offiziellen Docker Images gibt
- Gut, da es eine große Community gibt
- Gut, da wir bereits ein Hintergrundwissen zu Docker besitzen (-> flache Lernkurve -> beschleunigter Projektstart)
- Gut, auf Grund von einfacher Dokumentationsmöglichkeiten innerhalb des Dockerfile
- Gut, da gute Integration in die IDE (VS Code)
- Schlecht, da es zu einer potenziellen Abhängigkeit von Docker Hub kommen kann
- Schlecht, da es zu möglichen Lizenzänderungen durch Docker Hub kommen kann


### Contra

Docker ist eine open-source Platform, die von Docker Hub geführt wird.

- Gut, da es ein simpleres Setup gibt, ohne externe Tools (wie Docker)
- Schlecht; es kann zu einem Lock-In-Effekt kommen
- Schlecht; mögliche Performance-Nachteile gegenüber nativer Lösungen
- Schlecht; das Deployment kann auf Grund (ständiger) Security-Updates verzögert werden
