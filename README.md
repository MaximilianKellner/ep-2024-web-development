# OmniMize -- Web-Applikation zum Komprimieren von Bilddateien (EP 2024, Noss)

## Einführung

Im Rahmen des Entwicklungsprojekts soll eine Web Applikation erstellt werden, die einen Upload von zu großen Bilddateien erlaubt. Die Applikation ermöglicht es Nutzern, übergroße Bilddateien hochzuladen, die anschließend komprimiert und dem Kunden zum Download zur Verfügung gestellt werden. Ein Punktesystem reguliert den Upload, sodass nicht unbegrenzt viele Dateien hochgeladen werden können.

## Dateiübersicht - Auszug

Hier ein Auszug über den Aufbau unseres Verzeichnisses. Es werden bewusst nicht alle Dateien aufgezählt, da ein paar Dateinamen bereits ihre eigentliche Funktion verraten. Die unten aufgeführten sind mit einer kurzen Erklärung zu ihrer Aufgabe versehen.

* ADR: 14 md.-Dateien 
* POCs: Die einzelnen Umsetzungen der POCs, die nicht miteinander zusammenhängen
* Prototyp: Enthält laufende Anwendung
    * backend:
        * /customers:
           * enthält Unterordner der personalisierte Customer-ID beihaltet. Der sind die Ordner uploaded und optimized untergestellt, in die Bilddateien reingeladen bzw. rausgelesen werden
        * .env:
           * Environment-Datei, die neben Access- und Refresh-Tokens für JWT Authetifikation, auch Anmeldeinformationen für den E-Mail-Client und die Datenbank speichert
        * optimizationEventEmitter.js:
           * Senden von Fortschrittsstatus-Updates (progress-Events) mit Status, Dateinamen und Credits an Clients
        * server.js:
           * Middleware für das Routing der Requests
        * /routes/customers/customers.js:
           * Kunden-Endpoints (Zugang mittels Link-Token, Upload, Download, Datei-Optimierung, Informationen zum Fortschritt mittels Server-Sent Events)
        * /routes/admin/admin.js:
           * Admin-Entpoints (Login, Logout, Authentifizierung, Kunden-Verwaltung) 
        * sharp.js:
           * Anwendungslogik für Bildverarbeitung inkl. Komprimierung und Konvertierung
        * checkTokenExpired.js:
           * Wenn der Link eines Kunden innerhalb der nächsten drei Tage abläuft, sorgt dies Datei dafür, dass eine E-Mail versendet wird
    * frontend:
      * scripts:
         * config.js:
            * definieren von häufig genutzten Variablen
         * handle-customer.js:
            * Erstellen& Bearbeiten von Kunden   
         * load-customer.js:
            * das labden von Kunden in die admin-table
         * menu.js:
            * Sidemenu für Mobile-Ansicht
         * modal.js:
            * Kreiert Pop-Up, dass Löschen eines Kunden ermöglicht
         * optimized-download.js:
            * Erstellen eines Eintrags in der Tabelle (s. index.html), wenn ein Bild erfolgreich optimiert wurde.
         * sse.js:
            * Handeln von Server-Sent-Events, aslo Senden von Echtzeit-Updates an den Client, die server-seitig passieren (z.B. momentane Credits, welche Datei komrpimiert wurde, ...)
         * sort-table.js:
            * Sortieren der Tabelle, wenn eine Spalte angeklickt wird. Hinzufügen von Indikatoren.
         * timeManagement.js:
            * Handeln der Ablaufzeit, bis Admin wieder aus Sitzung geworfen wird. Zeit wird in server.js festgelegt
         * upload.js:
            * Code ermöglicht Hochladen von Dateien (u.a. Dateibeschränkungen, Upload-Fortschritt, Abrufen von Credits von Server)
       
## Naming Conventions bei Dateinamen
- Dateien, die nur eine Funktion enthalten:
   - Camel Case, z.B. optimizationEventEmitter.js
   - Dateiname = Funktionsname
- Dateien, die nur eine Klasse enthalten:
   - Anfangsbuchstabe groß, z.B. ApiError.js
   - Dateiname = Klassenname
- Dateien, die diverse Funktionen/ Klassen/ Definitionen enthalten:
   - Bindestrich-Trennung, z.B. email-notification.js 

## Was kann unsere Applikation?
- Unterstützte Formate:
    - JPG/JPEG
    - PNG
    - SVG
## Voraussetzungen
- Node.js (Version 20.12.2 zum Zeitpunkt der Entwicklung)
- NPM
- PostgreSQL (Extensions: uuid-ossp) 
- SMTP-Relay Service (z.B. Mailersend)
- .env Datei in /backend:
```
# Tokens für die Authentifizierung
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

# SMTP-Server credetials
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# E-mail recipient
RECIPIENT=

# PostreSQL credentials
DB_USER=
DB_HOST=
DB_NAME=
DB_PASSWORD=
DB_PORT=

# The port your application is running on
DEV_PORT=
```

## Anlegen des DB-Schemas
<a href="https://github.com/MaximilianKellner/ep-2024-web-development/wiki/Datenstruktur#Anlegen-des-DB-Schemas">Click me</a>
 
## Installation

1)
```
git clone git@github.com:MaximilianKellner/ep-2024-web-development.git
```
2)
Zum Backend im Projektverzeichnis wechseln:
```
cd [Pfad bis zum Projektverzeichnis]/ep-2024-web-development/Prototyp/backend
```
3)
```
npm install
```
4)
```
node server.js
```
5)
Die Anwendung läuft auf localhost:[Ausgewählter Port]

## Verwendete Technologien
- Frontend:
    - HTML, CSS, JS
    - Axios
- Backend:
    - Node.js
    - Express, Multer, Cors
    - Sharp
    - Postgresql  

## Nutzergruppen

+ Kunde: Lädt gewünschte Dateien hoch. Wird komprimierte Datei zum Download bereitgestellt. Punktekonto wird reduziert.
+ Admin: Hat Zugriff auf Punktekonten aller Kunden. Kann Punkte erhöhen und diese in Links an Kunden verschicken.
## Weiteres Wissenswertes

Eine visuelle Darstellung unseres momentanen Projektfortschritts in Form von Diagrammen ist unter folgendem Link in einem Figma Board vorzufinden:

[Figma Board](https://www.figma.com/board/Lya99vssDGLZr3e9G18EFM/Ep-2024-Entwicklungsprojekt-Web-Development?node-id=0-1&t=rX6fZAFS69NxU99C-1 )

Link zur Fachseite:

[Entwicklungsprojekt 2024](https://cnoss.github.io/entwicklungsprojekt/)

## Teilnehmer

- [Maximilian Elias Kellner](https://github.com/MaximilianKellner)
- [Oliver Russmann](https://github.com/orussmann)
- [Yassin El Fraygui](https://github.com/Yasabi04)
