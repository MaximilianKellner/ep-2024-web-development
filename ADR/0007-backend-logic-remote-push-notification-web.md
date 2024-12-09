# Remote Push Notification (Web-Push)

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 03-12-2024                                                 |
| deciders | [Oliver Russmann](https://github.com/orussmann)|

## Kontext und Problemstellung
Der Service-Nutzer soll benachrichtigt werden, sobald die Optimierung der Multimedia-Dateien abgeschlossen ist
und diese für ihn zum Download bereit stehen. Da unsere Anwendung als Web-Service angeboten wird, soll diese Benachrichtigung primär 
in Form einer Web Push Notification, die im Browser angezeigt wird, realisiert werden. Diese Benachrichtigungen sollten möglichst zuverlässig versendet werden.

## Entscheidungsfaktoren
- Zuverlässige und zeitnahe Zustellung der Benachrichtigung
- Einhaltung obligatorischer Protokolle und Standards

## Berücksichtigte Optionen
- [web-push](https://www.npmjs.com/package/web-push)
- [node-pushnotifications](https://www.npmjs.com/package/node-pushnotifications)


## Entscheidungsergebnis
Gewählte Option: Wir haben uns für Node-Pushnotifications entschieden,
 da es insgesamt mehr Funktionalitäten bietet und gleichzeitig die Web-Push-Bibliothek nutzt.

## Vor- und Nachteile der Optionen

### Web-Push
Eine Bibliothek, um einen Benachrichtigungsdienst zu implementieren, der das Web Push Protokoll einhält und bei dem die Nachrichten verschlüsselt werden,
gemäß der Spezifikation "Message Encryption for Web Push".  

- Gut: Ausführliche Code-Beispiele aus offizieller Quelle (MDN)   
- Schlecht: Steile Lernkurve

### Node-Notifications
Eine Bibliothek, um einen Multi-Platform-Benachrichigungsdienst zu implementieren, der selbst Web-Push nutzt.

- Gut: Multi-Platform Push Notifications (Apple Push Notification, Google Cloud Messaging, Windows Push Notification,
  Web-Push Notification and Amazon Device Messaging-Services)
- Gut: Erkennt automatisch, welcher Benachrichtigungstyp erforderlich ist
- Schlecht: Steile Lernkurve
