# CrisisOS — Geospatial & Map Integration Guide

This document describes the GIS architecture, Leaflet map client, custom SVG marker system, and dynamic layer filtering in CrisisOS.

---

## 1. Map Technology Stack

- **Map Engine:** Leaflet + `react-leaflet` with client-side dynamic import (`ssr: false`).
- **Cartography Tiles:** CARTO Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`).
- **Coordinate Reference System:** WGS 84 (EPSG:4326).
- **Default EOC Center:** Ahmedabad Metro (`23.0225° N, 72.5714° E`), zoom level 12.

---

## 2. Multi-Layer Architecture

CrisisOS renders five independent geospatial layers that can be toggled on/off in real-time:

1. **Incidents Layer (🚨):** Dynamic emoji markers color-coded by severity (Red: Critical, Orange: High, Yellow: Medium, Blue: Low).
2. **Fleet Units Layer (🛡️):** Real-time vehicle positions with status glow (Green: Available, Yellow: En Route, Grey: Out of Service).
3. **Hospital Trauma Centers Layer (🏥):** Hospital locations with live available bed tooltips and ICU indicators.
4. **Evacuation Shelters Layer (⛺):** Shelter markers with occupancy bars.
5. **Danger & Hazard Zones Layer (⚠️):** High-risk buffer circles for flood submergence and toxic chemical dispersion.

---

## 3. Custom Map Pin Styling

Markers use custom CSS/SVG circular badges with high-contrast emergency borders and glow drop-shadows for high visibility on dark backgrounds.
