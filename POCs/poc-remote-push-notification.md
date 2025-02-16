## Benachrichtigung mit Downloadoption an Service-Nutzer senden (Remote Push Notification)

### Problem:
* Große Uploads können eine längere Zeitdauer in Anspruch nehmen. Im Sinne einer guten UX kann dem Service-Nutzer nicht zugemutet werden, auf die Beendigung des Uploads und der Konvertierung zu warten.
* Der Nutzer möchte so bald wie möglich über den Zustand seines Uploads informiert werden, unabhängig seines Aufenthaltsorts.

### Stakeholder:
* Service-Nutzer
* Content Manager

### Scope:
* Implementierung eines HTTP-Servers, der nach Abschluss der Konvertierung den ensprechenden Nutzer per Push Notification über den Status seines Uploads und der Konvertierung informiert.
* Primär: Web-Push Notifications.

### Resources:
* HTTP-Client (Webbrowser, obligatorisch)
* HTTP-Server
* Android-Device (optional)
* iOS-Device (optional)
* Push Notification Service

### Description:
* Der Client überprüft, ob die notwendigen Berechtigungen erteilt wurden (wenn nein, Berechtigungen abfragen).
* Der Client schickt einen POST request an den Server:
<br>->Push Notification an Service-Nutzer abschicken, wenn die Convertierung fertig.
* Der Server wartet, bis die Konvertierung der Dateien fertig ist.
* Der Server erstellt eine Nachricht, die den Link enthält, über den die konvertierten Dateien zugänglich sind.
* Der Server verschickt die Nachricht über einen Push-Notication-Service an das Device des Service-Nutzers.
* Über einen Click auf die Push-Notification öffnet sich ein neues Browser-Fenster, das die optimierten Dateien anzeigt.

### Success Criteria:
* Die Benachrichtigung über den Status der Konvertierung (Fail, Success) erscheint auf dem Device-Screen in X Millisekunden nach Vollendung der Konvertierung:
<br>-> Auf Android und iOS.
<br>-> Alle mit dem Link assozierten Service-Nutzer und beim Push-Notification Service registrierten Service-Nutzer erhalten die Notification.
* Der in der Push Notification enthaltene Link öffnet die Website mit dem Download-Bereich der Service-Nutzers.
* Der in der Push Notification enthaltene Link (nicht der selbe wie oben) initiiert den Download (Dateien aus dem letzten Konvertierungsauftrag).

### Fail Criteria:
* Der Service-Nutzer hat nicht den notwendigen Notification-Service Permissions zugestimmt.
* Der Browser unterstützt Service Worker nicht.

### Fallbacks:
* Client hat nicht die nötigen Permissions gesetzt:
<br>-> Service-Nutzer darüber informieren, dass er die Permissions setzten muss.
* Push-Notification-Service wird ganz oder teilweise nicht untersützt:
<br>-> Service-Nutzer darüber informieren, einen unterstüzten Browser zu verwenden.
<br>-> Content Manager benachrichtigen.

### Outcome:
