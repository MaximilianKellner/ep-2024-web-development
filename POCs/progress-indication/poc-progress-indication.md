## Progress Indication

### Problem:
* Upload, Download und Komprimierung von größeren Dateimengen kann, je nach Server- und Netz-Auslastung, eine längere Zeit dauern.
* Als Service-Nutzer möchte man zu jedem Zeitpunkt darüber in Kenntnis gesetzt werden, in welchem Zustand der Service sich gerade befindet (wartend, Download, Upload, ..), wie lange sich der Service noch in diesem Zustand befinden wird und welche Probleme es gibt (z.B. clientseitige Verbindungsprobleme).
### Stakeholder:
* Service-Nutzer
### Scope:
* Implementierung eines Client-Server-Systems, das die Prozesse Upload, Download und Konvertierung in Form von Events und Anzeigen in der UI abbildet. Hierbei kann die Konvertierung in Form von setTimeout() ersetzt werden, da der Fokus des POCs auf der Fortschritts- und Statusanzeige liegt.<br>
Zusätzlich soll überprüft werden, ob Server-Sent Events dazu geeignet sind, den Client über den Komprimierungsfortschritt zu informieren.
### Resources:
* HTTP-Client
* HTTP-Server
### Description:
* Der Service-Nutzer lädt die Dateien per drag-and-drop oder über File Explorer hoch
* Anzeige: Zustand steht auf "Upload Bereit". "Bereits geladen", "Verbleibende Zeit" und "Bit-Rate" stehen bei 0
* Der Service-Nutzer startet über einen Button-Click den Upload
* Der Client schickt einen POST-Request an den Server -> Request enthält die zu konvertierenden Dateien
* Anzeige: Der Zustand wechselt auf "Upload"
* "Bereits geladen", "Verbleibende Zeit" und "Bit-Rate" werden mit dem Fortschreiten des Uploads im Takt von 500 ms aktualisiert
* Der Server beginnt den POST-Request zu verarbeiten
* Der Server schickt den ersten Server-Sent Event, um den Client den Start der Optimierung zu bestätigen
* Anzeige: Der Zustand wechselt auf "Optimierung"
* Der Server schickt in regelmäßigen Abständen SSEs an den Client, mit Angaben zur verbleibenden Zeit
* Der Server schickt ein SSE, wenn die optimierten Dateien zum Download bereit stehen
* Anzeige: Der Zustand wechselt auf "Download Bereit"
* Der Service-Nutzer startet über einen Button-Click den Download
* Der Client schickt einen GET-Request an den Server
* Der Server schickt die optimierten Dateien an ihn zurück
### Success criteria:
* Der Client empfängt Status-Updates mittels SSE mindestens einmal pro Sekunde (1000 ms).
* SSE kommen garantiert beim Client an
* Die Angaben "Bereits geladen", "Verbleibende Zeit" und "Bit-Rate" zeigen valide Zahlen an (ohne Widersprüche, z.B. steigende Uploadgeschwindigkeit und steigende verbleibende Zeit)
* Der Übergang des Zustandes passiert nur, wenn alle Dateien für den nächsten Prozess vollständig und bereit sind (z.B. kein Download von beschädigten Dateien) -> In diesem Fall ist es der Ausnahme-Zustand "Error"
* Fehler und Exceptions werden zu über 90 % erkannt und an den Client weitergeschickt 
### Fail criteria:
* Status-Updates dauern länger als 1000 ms
* Mindestens ein SSE erreicht den Client nicht
* Die Status-Anzeige zeigt länger als 5000 ms keine Updates an
* Die Status-Anzeige enthält widersprüchliche Angaben
* Es gibt einen Zustandswechsel, obwohl die Dateien nicht komplett und fehlerfrei sind
* Der Client erfährt nichts von einem Error oder einer Exception
* Im Zustand "Error" gibt es sich ändernde Werte in der Status-Anzeige (mindestens zwei Prozesse laufen parallel ab)
### Fallbacks:
* Der Client sendet alle 1000 ms eine Anfrage an den Server, um den Status abzufragen.
* Der Client bietet dem Service-Nutzer einen Restart eines Prozesses an -> bei gescheitertem/-r Upload, Download, Optimierung
* Der Client bietet dem Service-Nutzer an, ihn über E-Mail oder Push Notification darüber zu informieren, wenn der Download möglich ist
* Der Client informiert den Service-Nutzer über bestehende Probleme
* Der Server sendet SSEs mit Fehler- und Ausnahmeinformationen an den Client, der diese zur Anpassung der Anzeige und für Fehlerbehebungsschritte nutzt.
### Outcome:
