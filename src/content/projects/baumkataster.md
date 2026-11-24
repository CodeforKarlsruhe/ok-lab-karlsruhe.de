---
title: Baumkataster24
date: 2019-10-01
teaser: >-
  Aufbereitung und interaktive Darstellung des städtischen Baumkatasters mit
  Position und Art aller städtischen Bäume (inklusive Zusatz-Infos) sowie
  Vergleich zu Einwohnerzahl und Fläche für alle Stadtteile.
image: /assets/images/projects/baumkataster/image.webp
scope: internal
status: completed
category: Urban Data
tags:
  - Urban Data
  - Umwelt
projectUrl: https://codeforkarlsruhe.github.io/baumkataster/
repoUrl: https://github.com/CodeforKarlsruhe/baumkataster
personIds:
  - andreas-kugel
  - simon-haas
organizationIds: []
datasetIds:
  - ka-baumkataster-data
relatedProjectIds: []
externalLinks:
  - name: Offizielles Baumkataster (Geoportal Karlsruhe)
    url: https://geoportal.karlsruhe.de/fachplaene/?page=Baumkataster
press: []
featured: true
---
> "Karten-Visualisierung über alle städtischen Bäume."

Das städtische Baumkataster der Stadt Karlsruhe erfasst tausende Bäume im gesamten Stadtgebiet. Mit diesem Projekt möchten wir Bürgerinnen und Bürgern einen einfachen, interaktiven Zugang zu diesen Daten ermöglichen.

Über die interaktive Webkarte können Interessierte den Baumbestand in den einzelnen Stadtteilen erkunden, spezifische Baumarten filtern und Details zu Stammumfang, Pflanzjahr und Pflegezustand einsehen.

### Ziele & Hintergrund

Das Baumkataster der Stadt Karlsruhe enthält die Geokoordinaten und Art aller städtischen Bäume. Die Karte zeigt die Positionen auf einer Karte, in der ebenfalls für alle Stadtteile Einwohnerzahl und Fläche angezeigt werden. Für jede Baumart können weitere Informationen in einem Popup dargestellt werden.

Zur Auswertung der Daten wird eine Vorverarbeitung mit Python gemacht.

### Technische Umsetzung

Die Rohdaten aus dem städtischen Geoportal werden über ein Python-basiertes Datenaufbereitungs-Skript verarbeitet, bereinigt und für die Visualisierung mit modernen Open-Source-Webkarten vorbereitet.

### Screenshots & Galerie

![Baumkataster-Karte der Südstadt mit Kennzahlen](/assets/images/projects/baumkataster/baumkataster-suedstadt.webp)
*Interaktive Baumkataster-Karte für die Karlsruher Südstadt mit Stadtteil-Kennzahlen*

![Kennzahlen für die Nordweststadt](/assets/images/projects/baumkataster/baumkataster-nordweststadt.webp)
*Vergleich von Einwohnerzahl, Bäumen und Fläche in der Nordweststadt*

![Popup-Details zu einer Hainbuche](/assets/images/projects/baumkataster/baumkataster-hainbuche.webp)
*Detailansicht einer Hainbuche (Carpinus betulus) mit Koordinaten und KLAM-Wert*

![Popup-Details zu einer Winter-Linde](/assets/images/projects/baumkataster/baumkataster-winterlinde.webp)
*Detailansicht einer Winter-Linde (Tilia cordata) im Stadtgebiet*
