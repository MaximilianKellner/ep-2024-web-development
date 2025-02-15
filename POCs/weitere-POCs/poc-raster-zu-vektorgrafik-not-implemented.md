## Konvertierung Rastergrafik zu Vektorgrafik (WebP -> SVG)

### Problem:
Die Transformation zwischen Raster- und Vektorgrafiken kann Probleme verursachen. Bei Vektorgrafiken gibt es verschiedene Layer welche sich überdecken. bei Rastergrafiken gibt es nur voneinander unabhängige Pixel. 

### Scope:
* Die Konvertierung von (WebP-)Bildern in das SVG-Format auf dem Server.

### Resources:
* Server mit Konvertierungs-Software und ausreichender Speicherkapazität
* Testdaten

### Success Criteria:
* Der Server verarbeitet die Datei und konvertiert sie erfolgreich in das SVG-Format.

### Fail Criteria
* Komplexe Bildstruktur (viele Farbeabstufungen bei realitätsnahen Bildern)
* Verlust von Dateiinformationen (Bilddetails/Daten können bei Konvertierung verloren gehen)
* Technische Grenze (nicht alle Bildeffekte sind in SVG darstellbar)

### Fallbacks
* PNG als Standardalternative
* JPEG für realitätsnahe Bilder (geringster Verlust von Daten)
* Placeholder-Grafiken bereitstellen
* Server-seitiges Rendering von Alternativen (Parallele Generierung von SVG (gewünscht von Kunden) und PNG-Fallback)

***
