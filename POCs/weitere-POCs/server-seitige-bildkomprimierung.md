## Optimale Server-seitige Bildkomprimierung

### Problem:
   * Große Bilddateien führen zu längeren Ladezeiten und einer höheren Serverbelastung.
   * Nutzer mit langsamer Internetverbindung haben eine schlechtere User Experience.
   * Unterschiedliche Endgeräte benötigen unterschiedliche Bildauflösungen, was ohne Optimierung zu unnötigem Datenvolumen führt.
   * Wiederholte Anfragen für dieselben Bilder verursachen unnötige Serverlas.t

### Stakeholder:
   * Endnutzer
   * Web-Administratoren
   * Content-Manager

### Scope:
   * Implementierung einer serverseitigen Bildkomprimierung mit optimalen Einstellungen für Qualität und Dateigröße.
   * Bereitstellung von dynamisch skalierten Bildversionen für verschiedene Endgeräte.
   * Einführung von Caching-Strategien zur Reduzierung des Downloadaufwands bei wiederholten Anfragen.

### Resources:
   * Bildverarbeitungsbibliotheken (z. B. ImageMagick, Sharp, Pillow)
   * Monitoring-Tools zur Analyse von Ladezeiten und Server-Performance

### Description:
   * Bilder werden mit einer optimierten Qualitätseinstellung (80-90%) gespeichert, um den besten Kompromiss zwischen Qualität und Dateigröße zu erreichen.
   * Es wird server-seitig solange ein bestimmtes Bild komprimiert, bis es die gewünschte Größe hat

### Success Criteria:
   * Die Ladezeiten von Bildern sind deutlich reduziert, ohne merkbaren Qualitätsverlust.
   * Die Serverlast bleibt stabil und wird nicht durch unnötige Bildverarbeitungsprozesse überlastet.
   * Nutzer erhalten optimierte Bilder, die für ihr Endgerät geeignet sind.
   * Wiederholte Bildanfragen werden effizient durch Caching bedient.

### Fail Criteria:
   * Bilder werden mit sichtbarem Qualitätsverlust ausgeliefert.
   * Der Server benötigt zu lange für die Bildkomprimierung und verursacht Verzögerungen.
   * Der Speicherverbrauch auf dem Server steigt durch zu viele gespeicherte Versionen eines Bildes unkontrolliert an.
   * Caching-Mechanismen funktionieren nicht, sodass Bilder bei jeder Anfrage neu generiert werden.

### Fallbacks:
   * Falls der Server ein Bild nicht komprimieren kann:
    * Das Originalbild wird ausgeliefert.
    * Der Fehler wird protokolliert und an den Administrator gemeldet.
   * Falls das WebP-Format vom Client nicht unterstützt wird:
    * Eine alternative Bildversion (JPEG oder PNG) wird ausgeliefert.
   * Falls die Bildgröße nach der Komprimierung immer noch zu groß ist:
    * Eine stärkere Komprimierung wird angewendet.
    * Dem Nutzer wird eine Meldung angezeigt, falls keine weitere Optimierung möglich ist.
   * Falls das Caching nicht greift:
    * Die Caching-Header werden angepasst und neu evaluiert.
    * Falls nötig, wird das Caching auf Dateiebene optimiert.

