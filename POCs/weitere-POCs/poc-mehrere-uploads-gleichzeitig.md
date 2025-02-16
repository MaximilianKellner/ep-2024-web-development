## Mehrere Uploads gleichzeitig

### Problem:
   * Ab einer bestimmten Anzahl parallel ablaufender Client-Requests pro Zeiteinheit bzw. ab einem bestimmten aufkommenden Datenvolumen kann der Server die übertragenen Datenpakete nicht mehr verarbeiten.
   * Je länger der Upload dauert, desto höher ist auch das Risiko, dass der Upload abgebrochen wird (durch Nutzer, durch Server, Netz-bedingt).
   * Je mehr gleichzeitige Uploads stattfinden, desto höher die Wahrscheinlichkeit, dass die Serverauslastung ihr Maximum erreicht.
   * Je länger der Server eine Nutzeranfrage verarbeitet, desto länger bleiben seine Ressourcen reserviert.

### Stakeholder:
   * Service-Nutzer
   * Content Manager

### Scope:
   * Implementierung eines HTTP-Clients, der einen Web-Server hinsichtlich seiner beschränkten und bestimmbaren Ressourcen (Speicher, CPU, Connection Pool) testet.
   * Installation einer Umgebung, um die Auslastung des Servers zu überwachen.

### Resources:
   * HTTP-Client (Postman)
   * HTTP-Server
   * Monitoring Tools (Wireshark, …)
   * Load Testing Tools

### Description:
   * Der Client schickt POST-Request mit Dateien an Server
   * Der Server empfängt alle Dateien vollständig und schickt dann einen Response mit Statuscode 200.

### Success Criteria:
   * Alle Dateien sind vollständig hochgeladen worden, keine der Dateien ist beschädigt und der Server kann weiterhin Requests verarbeiten.

### Fail Criteria:
   * Alle Ressourcen des Servers sind soweit ausgelastet, dass er keine Requests mehr verarbeiten kann -> Server antwortet nicht.
   * Mindestens ein Upload ist unvollständig bzw. fehlerhaft und die dazugehörigen Dateien sind beschädigt.
   * Client- und Server-Status-Informationen zum Upload weichen voneinander ab.
   * Dateien liegen bereits (ganz oder teilweise) Server-seitig vor

### Fallbacks:
   * Der Server verwirft Client-Anfragen, bei drohender Komplett-Auslastung:
   <br>-> Der Server antwortet mit passendem HTTP-Statuscode (503 [Service Unavailable], 429 [Too Many Requests]) und Response-Header (Retry-After).
   <br>-> Der Client zeigt dem Service-Nutzer eine passende Nachricht an (Aufklärung über Server-Überlastung).
   * Der Upload wird wird abgebrochen:
   <br>-> Der Server antwortet mit Statuscode 400 (Bad Request).
   <br>-> Die (nicht) erfolgreich hochgeladenen Dateien werden dem Service-Nutzer demensprechend markiert angezeigt.
   * Bei einem wiederholten Upload (Datei liegt serverseitig vor):
   <br>-> Der Server antwortet mit Statuscode 409 (Conflict).
   <br>-> Die bereits erfolgreich hochgeladenen Dateien werden dem Service-Nutzer demensprechend markiert angezeigt.
   * Die Dateigröße des (Batch-)Uploads übersteigt das verfügbare Upload-Limit:
   <br>-> Der Server antwortet mit Statuscode 402 (Payment Required).
   <br>-> Dem Service-Nutzer wird dies unmittelbar (vor Upload auf den Server) angezeigt (Auswahl der Dateien anpassen, Upload-Limit anpassen)
   * Wenn der Client-Request länger als X Sekunden keine Datenpakete sendet:
   <br>-> Der Server antwortet mit Statuscode 408 (Request Timeout).
   <br>-> Der Server schließt die Verbindung.
   <br>-> Dem Service-Nutzer wird eine entsprechende Meldung angezeigt (Upload neu starten).

### Outcome:
