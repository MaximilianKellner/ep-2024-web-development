## JWT-Authentifikation

### Problem:
* Die sichere Authentifizierung von Nutzern erfordert eine Methode, die sowohl sicher als auch performant ist.
* Sitzungsbasierte Authentifizierung kann Skalierungsprobleme verursachen und ist nicht ideal für moderne Webanwendungen.
* Nutzer müssen nach erfolgreicher Anmeldung sicher identifiziert werden, ohne dass sensible Daten mehrfach übertragen werden.

### Stakeholder:
* Service-Nutzer
* Administratoren
* Backend-Entwickler

### Scope:
* Implementierung eines Authentifizierungsmechanismus auf Basis von JWT (JSON Web Token)
* Nutzung von JWT zur Verifikation und Autorisierung von Nutzeranfragen.
* Primär: Webanwendungen, API-basierte Systeme.

### Resources:
* HTTP-Client (Webbrowser, Postman)
* HTTP-Server
* JWT-Bibliothek (s. jsonwebtoken für Node.js)
* (Datenbank zur Nutzerverwaltung -> für spätere Entwicklungen!)

### Description:
* Client sendet  POST-Request mit Login-Daten (Benutzername und Passwort) an Server
* Server validiert die Anmeldedaten und überprüft die gegen Datenbank
* Bei Erfolg:
  -> Der Server generiert ein JWT, das relevante Nutzerinformationen enthält (in unserem Fall Gültigkeitsdauer)
  -> Token wird an den Client zurückgegeben und in localStorage gespeichert
* Client sendet bei nachfolgenden Anfragen das Token im Authorization-Header (`Bearer <JWT>`).
* Server überprüft bei jeder Anfrage das Token:
  -> Falls gültig, wird die Anfrage autorisiert
  -> Falls ungültig, abgelaufen oder nicht vorhanden, wird Zugriff verweigert

### Success Criteria:
* Admins können sich mit validen Anmeldedaten authentifizieren und erhalten ein gültiges JWT
* Autorisierte Anfragen mit gültigem JWT werden erfolgreich verarbeitet
* Ungültige oder manipulierte JWTs führen zu 401 Fehler (Unauthorized Access)
* Tokens sind signiert und nicht manipulierbar

### Fail Criteria:
* Ungültige oder abgelaufene JWTs verhindern den Zugriff.
* Nutzer versuchen, ein manipuliertes JWT zu senden.
* JWT-Token wird in unsicherem Speicher (z. B. LocalStorage ohne Schutz) abgelegt.

### Fallbacks:
* JWT abgelaufen:
  -> Implementierung eines Refresh-Tokens, um ein neues JWT zu generieren.
* Token wurde veröffentlicht:
  -> Möglichkeit, Tokens in einer Blocklist zu speichern und ungültig zu machen (Modifikation der .env-Datei)
* Serverfehler bei der Token-Verarbeitung:
  -> Logging und Monitoring zur schnellen Fehleranalyse

### Outcome:
* Sichere und skalierbare Nutzer-Authentifizierung mit JWT
* Effiziente Zugriffskontrolle ohne serverseitige Sitzungsverwaltung (!)
* Verbesserte Benutzererfahrung durch tokenbasierte Authentifizierung

