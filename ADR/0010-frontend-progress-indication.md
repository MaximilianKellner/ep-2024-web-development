# TITEL

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 20-12-2024                                                 |
| deciders | [Oliver Russmann](https://github.com/orussmann) |

## Kontext und Problemstellung
Upload, Download und Komprimierung von größeren Dateimengen kann, je nach Server- und Netz-Auslastung, eine längere Zeit dauern. Als Service-Nutzer möchte man zu jedem Zeitpunkt darüber in Kenntnis gesetzt werden,
in welchem Zustand der Service sich gerade befindet (wartend, Download, Upload, ..), wie lange sicher der Service noch in diesem Zustand befinden wird und welche Probleme es gibt (z.B. Verbindungsprobleme, die Client-seitig bestehen).
Auch erwartet der Service Nutzer eine entsprechende Repräsentation z.B. in Form eines Upload-Balkens.<br>
Als Entwickler benötigen wir eine Lösung, die mit möglichst ohne große Latenz mit dem Backend kommuniziert und Backend-seitige Events möglichst zeitnah verarbeiten kann, um sie in der UI anzeigen zu können.


## Entscheidungsfaktoren
- Geringe Latenz
- Geringe Fehleranfälligkeit
- Einfache Handhabung (wir benötigen keine komplexen UI-Elemente)
- Leichtgewichtig (wenig Overhead im Client)
- Hohe Kompatibilität (Browser)
- Viele Code-Beispiele & gute Doku

## Berücksichtigte Optionen
- XMLHttpRequest API
- Fetch API
- Axios


## Entscheidungsergebnis


## Vor- und Nachteile der Optionen

### XMLHttpRequest API
Eine 

- Gut: 
- Gut:  
- Neutral,
- Schlecht,

### Fetch API
Die Fetch API hat XMLHttpRequest abgelöst.

- Gut: Native Lösung (Browser API-Library)
- Gut: Nutzt Promises
- Gut: Einfache Syntax mit async & await
- Gut: Unterstützt simulate Requests
- Neutral: Weniger Kontrolle -> Request-Abbruch nur durch Einbinden eines Abort-Controllers möglich 
- Schlecht: Promise gibt immer etwas zurück, auch wenn der Request nicht erfolgreich war
- Schlecht: Package für out-of-the-box Upload-Progress ist relative neu, benötigt Workaround-Lösungen

### Axios
Eine Third-Party-Library, die Promise-basierte Client-Server-Kommunikation realisiert.<hr>Dabei nutzt Axios XMLHttpRequests.

- Gut: Nutzbar für Front- und Backend
- Gut: Nutzt Promises
- Gut: Unterstützt simulate Requests
- Gut: Abtraktion der Komplexität -> Weniger Code, niedrigeres Fehlerpotenzial
- Gut: Umfassendes Error-Handling
- Neutral: Out-of-the-box Interceptors, Timeout, Cancelation,..
- Schlecht: Mehr Overhead für den Client
- Schlecht: Unklarheit über Browser-Support (vor allem für ältere Versionen)
