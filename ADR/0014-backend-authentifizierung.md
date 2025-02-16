# Authentifizierungsverfahren

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | completed                                                |
| date     | 16-02-2025                                                 |
| deciders | [Yassin El Fraygui](https://github.com/Yasabi04) |

## Kontext und Problemstellung

Um neue Nutzer anzulegen muss sich ein Admin zuerst anmelden können. Dafür werden Konten für Administratoren angelegt in denen Nutzername und Passwort gespeichert werden. Nach einem erfolgreichen Login kann der Admin nun neue Kunden anlegen und bestehende bearbeiten. Das Problem ist jedoch, dass bei einem Teilen des Links das Anmeldeformular nicht neu erfüllt werden muss, sondern das System denkt, dass weiterhin ein authorisierter Administrator eingelogt ist. Um dieses Problem zu beheben muss ein tiefergehendes Authentifizierungsverfahren implementiert werden.

## Entscheidungsfaktoren

- Sicherheit/Datenintegrität
- Verhältnismäßigkeit

## Berücksichtigte Optionen

- JWT-Authentifikation
- Session-Based Authentifizierung


## Entscheidungsergebnis

- JWT-Authentifikation

## Vor- und Nachteile der Optionen

### JWT-Authentifizierung

JWT (JSON Web Token) ist ein kompaktes, URL-sicheres Token-Format, das zur Authentifizierung und Authorisierung verwendet wird. Der Token wird bei jedem Request den der Client an den Server schickt im Header mitgesendet und server-seitig überprüft.

- Gut, da gut geeignet bei Hinzuziehen von weiteren Servern
- Gut, da bei vielen Nutzern der Server nicht mehrere Sessions speichern muss
- Schlecht, da große Payload-Größe -> Erhöhung Netzwerklast

### Session-Based Authentifizierung

Session-based Authentifizierung ist ein zustandsbehaftetes Verfahren, bei dem der Server eine Sitzung speichert, um Benutzer zu authentifizieren. Jedem Nutzer wird in einer Datenbank eine Session ID zugeschrieben, bei der bei jedem Request den der Client an den Server sendet überprüft wird, ob die zugeteilte Session ID des Nutzers in der Datenbank gespeichert ist.

- Gut, da Session serverseitig gespeichert, kein Risiko von Token-Manipulation.
- Schlecht, da hoher Ressourcenaufwand
- Schlecht, auf Grund von Implementierung zusätzlicher Datenbank
- Schlecht, auf Grund von dauerhaftem Zugriff auf Datenbank
