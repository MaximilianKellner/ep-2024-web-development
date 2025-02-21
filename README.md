# OmniMize -- Web-Applikation zum Komprimieren von Bilddateien (EP 2024, Noss)

## Einführung

Im Rahmen des Entwicklungsprojekts soll eine Web Applikation erstellt werden, die einen Upload von zu großen Bilddateien erlaubt. Die Applikation ermöglicht es Nutzern, übergroße Bilddateien hochzuladen, die anschließend komprimiert und dem Kunden zum Download zur Verfügung gestellt werden. Ein Punktesystem reguliert den Upload, sodass nicht unbegrenzt viele Dateien hochgeladen werden können.

## Dateiübersicht

Hier kommt ein Text hin der noch geschrieben werden muss
* ADR: 14 md.-Dateien 
* POCs: Die einzelnen Umsetzungen der POCs, die nicht miteinander zusammenhängen
* Prototy: Source Ordner
    assets: Logos (Dropox, Google Drive etc.)
    fonts: Einbindung der Schriftarten
    scripts: Skripte für JavaScript
        assetowner.js: Clientseitiger Code für die Asset Owner Seite - Up- und Download der Dateien
        createNewCustomer.js: Clientseitiger Code für die Content Manager Seite - Erstellung und Verwaltung der Customers(Asset Owner)
        createNewCustomerLinks.js: Clientseitiger Code für die Content Manager Seite - Erstellung und Verwaltung der Cards(Projekte) und personalisierten Links
    styles: CSS Dateien für das Frontend
    assetowner.html: HTML Code für das Frontend der Asset Owner Seite
    contentmanager.html: HTML Code für das Frontend der Content Manager Seite
    index.html: HTML Code für die Landing Page
index.js: Serverseitiger Code

## Was kann unsere Applikation?
- Unterstützte Formate:
    - JPG/ JPEG
    - PNG
    - SVG
## Voraussetzungen
- Node.js (20.12.2 zum Zeitpunkt der Entwicklung)
- NPM
- PostgreSQL
- SMTP-Relay Service (z.B. Mailersend)
- .env Datei in /backend:
```
#Tokens für die Authentifizierung
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
