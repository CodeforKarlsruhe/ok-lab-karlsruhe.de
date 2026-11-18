---
title: Open Data Portale
date: '2021-10-04'
teaser: >-
  Interaktives Verzeichnis und automatisierte Auswertung der Datensätze
  öffentlicher Open-Data-Portale, die den CKAN-Standard verwenden – aufbereitet
  für KNIME, Power BI und Tableau.
image: /assets/images/projects/odportals/image.webp
scope: internal
status: active
category: Open Data
tags:
  - CKAN
  - Portale
  - Auswertung
projectUrl: https://cloud.ok-lab-karlsruhe.de/s/jfnEaj9SJSMZtHt
personIds:
  - michael-riedmueller
organizationIds: []
datasetIds:
  - metadaten-tpka-govdata
  - readi-open-data
relatedProjectIds: []
externalLinks: []
press:
  - title: Trendsetter bei digitalem Wandel
    outlet: Karlsruhe.de
    date: 20.01.2023
    teaser: >-
      Wenn Bürger bei der Stadt Daten anfragen, muss die Verwaltung reagieren
      und gibt in unkritischen Fällen Datensätze heraus – das Karlsruher
      Transparenzportal als Vorreiter.
    url: >-
      https://www.karlsruhe.de/stadt-rathaus/aktuelles/meldungen/trendsetter-bei-digitalem-wandel-transparenzportal-open-data-karlsruhe
  - title: Digitale Initiativen und Projekte
    outlet: Karlsruhe.de
    date: 07.07.2022
    teaser: >-
      Karlsruhe als IT- und Technologiestandort: Zivilgesellschaftliche
      Initiativen und Open-Data-Projekte des OK Lab Karlsruhe.
    url: >-
      https://www.karlsruhe.de/wirtschaft-wissenschaft/wissenschaftsstadt/digitale-initiativen-und-projekte
---

## Vergleich und Analyse von Datenportalen

Automatisierte Auswertung von Open-Data Portalen.

### Ziele & Hintergrund

CKAN ist ein verbreitetes System für Open-Data Portale. Es bietet zusätzlich zur Web-Anwendung den automatisierten Abruf über eine Programmierschnittstelle (CKAN-API). Über diese API können die verfügbaren Daten durchsucht und abgerufen werden. Portal-übergreifende Abfragen sind in der CKAN-API allerdings nicht vorgesehen.

Um dies umzusetzen wurde im Projekt ein Ansatz mit einem frei verfügbaren Tool gewählt, das die über die API abgefragten Daten aufbereitet und einem Business-Intelligence-Tool (BI-Tool) zur Verfügung stellt (als CSV Dateien).
Als BI-Tool wurde hier das ebenfalls frei (unter Windows) verfügbare Power BI Desktop verwendet. Die ausgewerteten Ergebnisse liegen ebenfalls als CSV-Dateien vor und können auch mit anderen Tools weiterverwendet werden. Die zugehörigen Links folgen in Kürze.

Dabei werden folgende Aufgaben (prototypisch) bearbeitet:

- Inhalte (Katalog und Ressourcen) von CKAN Portalen abrufen
- Die Inhalte aufzubereiten und in einer maschinell verarbeitbaren Form anderen Werkzeugen verfügbar machen
- Datenmodelle für die verfügbaren Objekte erstellen
- Beispielauswertungen über die aufbereiteten Daten erstellen
- Probleme beim Abruf und/oder der Aufbereitung identifizieren
- Gütekriterien für die bereitgestellten Inhalte und ihre Form ableiten
- Verbesserungsmöglichkeiten aufzeigen
- Vergleichbarkeit zwischen Portalen und Inhalten herstellen

### Screenshots & Galerie

![Interaktives Verzeichnis der Open-Data-Portale in Power BI](/assets/images/projects/odportals/image.webp)
_Interaktives Power-BI-Dashboard zur Suche nach Paketen und Ressourcen über CKAN-Portale hinweg_

![Aufbereitete Open-Data-Tabellen in Excel](/assets/images/projects/odportals/csv-daten-excel.webp)
_Ausgewertete Datensätze als strukturierte CSV-Tabellen in Excel_

![Datentransformation im Power Query-Editor](/assets/images/projects/odportals/power-query-editor.webp)
_Bereinigung und Typisierung der abgerufenen Portalinhalte im Power Query-Editor_

![Daten-Pipeline im Analyse-Workflow](/assets/images/projects/odportals/knime-workflow.webp)
_Automatisierte Datenaufbereitung und Auswertung im Workflow-Tool_
