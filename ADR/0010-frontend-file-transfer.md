# File Transfer (Frontend)

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
Eine Web-API für die synchrone und asynchrone Verarbeitung von HTTP-Requests.
Eine solche Anfrage kommt ohne Reload des Brwoser-Fensters aus und es können diverse Datei-Formate zwischen Client und Server ausgetauscht werden (u.a. JSON, HTML, Text, Blob).

- Gut: Native Lösung (Browser API-Library)
- Gut: Hohe Kompatibilität mit älteren Browserversionen
- Gut: Extensive Dokumentation 
- Neutral: Unterstützt simulate Requests, diese müssen aber manuell verwaltet werden
- Neutral: Mehr Boilerplate-Code
- Schlecht: Callbacks, statt Promises

### Fetch API
Die Fetch API hat XMLHttpRequest abgelöst.

- Gut: Native Lösung (Browser API-Library)
- Gut: Nutzt Promises
- Gut: Einfache Syntax mit async & await
- Gut: Unterstützt simulate Requests
- Neutral: Weniger Kontrolle -> Request-Abbruch nur durch Einbinden eines Abort-Controllers möglich
- Neutral: Package für Upload-Progress ist relative neu, benötigt Workaround-Lösungen (Streams) 
- Schlecht: Mangelhaftes Error-Handling (z.B. Promise erfolgreich, trotz 404 Response)

### Axios
Eine Third-Party-Library, die Promise-basierte Client-Server-Kommunikation realisiert. Dabei nutzt Axios XMLHttpRequests.

- Gut: Nutzbar für Front- und Backend
- Gut: Nutzt Promises
- Gut: Unterstützt simulate Requests
- Gut: Abtraktion der Komplexität -> Weniger Code, niedrigeres Fehlerpotenzial
- Gut: Umfassendes Error-Handling
- Gut: Unterstützt simulate Requests
- Neutral: Out-of-the-box Interceptors, Timeout, Abbrechen von Requests,..
- Schlecht: Mehr Overhead für den Client
- Schlecht: Unklarheit über Browser-Support (vor allem für ältere Versionen)
