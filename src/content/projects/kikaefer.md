---
title: Insekten-Erkennung „KI Käfer“
date: '2023-08-01'
teaser: >-
  Erkennung von Insekten mittels digitaler Bildverarbeitung (OpenCV) und
  künstlicher Intelligenz (NanoDet, TensorFlow Lite).
image: /assets/images/projects/kikaefer/image.webp
imageAlt: Versuchsaufbau zur kameragestützten Insekten-Erkennung mit M5Stack-Kameramodul
scope: internal
status: active
category: Umwelt & Klima
tags:
  - KI
  - Bildverarbeitung
  - OpenCV
  - Insekten
  - Biodiversität
  - Hardware
repoUrl: https://github.com/CodeforKarlsruhe/kikaefer
personIds:
  - andreas-kugel
  - martin-weis
  - alexander-melde
organizationIds:
  - ok-lab-karlsruhe
datasetIds:
  - ka-umweltdaten
relatedProjectIds:
  - nachbarschafts-sensor
  - auenlaend
externalLinks: []
press: []
featured: false
---

## Kameragestützte Insektenerkennung am Gerät

Erkennung von Insekten mittels digitaler Bildverarbeitung (OpenCV) und künstlicher Intelligenz (NanoDet, TensorFlow Lite).

### Ziele & Hintergrund

- Ziel des Projekts ist eine kompakte, energiesparende Hardware-Lösung, die Insekten automatisch optisch erkennt und zählt, um lokale Biodiversitäts- und Monitoring-Daten zu gewinnen.
- Auf Basis eines **M5Stack UnitV2 / K027** Kameramoduls mit integriertem Linux-System und Web-Interface werden Modelle zur Objekterkennung (**NanoDet**, **YOLO**, **TensorFlow Lite**) sowie klassische Verfahren der digitalen Bildverarbeitung (**OpenCV**) direkt auf dem Gerät erprobt.
- Ein erster Testaufbau mit gedruckten Insektenmotiven dient dazu, Beleuchtung, Fokusdistanz, Kamerahalterung und Erkennungsgenauigkeit reproduzierbar zu kalibrieren.

### Screenshots & Galerie

![Versuchsaufbau für die Insektenerkennung](/assets/images/projects/kikaefer/versuchsaufbau.webp)
_Testaufbau mit montiertem Kameramodul und verschiedenen Insektenmotiven_

![M5Stack Kameramodul](/assets/images/projects/kikaefer/m5stack-kamera.webp)
_Kompaktes M5Stack-Kameramodul für die On-Device-Bildverarbeitung_

![Objekterkennung in der UnitV2-Oberfläche](/assets/images/projects/kikaefer/objekterkennung-demo.webp)
_Live-Objekterkennung mit Bounding-Boxes und JSON-Ergebnisausgabe im Browser-Interface_

![Kamera-Stream und Modellauswahl auf UnitV2](/assets/images/projects/kikaefer/kamera-stream-ui.webp)
_Weboberfläche des UnitV2-Moduls mit Kamera-Stream und verschiedenen Erkennungsfunktionen_
