# OmniMize -- Web-Applikation zum Komprimieren von Bilddateien (EP 2024, Noss)

## Einführung

Im Rahmen des Entwicklungsprojekts soll eine Web Applikation erstellt werden, die einen Upload von zu großen Bilddateien erlaubt. Die Applikation ermöglicht es Nutzern, übergroße Bilddateien hochzuladen, die anschließend komprimiert und dem Kunden zum Download zur Verfügung gestellt werden. Ein Punktesystem reguliert den Upload, sodass nicht unbegrenzt viele Dateien hochgeladen werden können.

## Dateiübersicht - Auszug

Hier ein Auszug über den Aufbau unseres Verzeichnisses. Es werden bewusst nicht alle Dateien aufgezählt, da ein paar Dateinamen bereits ihre eigentliche Funktion verraten. Die unten aufgeführten sind mit einer kurzen Erklärung zu ihrer Aufgabe versehen.

* ADR: 14 md.-Dateien 
* POCs: Die einzelnen Umsetzungen der POCs, die nicht miteinander zusammenhängen
* Prototyp: Enthält laufende Anwendung
    * backend:
        * <b>/errors</b>:
          * Globales Error Handling.
        * <b>/events</b>:
           * OptimizationEventEmitter.js:
             * Senden von Fortschrittsstatus-Updates (progress-Events) mit Status, Dateinamen und Credits an Clients.
           * OptimizationEventStatus.js:
             * Status des Optimierungsvorgangs, der an den Client geschickt wird.
         * <b>/link-renewal</b>:
           * ActionType:
             * Query-Parameter -> Client u. Server kommunizieren (Weiterleitung) über diese Query-Parameter bei der Aktualisierung des Links.
           * checkTokenExpired.js:
             * Wenn der Link eines Kunden innerhalb der nächsten drei Tage abläuft, sorgt dies Datei dafür, dass eine E-Mail versendet wird.
         * <b>/notification</b>:
           * Versenden von E-Mails bei Erstellung des Kunden, oder um den Kunden über den baldigen Ablauf des Links zu informieren oder. 
        * <b>/customers</b>:
           * enthält Unterordner der personalisierte Customer-ID beihaltet. Der sind die Ordner uploaded und optimized untergestellt, in die Bilddateien reingeladen bzw. rausgelesen werden
           * Bsp.: /customers/e33ffc9a-8901-4e18-951f-9e208b266244/uploaded + /optimized
        * <b>/optimization</b>:
          * Anwendungslogik für Bildverarbeitung inkl. Komprimierung und Konvertierung.
        * <b>/persistence</b>:
          * Datenbank-Anbindung.
        * <b>/routes/customers/customers.js</b>:
           * Kunden-Endpoints (Zugang mittels Link-Token, Upload, Download, Datei-Optimierung, Informationen zum Fortschritt mittels Server-Sent Events).
        * <b>/routes/admin/admin.js</b>:
           * Admin-Entpoints (Login, Logout, Authentifizierung, Kunden-Verwaltung).
        * <b>/util</b>:
          * Hilfsfunktionen. 
        * <b>.env</b>:
           * Environment-Datei, die neben Access- und Refresh-Tokens für JWT Authetifikation, auch Anmeldeinformationen für den E-Mail-Client und die Datenbank speichert
        * <b>server.js</b>:
           * Middleware für das Routing der Requests.
    * frontend:
      * scripts:
         * <b>config.js</b>:
            * Definieren von häufig genutzten Variablen.
         * <b>handle-customer.js</b>:
            * Erstellen und Bearbeiten von Kunden.
         * <b>load-customer.js</b>:
            * Das Laden von Kunden in die Admin-Tabelle.
         * <b>menu.js</b>:
            * Sidemenu für Mobile-Ansicht.
         * <b>modal.js</b>:
            * Erstellt Pop-Up, das Löschen eines Kunden ermöglicht.
         * <b>optimized-download.js</b>:
            * Erstellen eines Eintrags in der Tabelle (s. index.html), wenn ein Bild erfolgreich optimiert wurde.
         * <b>sse.js</b>:
            * Verarbeiten von Server-Sent-Events, also Senden von Echtzeit-Updates an den Client, die server-seitig passieren (z.B. momentane Credits, welche Datei komprimiert wurde, ...)
         * <b>sort-table.js</b>:
            * Sortieren der Tabelle, wenn eine Spalte angeklickt wird. Hinzufügen von Indikatoren.
         * <b>timeManagement.js</b>:
            * Verwaltung der Ablaufzeit, bis Admin wieder aus Sitzung geworfen wird. Zeit wird in server.js festgelegt.
         * <b>upload.js</b>:
            * Ermöglicht das Hochladen von Dateien (u.a. Dateibeschränkungen, Upload-Fortschritt, Abrufen von Credits von Server)
       
## Naming Conventions bei Dateinamen
- Dateien, die nur eine Funktion enthalten:
   - Camel Case, kleiner Anfangsbuchstabe z.B. checkTokenExpired.js
   - Dateiname = Funktionsname
- Dateien, die nur eine Klasse enthalten:
   - Camel Case, großer Anfangsbuchstabe, z.B. ApiError.js
   - Dateiname = Klassenname
- Dateien, die diverse Funktionen/ Klassen/ Definitionen enthalten:
   - Bindestrich-Trennung, alles klein geschrieben, z.B. email-notification.js 

## Was kann unsere Applikation?
- Unterstützte Formate:
    - JPG/JPEG
    - PNG
    - SVG

## Wichtiger Hinweis
- Die Lauffähigkeit der Anwendung variiert stark, je nach Browser und Betriebssystem
- Bitte auf verschiedenen Browsern testen

## Voraussetzungen
- Node.js (Version 20.12.2 zum Zeitpunkt der Entwicklung)
- NPM
- PostgreSQL (Extensions: uuid-ossp) 
- SMTP-Relay Service (z.B. Mailersend)
- .env Datei in /backend:
```
# Auth tokens
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=

# SMTP-Server credetials
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=

# PostreSQL credentials
DB_USER=
DB_HOST=
DB_NAME=
DB_PASSWORD=
DB_PORT=

# Host (f.e. localhost:[PORT])
URI=

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
3) Module installieren (jeweils in /backend, als auch in /frontend):
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
