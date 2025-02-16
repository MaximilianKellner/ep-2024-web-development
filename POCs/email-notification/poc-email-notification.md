## Benachrichtigung mit Downloadoption an Service-Nutzer senden (E-Mail):

### Problem:
* Große Uploads können eine längere Zeitdauer in Anspruch nehmen. Im Sinne einer guten UX kann dem Service-Nutzer nicht zugemutet werden, auf die Beendigung des Uploads und der Konvertierung zu warten
* Dafür möchte der Service-Nutzer den Download der konvertierten Dateien auf einen späteren Zeitpunkt verlegen.
* Der Service-Nutzer möchte die konvertierten Dateien von einem anderen Gerät aus öffnen (über E-Mail Client)
### Stakeholder:
* Service-Nutzer
* Content Manager

### Scope:
* Implementierung eines HTTP-Servers, der nach Abschluss der Konvertierung den ensprechenden Nutzer per Mail über den Status seines Uploads und der Konvertierung informiert.

### Resources:
* HTTP-Client (Postman)
* HTTP-Server
* E-Mail Versanddienst (Mailersend API)

### Description:
* Der Client schickt einen POST request an den Server:
 <br>->E-Mail an Service-Nutzer abschicken, wenn die Convertierung fertig.
* Der Server antwortet mit Statuscode 200.
* Der Server wartet, bis die Konvertierung der Dateien fertig ist.
* Der Server erstellt eine Nachricht, die den Link enthält, der zum Download-bereich des Service-Nutzers führt.
* Der Server verschickt die Nachricht über einen SMTP-Service an die E-Mail Adresse des Service-Nutzers.

### Success Criteria:
* Die Benachrichtigung über den Status des Konvertierung erreicht das Postfach des Service-Nutzers innerhalb von X Minuten.
* Der in der E-Mail enthaltene Link führt zum persönlichen Upload-Bereich des Service-Nutzers.

### Fail Criteria:
* Der Zustellversuch scheitert:
<br>-> 550 5.1.1. User unknown, 550 MAILBOX NOT FOUND, ... (Bezeichnung abweichend, je nach Implementierung und Grund)
<br>-> 552 Mail size limit exceeded
<br>-> Connection Timed Out
<br>-> Domain Not Found
<br>-> Relay Access Denied
<br>-> Spam Blocks

### Fallbacks:
* Bei fehlgeschlagener Zustellung:
<br>-> Nach X Minuten werden Y erneute Sendeversuche unternommen (je nach Error).
<br>-> Der Server antwortet mit Statuscode 400.
<br>-> Client-seitig wird der Nutzer darüber informiert, dass der Zustellversuch gescheitert ist und welche möglichen Lösungsansätzen es für ihn gibt (E-Mail Adresse validieren, Spam-Filter prüfen, Postfach leeren)
<br>-> Content Manager benachrichtigen.

### Outcome:
