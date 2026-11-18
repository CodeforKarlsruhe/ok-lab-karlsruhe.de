---
title: Rad Qualitätsindex für Karlsruhe
date: '2024-03-02'
teaser: >-
  Karte der Radweg-Qualität in Karlsruhe auf Basis von OpenStreetMap-Daten,
  visualisiert im Open-Source-Geoinformationssystem QGIS.
image: /assets/images/projects/rad-qualitaetsindex/image.webp
imageAlt: >-
  QGIS-Karte der Radweg-Qualität in der Karlsruher Innenstadt (© Martin Weis
  2024 / GeoBasis-DE / BKG)
scope: internal
status: active
category: Urban Data
tags:
  - Radverkehr
  - OpenStreetMap
  - QGIS
  - Geodaten
  - Mobilität
  - Karlsruhe
personIds:
  - martin-weis
organizationIds:
  - ok-lab-karlsruhe
  - openstreetmap
datasetIds:
  - ka-mobilitaet
  - ka-fahrradunfaelle
  - ka-stadtradeln
relatedProjectIds:
  - bike-accident-map
  - bike-parking
  - openbikesensor
externalLinks:
  - name: 'OSM Verkehrswende: Cycling Quality Index'
    url: https://www.osm-verkehrswende.org/cqi/map/
  - name: 'Transparenzportal Karlsruhe: Radnetz'
    url: https://transparenz.karlsruhe.de/
featured: false
---

## Radverkehrsqualität sichtbar machen

Karte der Radweg-Qualität in Karlsruhe auf Basis von OpenStreetMap-Daten, visualisiert im Open-Source-Geoinformationssystem QGIS.

### Ziele & Hintergrund

- Aus den detaillierten Weg- und Oberflächenattributen von **OpenStreetMap** lässt sich bewerten, wie sicher, komfortabel und stresstolerant einzelne Straßenabschnitte für den Radverkehr sind (z. B. nach _Level of Traffic Stress_ und _Cycling Quality Index_).
- Auf Basis dieser offenen Geodaten sowie des städtischen Datensatzes „Radnetz Stadt Karlsruhe“ aus dem Transparenzportal wurde im Open-Source-GIS **QGIS** eine hochauflösende Karte für das Karlsruher Stadtgebiet erstellt.
- Die Visualisierung hilft dabei, Lücken im Radverkehrsnetz, belastete Abschnitte und Qualitätsunterschiede im Vergleich zum offiziellen Radverkehrsnetzplan nachvollziehbar darzustellen.

### Screenshots & Galerie

![QGIS-Karte der Radweg-Qualität in Karlsruhe](/assets/images/projects/rad-qualitaetsindex/image.webp)
_QGIS-Auswertung der Radweg-Qualität in der Karlsruher Innenstadt auf OpenStreetMap-Basis_

![Datensatz Radnetz Stadt Karlsruhe im Transparenzportal](/assets/images/projects/rad-qualitaetsindex/transparenzportal-radnetz.webp)
_Offener Datensatz „Radnetz Stadt Karlsruhe“ (GeoJSON und Shapefile) im Transparenzportal_

![Offizieller Radverkehrsnetz-Plan Karlsruhe](/assets/images/projects/rad-qualitaetsindex/radverkehrsnetz-plan.webp)
_Offizieller Plan des Karlsruher Radverkehrsnetzes (Hauptnetz, Ringroute, Nebennetz) als Referenz_

![OpenStreetMap Cycling Quality Index](/assets/images/projects/rad-qualitaetsindex/osm-cycling-quality-index.webp)
_Darstellung nach Level of Traffic Stress (LTS 1 bis 4) im OpenStreetMap Cycling Quality Index_
