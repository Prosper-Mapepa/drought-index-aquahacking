import type { Locale } from "./types";

export type SpeiTimescale = 1 | 3 | 12;
export type RcpPathway = "2.6" | "4.5" | "8.5";
export type EnsemblePercentile = 25 | 50 | 75;
export type ProjectionYear = 2030 | 2050 | 2080 | 2100;

export interface CustomScenarioConfig {
  timescale: SpeiTimescale;
  rcp: RcpPathway;
  percentile: EnsemblePercentile;
  year: ProjectionYear;
}

export type ClimateScenarioId =
  | "current"
  | "2050-rcp45"
  | "2050-rcp85"
  | "2100-rcp85"
  | "custom";

export interface ClimateScenario {
  id: ClimateScenarioId;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
  year: number | null;
  rcp: string | null;
  timescale: SpeiTimescale | null;
  percentile: EnsemblePercentile | null;
  /** AAFC SPI for current; GeoMet WMS layer for projections */
  wmsLayer: string | null;
  useAafcSpi: boolean;
}

export const DEFAULT_CUSTOM_SCENARIO: CustomScenarioConfig = {
  timescale: 3,
  rcp: "4.5",
  percentile: 50,
  year: 2050,
};

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
    timescale: null,
    percentile: null,
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
    timescale: 3,
    percentile: 50,
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
    timescale: 3,
    percentile: 50,
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
    timescale: 3,
    percentile: 50,
    wmsLayer: "SPEI-3.RCP8.5.ENS_PCTL50",
    useAafcSpi: false,
  },
];

export const GEOMET_CLIMATE_WMS =
  "https://geo.weather.gc.ca/geomet-climate";

export function buildSpeiWmsLayer(
  config: Pick<CustomScenarioConfig, "timescale" | "rcp" | "percentile">
): string {
  return `SPEI-${config.timescale}.RCP${config.rcp}.ENS_PCTL${config.percentile}`;
}

function customScenarioLabel(
  config: CustomScenarioConfig,
  locale: Locale
): string {
  const pct = `P${config.percentile}`;
  if (locale === "fr") {
    return `${config.year} — RCP ${config.rcp} · SPEI-${config.timescale} · ${pct}`;
  }
  return `${config.year} — RCP ${config.rcp} · SPEI-${config.timescale} · ${pct}`;
}

function customScenarioDescription(
  config: CustomScenarioConfig,
  locale: Locale
): string {
  if (locale === "fr") {
    return `Scénario personnalisé : SPEI-${config.timescale}, RCP ${config.rcp}, ${config.year}, percentile ${config.percentile}`;
  }
  return `Custom scenario: SPEI-${config.timescale}, RCP ${config.rcp}, ${config.year}, ${config.percentile}th percentile`;
}

export function buildCustomScenario(config: CustomScenarioConfig): ClimateScenario {
  return {
    id: "custom",
    label: {
      en: customScenarioLabel(config, "en"),
      fr: customScenarioLabel(config, "fr"),
    },
    description: {
      en: customScenarioDescription(config, "en"),
      fr: customScenarioDescription(config, "fr"),
    },
    year: config.year,
    rcp: config.rcp,
    timescale: config.timescale,
    percentile: config.percentile,
    wmsLayer: buildSpeiWmsLayer(config),
    useAafcSpi: false,
  };
}

export function getScenario(id: ClimateScenarioId): ClimateScenario {
  return CLIMATE_SCENARIOS.find((s) => s.id === id) ?? CLIMATE_SCENARIOS[0];
}

export function resolveScenario(
  id: ClimateScenarioId,
  custom?: CustomScenarioConfig | null
): ClimateScenario {
  if (id === "custom") {
    return buildCustomScenario(custom ?? DEFAULT_CUSTOM_SCENARIO);
  }
  return getScenario(id);
}

export function scenarioLabel(
  id: ClimateScenarioId,
  locale: Locale,
  custom?: CustomScenarioConfig | null
): string {
  return resolveScenario(id, custom).label[locale];
}

export function parseCustomScenarioFromSearchParams(
  params: URLSearchParams
): CustomScenarioConfig {
  const timescale = parseInt(params.get("timescale") ?? "3", 10);
  const rcp = params.get("rcp") ?? "4.5";
  const percentile = parseInt(params.get("percentile") ?? "50", 10);
  const year = parseInt(params.get("year") ?? "2050", 10);

  const validTimescales: SpeiTimescale[] = [1, 3, 12];
  const validRcps: RcpPathway[] = ["2.6", "4.5", "8.5"];
  const validPercentiles: EnsemblePercentile[] = [25, 50, 75];
  const validYears: ProjectionYear[] = [2030, 2050, 2080, 2100];

  return {
    timescale: validTimescales.includes(timescale as SpeiTimescale)
      ? (timescale as SpeiTimescale)
      : DEFAULT_CUSTOM_SCENARIO.timescale,
    rcp: validRcps.includes(rcp as RcpPathway)
      ? (rcp as RcpPathway)
      : DEFAULT_CUSTOM_SCENARIO.rcp,
    percentile: validPercentiles.includes(percentile as EnsemblePercentile)
      ? (percentile as EnsemblePercentile)
      : DEFAULT_CUSTOM_SCENARIO.percentile,
    year: validYears.includes(year as ProjectionYear)
      ? (year as ProjectionYear)
      : DEFAULT_CUSTOM_SCENARIO.year,
  };
}

export function scenarioStressBonus(scenario: ClimateScenario): number {
  if (scenario.useAafcSpi) return 0;

  const rcpBonus =
    scenario.rcp === "2.6" ? 0.08 : scenario.rcp === "4.5" ? 0.15 : 0.35;

  const year = scenario.year ?? 2050;
  const yearBonus =
    year >= 2100 ? 0.2 : year >= 2080 ? 0.15 : year >= 2050 ? 0.05 : 0;

  const pct = scenario.percentile ?? 50;
  const percentileBonus = pct === 25 ? 0.1 : pct === 75 ? -0.05 : 0;

  return Math.min(Math.max(rcpBonus + yearBonus + percentileBonus, 0), 0.65);
}

export function appendCustomScenarioParams(
  params: URLSearchParams,
  scenarioId: ClimateScenarioId,
  custom?: CustomScenarioConfig | null
) {
  if (scenarioId !== "custom" || !custom) return;
  params.set("timescale", String(custom.timescale));
  params.set("rcp", custom.rcp);
  params.set("percentile", String(custom.percentile));
  params.set("year", String(custom.year));
}
