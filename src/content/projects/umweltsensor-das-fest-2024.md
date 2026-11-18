---
title: Umweltsensor beim „Das Fest“ Karlsruhe 2024
date: '2024-07-21'
teaser: >-
  Konzept, Zusammenbau, Montage und Visualisierung eines solarbetriebenen
  Umweltsensors auf Basis des Sensor.Community AirRohrs beim „Das Fest“
  Karlsruhe 2024.
image: /assets/images/projects/umweltsensor-das-fest-2024/image.webp
imageAlt: >-
  Solarbetriebener Umweltsensor an einer Traverse auf dem Gelände von DAS FEST
  2024
scope: internal
status: completed
category: Umwelt & Klima
tags:
  - Sensoren
  - Feinstaub
  - Solar
  - IoT
  - DAS FEST
  - Sensor.Community
projectUrl: https://viz.ok-lab-karlsruhe.de
personIds:
  - alexander-melde
  - martin-weis
  - andreas-kugel
organizationIds:
  - ok-lab-karlsruhe
  - sensor-community
datasetIds:
  - ka-umweltdaten
relatedProjectIds:
  - sensor-community
  - nachbarschafts-sensor
externalLinks:
  - name: 🎬 Installation des Sensors (Reel)
    url: https://www.instagram.com/codeforka/reel/DGCHRLjCJ4O/
  - name: 🎬 Aftermovie DAS FEST 2024 (Reel)
    url: https://www.instagram.com/codeforka/reel/DGB-jiDtQPd/
featured: false
---

## Live-Umweltmessung auf dem Festivalgelände

Konzept, Zusammenbau, Montage und Visualisierung eines solarbetriebenen Umweltsensors auf Basis des Sensor.Community AirRohrs beim „Das Fest“ Karlsruhe 2024.

### Ziele & Hintergrund

- Für unseren Stand in der Klima-Akademie auf **DAS FEST 2024** wurde ein autarker Umweltsensor entwickelt, der unabhängig von lokaler Strom- und WLAN-Infrastruktur Messwerte direkt vom Festivalgelände liefert.
- Die Sensorstation kombiniert einen **BME-Sensor** (Temperatur, Luftdruck, Luftfeuchtigkeit) mit einem **Nova-PM-Feinstaubsensor** (PM2.5 und PM10) auf Basis eines **NodeMCU Lua Lolin V3** und wird über Solarstrom sowie einen LTE-WLAN-Router betrieben.
- Die erfassten Messwerte wurden sowohl über **Sensor.Community** und **Grafana** als auch über ein eigenes Live-Dashboard unter `viz.ok-lab-karlsruhe.de` (MQTT / REST) am Stand auf Tablets und Bildschirmen visualisiert.

### Screenshots & Galerie

![Live-Dashboard der Sensordaten auf viz.ok-lab-karlsruhe.de](/assets/images/projects/umweltsensor-das-fest-2024/viz-dashboard.webp)
_Live-Visualisierung von Luftfeuchtigkeit, Temperatur, Luftdruck und PM10-Werten im Zeitraum des Festivals_

![Systemarchitektur des solarbetriebenen Umweltsensors](/assets/images/projects/umweltsensor-das-fest-2024/architektur-diagramm.webp)
_Architekturübersicht von Solarversorgung, LTE-Router und Sensorik bis zu Sensor.Community, Grafana und viz.ok-lab-karlsruhe.de_

![Live-Anzeige der Messwerte auf dem Tablet am Stand](/assets/images/projects/umweltsensor-das-fest-2024/tablet-live-anzeige.webp)
_Anzeige der aktuellen Feinstaub-, Temperatur-, Luftfeuchtigkeits- und Luftdruckkurven auf dem Tablet_

![Hardware-Aufbau des AirRohr-Sensors](/assets/images/projects/umweltsensor-das-fest-2024/airrohr-hardware.webp)
_Aufbau der Sensor-Elektronik auf Basis des Sensor.Community AirRohrs_
