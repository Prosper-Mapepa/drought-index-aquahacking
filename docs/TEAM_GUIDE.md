# LAPARA IRHT Platform — Team Guide

**A plain-language guide for presenting and using the territorial hydric resilience dashboard with your team.**

Live demo: [https://drought-index-aqua.netlify.app](https://drought-index-aqua.netlify.app)  
(French & English — toggle with **English | Français** in the header or on the welcome note)

---

## 1. What is this?

The **LAPARA IRHT Platform** is an interactive map that shows **territorial hydric resilience (IRHT, 0–100)** and drought risk in Québec and the Great Lakes region.

Think of it as a **decision-support dashboard**, not a weather app:

- Bankers and insurers can see **investment risk** by watershed.
- Land managers can explore **groundwater wells**, RSESQ stations, land use, and GTC contamination sites.
- The team can compare **today’s climate** with **2050 / 2100 IRHT projections** (Yamaska pilot: 52.5 → 33.05).

It combines open government and scientific data on one map — similar in spirit to the [Global Wind Atlas](https://globalwindatlas.info/), but for **water resilience**.

> **Status:** Phase A prototype aligned with the LAPARA IRHT formulation (6 components: C/H/G/T/D/E).

---

## IRHT formula (LAPARA)

```
IRHT = 100 × (0.25·C + 0.20·H + 0.15·G + 0.15·T + 0.10·D + 0.15·E)
```

Each component is normalized 0–1 (higher = more resilient). Classification: 80–100 très élevée, 60–79 élevée, 40–59 modérée, 20–39 faible, 0–19 critique.

**API:** `/api/irht`, `/api/v1/irht` — see `/docs`.

---

## 2. Who is it for?

| Audience | What they get |
|----------|----------------|
| **Our project team** | Explore data, test workflows, give feedback |
| **Bankers / insurers** | Watershed-level investment risk score + printable report |
| **Water & environment stakeholders** | SPI/SPEI drought layers, Québec wells (SIH), watershed zones (ZGIEBV) |
| **Developers / analysts** | Public API at `/docs` for drought scores and risk reports |

---

## 3. Quick start (2 minutes)

1. Open the site — you’ll see a **“Note to the team”** welcome message. Read it, pick your language, click **Got it**.
2. The map opens on **Québec** with drought colours (SPI) and blue **well dots**.
3. Open the **Layers** panel (left side, or the **☰** menu on mobile).
4. Try these three actions:
   - **Click a blue well** → composite drought score popup  
   - **Click a watershed outline** → investment risk panel at the bottom  
   - **Use the climate bar** at the bottom → switch to 2050 or 2100 scenarios  

That’s the core loop: **explore → click → read score → compare scenarios**.

---

## 4. Map tour

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Title · Search · API Docs · About · EN | FR       │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  LAYERS  │              MAP (click wells & watersheds)      │
│  panel   │                                                  │
│          │     [Climate scenario bar — bottom centre]       │
│          │     [Legend — bottom right]                      │
├──────────┴──────────────────────────────────────────────────┤
│  FOOTER: data attribution · coordinates                     │
└─────────────────────────────────────────────────────────────┘
```

| Area | What it does |
|------|----------------|
| **Layers panel** | Turn map layers on/off, switch region, adjust index weights, save favourite views |
| **Search bar** | Type a place name, press Enter — map flies there (Québec-focused geocoding) |
| **Map** | Pan, zoom, click features for details |
| **Climate bar** | Current · 2050 RCP 4.5 · 2050 RCP 8.5 · 2100 RCP 8.5 |
| **Legend** | Colour scale for SPI (default) or composite risk (after clicking a well) |
| **Export buttons** | Download visible wells as CSV or GeoJSON (Québec view) |

**Mobile:** Layers open as a slide-over drawer. Use **☰** or the **Layers** tab on the left edge to reopen after closing.

---

## 5. Step-by-step workflows

### A. Explore groundwater in Québec

1. Confirm **Region = Québec** in the Layers panel.
2. Ensure **Wells & Boreholes (SIH)** is checked.
3. Zoom to city level (wells appear at scale ~1:100,000).
4. **Click any blue dot** on a well.

You’ll see:

- Well depth, municipality, yield (if available)
- **Composite drought index** (single score combining several factors)
- SPI and SPEI values for that location
- A **risk tier** (Low → Extreme)

The legend switches to **Composite Risk** while the well popup is open.

---

### B. Assess investment risk for a watershed

1. In Québec view, enable **Watershed Boundaries (ZGIEBV)**.
2. **Click inside a coloured watershed zone.**

You’ll get:

- Watershed name and organization link
- A **risk panel** at the bottom with an overall score (/100)
- Breakdown: Drought · Climate · Watershed · Groundwater
- **Full report →** opens a printable page (Save as PDF from the browser)

**Tip:** Check **“Compare with current climate”** when viewing a future scenario to see how much risk increases.

---

### C. Compare climate futures

1. Use the bar at the bottom: **Current climate** vs **2050 — RCP 4.5**, etc.
2. The map overlay updates to projected SPEI-style conditions (via Environment Canada GeoMet).
3. Click a watershed again — the risk score recalculates for that scenario.

| Scenario | Plain meaning |
|----------|----------------|
| **Current** | Historical / observed conditions (AAFC SPI & SPEI) |
| **2050 RCP 4.5** | Moderate emissions, mid-century |
| **2050 RCP 8.5** | High emissions, mid-century |
| **2100 RCP 8.5** | High emissions, end of century |

---

### D. Switch to the Great Lakes (cross-border view)

1. In Layers, under **Region**, click **Great Lakes**.
2. The map flies to the full basin; **US SPI** and **basin boundary** layers turn on.
3. Québec-only layers (SIH wells, ZGIEBV watersheds) hide automatically — US-side drought is shown via NOAA HUC6 polygons (click for SPI value).

Use this view for **binational context**; detailed well and watershed risk tools are strongest in Québec for now.

---

### E. Customise the composite index (advanced)

Open **Index Weights** in the Layers panel:

| Component | Default weight | Meaning |
|-----------|----------------|---------|
| SPI | 35% | Rainfall drought |
| SPEI | 25% | Rain + evaporation drought |
| Groundwater | 25% | Stress from well depth |
| Yield | 15% | Pump test yield stress |

Sliders re-normalise to 100%. Click a well again to see the updated composite score.  
**Reset to defaults** restores the standard formula.

---

### F. Save a favourite map view

1. Pan/zoom to an area you care about.
2. In **My Areas**, type a name → **Save**.
3. Click the saved name later — map flies back instantly.

Saved areas stay in your browser (not tied to user accounts yet).

---

## 6. How the composite score works (simple version)

The platform merges four signals into **one number** and a **risk colour**:

```
Composite = weighted average of:
  • SPI   — how dry is rainfall?
  • SPEI  — how dry is rainfall minus evaporation?
  • Groundwater stress — inferred from well depth
  • Yield stress — inferred from pump test yield
```

**Higher composite = more water stress / drought concern.**

Risk tiers:

| Tier | Meaning (simplified) |
|------|----------------------|
| **Low** | Normal to wet conditions |
| **Moderate** | Some stress; monitor |
| **High** | Significant drought or groundwater pressure |
| **Extreme** | Severe, persistent water stress |

Full formulas and data citations: **About → Methodology** on the site (`/about`).

---

## 7. Data sources (what’s on the map)

| What you see | Source |
|--------------|--------|
| Blue well dots | Québec SIH — open groundwater inventory |
| Yellow/orange/red drought colours | AAFC SPI & SPEI (~5 km grids) |
| Light blue watershed outlines | Québec ZGIEBV (40 water management zones) |
| Orange basin outline | Great Lakes Commission boundary |
| US coloured regions | NOAA SPI by HUC6 watershed |
| Future climate layers | ECCC GeoMet-Climate projections |
| Base map | Satellite / terrain / street (toggle in Layers) |

All layers carry their original licences (mostly **CC-BY** for Québec data).

---

## 8. What this is *not* (limitations)

Be transparent with stakeholders:

- **Not a regulatory tool** — SIH does not list every well; field verification is still required.
- **Not real-time monitoring** — SPI/SPEI grids are periodic summaries, not live sensors.
- **Prototype scores** — composite weights and risk formula may change after team review.
- **Resolution limits** — drought rasters are ~5 km; fine for regional decisions, not parcel-level.
- **Québec-first depth** — richest well + watershed features are in Québec; Great Lakes view is expanding.

---

## 9. For developers on the team

| Resource | URL |
|----------|-----|
| API overview | `/docs` |
| Drought score API | `GET /api/v1/drought?lat=46.8&lng=-71.2` |
| Investment risk API | `GET /api/v1/risk?lat=46.8&lng=-71.2` |
| Climate scenarios list | `GET /api/v1/scenarios` |
| Methodology page | `/about` |
| GitHub | [Prosper-Mapepa/drought-index-aquahacking](https://github.com/Prosper-Mapepa/drought-index-aquahacking) |

Example — drought score at Québec City:

```
https://drought-index-aqua.netlify.app/api/v1/drought?lat=46.8&lng=-71.2&locale=en
```

---

## 10. Suggested demo script (5–10 min presentation)

1. **Hook (1 min):** “Water stress is hard to see on one spreadsheet. This map puts drought, groundwater, and climate futures in one place.”
2. **Québec wells (2 min):** Zoom to a familiar city, click a well, explain composite score and legend change.
3. **Watershed risk (2 min):** Click a ZGIEBV zone, walk through the bottom panel and open the PDF report.
4. **Climate future (2 min):** Switch to 2050 RCP 8.5, enable compare, click the same watershed — show risk delta.
5. **Great Lakes (1 min):** Toggle region, show cross-border SPI context.
6. **Close (1 min):** Prototype status, ask for feedback on weights, data gaps, and priority features.

---

## 11. FAQ

**Why don’t I see wells?**  
Zoom in (scale 1:100,000 or closer) and ensure **Region = Québec** and **SIH wells** is on.

**Why did the welcome note disappear?**  
It shows once per browser session. Open a new tab or clear session storage to see it again.

**Can I use this in a client meeting?**  
Yes for exploration and discussion — label it as a **prototype** and cite data sources from `/about`.

**How do I give feedback?**  
Share screen observations, preferred default region, weight tweaks, and missing datasets with the team (e.g. Prosper / project channel).

**Does it work on phone?**  
Yes — use the **☰** menu for layers; climate bar scrolls horizontally on small screens.

---

## 12. Glossary

| Term | Meaning |
|------|---------|
| **SPI** | Standardized Precipitation Index — negative = dry, positive = wet |
| **SPEI** | Like SPI but includes evaporation; better for warming climates |
| **SIH** | Québec’s groundwater well inventory (*Système d’information hydrogéologique*) |
| **ZGIEBV** | Québec’s 40 integrated water management watershed zones |
| **RCP 4.5 / 8.5** | Emissions pathways used in climate projections (moderate vs high) |
| **Composite index** | Our blended drought + groundwater stress score |
| **HUC6** | US hydrologic unit — roughly county-to-sub-basin scale |

---

*Document version: June 2025 · Great Lakes Drought Index team preview*  
*Questions or corrections — update this file in `docs/TEAM_GUIDE.md` and share with the group.*
