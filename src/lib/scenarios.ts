import type { Locale } from "./types";

export type ClimateScenarioId =
  | "current"
  | "2050-rcp45"
  | "2050-rcp85"
  | "2100-rcp85";

export interface ClimateScenario {
  id: ClimateScenarioId;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
  year: number | null;
  rcp: string | null;
  /** AAFC SPI for current; GeoMet WMS layer for projections */
  wmsLayer: string | null;
  useAafcSpi: boolean;
}

export const CLIMATE_SCENARIOS: ClimateScenario[] = [
  {
    id: "current",
    label: { en: "Current climate", fr: "Climat actuel" },
    description: {
      en: "Observed historical conditions (AAFC SPI/SPEI)",
      fr: "Conditions historiques observées (SPI/SPEI AAC)",
    },
    year: null,
    rcp: null,
    wmsLayer: null,
    useAafcSpi: true,
  },
  {
    id: "2050-rcp45",
    label: { en: "2050 — RCP 4.5", fr: "2050 — RCP 4.5" },
    description: {
      en: "Moderate emissions scenario, mid-century projection",
      fr: "Scénario d'émissions modérées, projection mi-siècle",
    },
    year: 2050,
    rcp: "4.5",
    wmsLayer: "SPEI-3.RCP4.5.ENS_PCTL50",
    useAafcSpi: false,
  },
  {
    id: "2050-rcp85",
    label: { en: "2050 — RCP 8.5", fr: "2050 — RCP 8.5" },
    description: {
      en: "High emissions scenario, mid-century projection",
      fr: "Scénario d'émissions élevées, projection mi-siècle",
    },
    year: 2050,
    rcp: "8.5",
    wmsLayer: "SPEI-3.RCP8.5.ENS_PCTL50",
    useAafcSpi: false,
  },
  {
    id: "2100-rcp85",
    label: { en: "2100 — RCP 8.5", fr: "2100 — RCP 8.5" },
    description: {
      en: "High emissions scenario, end-of-century projection",
      fr: "Scénario d'émissions élevées, fin de siècle",
    },
    year: 2100,
    rcp: "8.5",
    wmsLayer: "SPEI-3.RCP8.5.ENS_PCTL50",
    useAafcSpi: false,
  },
];

export const GEOMET_CLIMATE_WMS =
  "https://geo.weather.gc.ca/geomet-climate";

export function getScenario(id: ClimateScenarioId): ClimateScenario {
  return CLIMATE_SCENARIOS.find((s) => s.id === id) ?? CLIMATE_SCENARIOS[0];
}

export function scenarioLabel(id: ClimateScenarioId, locale: Locale): string {
  return getScenario(id).label[locale];
}
