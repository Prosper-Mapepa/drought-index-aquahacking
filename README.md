# Great Lakes Drought Index

Operational drought index mapping platform for Québec and the Great Lakes region.

## Phase 3 Features

- **Great Lakes expansion** — cross-border basin boundary ([GLC](https://gis.glc.org)) and US SPI by HUC6 ([NOAA NClimGrid](https://gis.ncdc.noaa.gov/arcgis/rest/services/cdo/nclimgrid/MapServer/125))
- **Region switching** — toggle between Québec and Great Lakes views with automatic layer defaults
- **Configurable index weights** — adjust SPI, SPEI, groundwater, and yield weights in the sidebar
- **Saved areas** — bookmark map views in localStorage and fly back with one click
- **Public API v1** — `/api/v1/drought`, `/api/v1/risk`, `/api/v1/scenarios` with docs at `/docs`

## Phase 2 Features

- **Climate scenarios** — Current, 2050 RCP 4.5/8.5, 2100 RCP 8.5 via [ECCC GeoMet-Climate](https://geo.weather.gc.ca/geomet-climate)
- **Scenario comparison** — Compare projected vs current climate risk side-by-side
- **Investment risk scoring** — Watershed-level risk for bankers and insurers
- **Risk panel** — Bottom drawer with factor breakdown on watershed click
- **Printable reports** — `/report` page with Print/Save PDF

## Phase 1 Features

- **GWA-style map UI** — full-screen Leaflet map with collapsible layer sidebar
- **SIH wells layer** — Québec groundwater wells from [ArcGIS Layer 78](https://www.servicesgeo.enviroweb.gouv.qc.ca/donnees/rest/services/Public/Themes_publics/MapServer/78)
- **Composite drought scoring** — click a well to see SPI, SPEI, groundwater stress, and risk tier
- **SPI / SPEI overlays** — drought indices from Agriculture and Agri-Food Canada
- **Watershed popups** — ZGIEBV zone details on click ([Layer 83](https://www.servicesgeo.enviroweb.gouv.qc.ca/donnees/rest/services/Public/Themes_publics/MapServer/83))
- **About / methodology page** — `/about` documents the composite index formula and data sources
- **Bilingual UI** — French and English
- **Data export** — CSV and GeoJSON for visible wells
- **SIH disclaimer** — required acknowledgment on first visit

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Team presentation guide:** see [docs/TEAM_GUIDE.md](docs/TEAM_GUIDE.md) for a plain-language walkthrough to share with teammates.

## Data Sources

| Layer | Source |
|-------|--------|
| Wells & Boreholes (SIH) | Gouvernement du Québec — CC-BY 4.0 |
| SPI / SPEI | Agriculture and Agri-Food Canada |
| Watersheds | Gouvernement du Québec |
| Great Lakes Basin | Great Lakes Commission |
| US SPI (HUC6) | NOAA NClimGrid |
| Base maps | Esri, OpenTopoMap, OpenStreetMap |

## Tech Stack

- Next.js 15 + TypeScript
- Leaflet + react-leaflet + esri-leaflet
- Tailwind CSS

## Deploy to Netlify

This app uses Next.js API routes (`/api/*`), so it needs Netlify’s Next.js runtime — not a static export.

### Option A — Git (recommended)

1. Push the repo to GitHub, GitLab, or Bitbucket.
2. In [Netlify](https://app.netlify.com), click **Add new site → Import an existing project**.
3. Connect the repo. Netlify reads `netlify.toml` automatically:
   - **Build command:** `npm run build`
   - **Plugin:** `@netlify/plugin-nextjs` (handles routing and serverless API routes)
4. Deploy. Your site will be live at `https://<name>.netlify.app`.

Optional environment variable in Netlify → **Site configuration → Environment variables**:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_BASE_URL` | `https://your-site.netlify.app` (for API docs examples) |

Netlify also sets `URL` automatically at build time if you skip this.

### Option B — Netlify CLI

```bash
npm install -g netlify-cli
npm install
npm run build
netlify login
netlify init        # link or create a site
netlify deploy --prod
```

### Local Netlify build test

```bash
npm install
npm run build
npx netlify dev     # simulates Netlify locally (API routes + redirects)
```

## License

Platform code: MIT. Data layers retain their original licenses (CC-BY 4.0 for Québec open data).
