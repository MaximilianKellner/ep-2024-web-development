# E-Mail Notification

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 12-12-2024                                                 |
| deciders | [Oliver Russmann](https://github.com/orussmann) |

## Kontext und Problemstellung
Der Service Nutzer soll die Möglichkeit haben, eine Benachrichtigung per E-Mail zu erhalten, wenn die optimierten Dateien zum Download bereit stehen.
Hierfür wird ein E-Mail-Service Anbieter benötigt, der zuverlässig E-Mails verschicken kann - auch an mehrere Nutzer, die zu einer Gruppe gehören.
So eine E-Mail enthält den Link zum persönlichen Download-Bereich des Service Nutzers. 

## Entscheidungsfaktoren
- Zuverlässigkeit der Zustellung, z.B Benachrichtigung, wenn E-Mail als Spam markiert wurde
- Gute Kompatibilität mit Node.js
- Anpassbarkeit des Inhalts der Mail, um dem Nutzer eine Übersicht über die Optimierungsergebnisse zu geben 
- Error Response, z.B. bei gescheitertem Zustellversuch
- Analytics und Logs, um dem für Content-Manager Möglichkeiten für Debugging zu bieten
- Gruppenzustellung, im Falle, dass ein Upload für mehrere Service Nutzer gedacht ist
- Verschlüsselung anhand geläufiger Standards
- Leicht verständliche und ausführliche Dokumentation
  
## Berücksichtigte Optionen
- Nodemailer
- Mailersend
- Mailtrap

## Entscheidungsergebnis
Wir haben uns für Nodemailer entschieden, weil dieses Tool die meisten Einstellungsmöglichkeiten bietet und das NPM Modul Nr. 1 ist, wenn es um E-Mail Versand geht.
Ein Bonus ist, dass es mit der API von Mailtrap integriert werden kann und damit einen sicheren Transportweg bietet.

## Vor- und Nachteile der Optionen

### Nodemailer
Ein Node.js Modul für den Versand von E-Mails. 

- Gut: Ein NPM Modul mit 0 Abhängigkeiten -> mehr Sicherheit und Stabilität
- Gut: Bulk Delivery
- Gut: Templates (Einbettung von Bildern möglich)
- Gut: Personalisierung
- Gut: Sicherere Versand mittels TLS/STARTTLS
- Gut: Authentifizierung mittels OAuth2
- Gut: Sichere Übertragung mittels DKIM
- Gut: Viele Anpassungsoptionen (Versandzeitpunkt, Datenlimitierung, ...)
- Gut: Ausführliche Dokumentation und viele Codebeispiele
- Gut: Große, aktive Entwickle- Neutral: Anhängercommunity
- Neutral: Anhänge versenden
- Neutral: Unterstützung von Unicode
- Neutral: Erweiterung durch Module wie mailauth (erweiterte Sicherheit)
- Neutral: Kann verschiedene SMTP-Server Provider nutzen, wie z.B. Mailtrap

### Mailersend
Ein RESTful API-Service, um E-Mails zu verschicken.  

- Gut: Integration mit anderen Web Diensten (z.B. Firebase)
- Gut: Bulk Delivery
- Gut: Templates (Einbettung von Bildern möglich)
- Gut: Personalisierung
- Gut: Sicherere Versand mittels TLS
- Gut: Sichere Übertragung mittels DKIM
- Gut: Viele Anpassungsoptionen (Versandzeitpunkt, Datenlimitierung, ...)
- Gut: Ausführliche Dokumentation und viele Codebeispiele
- Neutral: Anhänge versenden

### Mailtrap
Ein RESTful API-Service, um E-Mails zu verschicken.

- Gut: Templates (Einbettung von Bildern möglich)
- Gut: Bulk Delivery
- Gut: Viele Testing-Module (eigene API-Docs)
- Gut: Sehr viele Video-Tutorials
- Neutral: Vergleichsweise kleine Dokumentation
- Neutral: Anhänge versenden
