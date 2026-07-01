/**
 * IRHT — Indice de Résilience Hydrique Territoriale
 * Formulation per LAPARA / Elias methodology (Formulation de l'IRHT.pdf)
 *
 * IRHT_j = 100 × (0.25·C + 0.20·H + 0.15·G + 0.15·T + 0.10·D + 0.15·E)
 * Each component normalized 0–1 (higher = greater resilience)
 */

import type { TerritorialFactors } from "./territorial-data";
import type { ClimateScenarioId } from "./scenarios";
import type { Locale, WatershedProperties } from "./types";

export const IRHT_COMPONENT_WEIGHTS = {
  climate: 0.25,
  hydrology: 0.2,
  hydrogeology: 0.15,
  territory: 0.15,
  demographic: 0.1,
  economy: 0.15,
} as const;

export type IrhtResilienceLevel =
  | "critical"
  | "low"
  | "moderate"
  | "high"
  | "veryHigh";

export interface IrhtComponents {
  climate: number;
  hydrology: number;
  hydrogeology: number;
  territory: number;
  demographic: number;
  economy: number;
}

export interface IrhtResult {
  irht: number;
  components: IrhtComponents;
  resilienceLevel: IrhtResilienceLevel;
  resilienceLabel: string;
}

export interface IrhtInput {
  spi: number | null;
  spei: number | null;
  depth?: number;
  yieldLpm?: number;
  territorial?: TerritorialFactors | null;
  watershed?: WatershedProperties;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

export function indexToResilience(value: number | null, fallback = 0.5): number {
  if (value == null || isNaN(value)) return fallback;
  return clamp01((value + 2) / 4);
}

export function depthToResilience(depth?: number): number | null {
  if (depth == null || isNaN(depth)) return null;
  if (depth < 30) return 0.75;
  if (depth < 60) return 0.55;
  if (depth < 90) return 0.35;
  return 0.2;
}

export function yieldToResilience(yieldLpm?: number): number | null {
  if (yieldLpm == null || isNaN(yieldLpm)) return null;
  if (yieldLpm >= 60) return 0.85;
  if (yieldLpm >= 30) return 0.65;
  if (yieldLpm >= 10) return 0.45;
  return 0.25;
}

function weightedMean(
  parts: { value: number | null; weight: number }[],
  fallback: number
): number {
  const available = parts.filter((p) => p.value != null) as {
    value: number;
    weight: number;
  }[];
  if (available.length === 0) return fallback;
  const totalW = available.reduce((s, p) => s + p.weight, 0);
  return available.reduce((s, p) => s + p.value * p.weight, 0) / totalW;
}

export function computeClimateComponent(
  spi: number | null,
  spei: number | null
): number {
  return weightedMean(
    [
      { value: indexToResilience(spi), weight: 0.25 },
      { value: indexToResilience(spei), weight: 0.35 },
    ],
    0.5
  );
}

export function computeHydrologyComponent(
  spi: number | null,
  spei: number | null
): number {
  const avg =
    spi != null && spei != null
      ? (spi + spei) / 2
      : spi ?? spei;
  return indexToResilience(avg);
}

export function computeHydrogeologyComponent(
  depth?: number,
  yieldLpm?: number
): number {
  const depR = depthToResilience(depth);
  const yieldR = yieldToResilience(yieldLpm);
  const gwlProxy = depR;
  const rechProxy =
    depR != null && yieldR != null ? (depR + yieldR) / 2 : depR ?? yieldR;

  return weightedMean(
    [
      { value: gwlProxy, weight: 0.4 },
      { value: rechProxy, weight: 0.3 },
      { value: depR, weight: 0.15 },
      { value: yieldR, weight: 0.15 },
    ],
    0.55
  );
}

export function computeTerritoryComponent(
  territorial?: TerritorialFactors | null
): number {
  if (!territorial) return 0.45;

  const text = `${territorial.landUse.category ?? ""} ${territorial.landUse.detail ?? ""}`.toLowerCase();

  const lu =
    /forêt|forest|boisé|boise|naturel|parc/.test(text) ? 0.7 :
    /aquatique|lac|humide|wetland/.test(text) ? 0.65 :
    /agricol|agri|culture/.test(text) ? 0.4 :
    /urbain|urban|commercial|industriel/.test(text) ? 0.3 :
    0.5;

  const imp = /urbain|urban|commercial|industriel|route/.test(text) ? 0.25 : 0.65;
  const agri = /agricol|agri|culture|irrigation/.test(text) ? 0.35 : 0.6;
  const eco = /humide|wetland|aquatique|lac|forêt|forest/.test(text) ? 0.75 : 0.45;

  return 0.3 * lu + 0.25 * imp + 0.25 * agri + 0.2 * eco;
}

export function computeDemographicComponent(
  territorial?: TerritorialFactors | null
): number {
  if (territorial?.demographics) return territorial.demographics.resilienceScore;
  if (!territorial) return 0.55;
  return clamp01(1 - territorial.demographicPressure * 0.5);
}

export function computeEconomyComponent(
  territorial?: TerritorialFactors | null,
  watershed?: WatershedProperties
): number {
  let inv = 0.5;
  let inf = 0.5;
  let ind = 0.5;
  let agrv = 0.5;

  if (territorial?.contamination.nearby) {
    const penalty = territorial.contamination.contaminationStress;
    inv = clamp01(0.5 - penalty * 0.4);
    inf = clamp01(0.5 - penalty * 0.3);
  }

  if (watershed) {
    const issues = `${watershed.CAT_PROB_A ?? ""} ${watershed.CAT_PROB_B ?? ""}`.toLowerCase();
    if (/sécheresse|drought|étiage|low flow|prélèvement|stress/.test(issues)) {
      agrv = 0.35;
      ind = 0.4;
    }
    if (/agricol|agri|irrigation/.test(issues)) agrv = 0.38;
  }

  return 0.3 * inv + 0.3 * inf + 0.2 * ind + 0.2 * agrv;
}

export function computeIrhtComponents(input: IrhtInput): IrhtComponents {
  return {
    climate: computeClimateComponent(input.spi, input.spei),
    hydrology: computeHydrologyComponent(input.spi, input.spei),
    hydrogeology: computeHydrogeologyComponent(input.depth, input.yieldLpm),
    territory: computeTerritoryComponent(input.territorial),
    demographic: computeDemographicComponent(input.territorial),
    economy: computeEconomyComponent(input.territorial, input.watershed),
  };
}

export function computeIrht(input: IrhtInput): number {
  const c = computeIrhtComponents(input);
  const w = IRHT_COMPONENT_WEIGHTS;
  const score =
    100 *
    (w.climate * c.climate +
      w.hydrology * c.hydrology +
      w.hydrogeology * c.hydrogeology +
      w.territory * c.territory +
      w.demographic * c.demographic +
      w.economy * c.economy);
  return Number(score.toFixed(1));
}

export function irhtToResilienceLevel(irht: number): IrhtResilienceLevel {
  if (irht >= 80) return "veryHigh";
  if (irht >= 60) return "high";
  if (irht >= 40) return "moderate";
  if (irht >= 20) return "low";
  return "critical";
}

export function resilienceLevelLabel(
  level: IrhtResilienceLevel,
  locale: Locale
): string {
  const labels = {
    en: {
      critical: "Critical (0–19)",
      low: "Low resilience (20–39)",
      moderate: "Moderate (40–59)",
      high: "High (60–79)",
      veryHigh: "Very high (80–100)",
    },
    fr: {
      critical: "Critique (0–19)",
      low: "Faible (20–39)",
      moderate: "Modérée (40–59)",
      high: "Élevée (60–79)",
      veryHigh: "Très élevée (80–100)",
    },
  };
  return labels[locale][level];
}

export function resilienceLevelColor(level: IrhtResilienceLevel): string {
  const colors: Record<IrhtResilienceLevel, string> = {
    critical: "#dc2626",
    low: "#f97316",
    moderate: "#eab308",
    high: "#84cc16",
    veryHigh: "#22c55e",
  };
  return colors[level];
}

/** Map resilience level to legacy risk tier for existing UI badges */
export function resilienceToRiskTier(
  level: IrhtResilienceLevel
): "low" | "moderate" | "high" | "extreme" {
  switch (level) {
    case "veryHigh":
    case "high":
      return "low";
    case "moderate":
      return "moderate";
    case "low":
      return "high";
    case "critical":
      return "extreme";
  }
}

export function buildIrhtResult(input: IrhtInput, locale: Locale): IrhtResult {
  const components = computeIrhtComponents(input);
  const irht = computeIrht(input);
  const resilienceLevel = irhtToResilienceLevel(irht);
  return {
    irht,
    components,
    resilienceLevel,
    resilienceLabel: resilienceLevelLabel(resilienceLevel, locale),
  };
}

export const YAMASKA_DEMO = {
  current: {
    components: {
      climate: 0.55,
      hydrology: 0.5,
      hydrogeology: 0.6,
      territory: 0.45,
      demographic: 0.55,
      economy: 0.5,
    } as IrhtComponents,
    irht: 52.5,
  },
  scenario2050: {
    components: {
      climate: 0.3,
      hydrology: 0.28,
      hydrogeology: 0.38,
      territory: 0.35,
      demographic: 0.42,
      economy: 0.32,
    } as IrhtComponents,
    irht: 33.05,
  },
};

export function computeIrhtFromComponents(components: IrhtComponents): number {
  const w = IRHT_COMPONENT_WEIGHTS;
  return Number(
    (
      100 *
      (w.climate * components.climate +
        w.hydrology * components.hydrology +
        w.hydrogeology * components.hydrogeology +
        w.territory * components.territory +
        w.demographic * components.demographic +
        w.economy * components.economy)
    ).toFixed(1)
  );
}

const SCENARIO_COMPONENT_TARGETS: Partial<
  Record<ClimateScenarioId, IrhtComponents>
> = {
  "2050-rcp45": {
    climate: 0.42,
    hydrology: 0.4,
    hydrogeology: 0.48,
    territory: 0.42,
    demographic: 0.48,
    economy: 0.42,
  },
  "2050-rcp85": YAMASKA_DEMO.scenario2050.components,
  "2100-rcp85": {
    climate: 0.22,
    hydrology: 0.2,
    hydrogeology: 0.28,
    territory: 0.28,
    demographic: 0.35,
    economy: 0.25,
  },
};

function blendComponents(
  current: IrhtComponents,
  target: IrhtComponents,
  t: number
): IrhtComponents {
  const keys = Object.keys(current) as (keyof IrhtComponents)[];
  const out = {} as IrhtComponents;
  for (const k of keys) {
    out[k] = Number((current[k] + (target[k] - current[k]) * t).toFixed(3));
  }
  return out;
}

/** Apply climate-scenario stress to IRHT (LAPARA Yamaska-style projection) */
export function applyScenarioToIrht(
  base: IrhtResult,
  scenarioId: ClimateScenarioId,
  locale: Locale = "en"
): IrhtResult & { baseIrht: number } {
  if (scenarioId === "current") {
    return { ...base, baseIrht: base.irht };
  }

  const target = SCENARIO_COMPONENT_TARGETS[scenarioId];
  if (!target) {
    const t = scenarioId === "custom" ? 0.55 : 0.45;
    const stressed = blendComponents(base.components, YAMASKA_DEMO.scenario2050.components, t);
    const irht = computeIrhtFromComponents(stressed);
    const resilienceLevel = irhtToResilienceLevel(irht);
    return {
      irht,
      components: stressed,
      resilienceLevel,
      resilienceLabel: resilienceLevelLabel(resilienceLevel, locale),
      baseIrht: base.irht,
    };
  }

  const t = scenarioId === "2100-rcp85" ? 1 : scenarioId === "2050-rcp85" ? 1 : 0.65;
  const stressed = blendComponents(base.components, target, t);
  const irht = computeIrhtFromComponents(stressed);
  const resilienceLevel = irhtToResilienceLevel(irht);
  return {
    irht,
    components: stressed,
    resilienceLevel,
    resilienceLabel: resilienceLevelLabel(resilienceLevel, locale),
    baseIrht: base.irht,
  };
}

export function formatComponentsBreakdown(
  components: IrhtComponents,
  locale: Locale
): { key: keyof IrhtComponents; label: string; value: number; weight: string }[] {
  const labels = {
    en: {
      climate: "Climate (C)",
      hydrology: "Hydrology (H)",
      hydrogeology: "Hydrogeology (G)",
      territory: "Territory (T)",
      demographic: "Demographics (D)",
      economy: "Economy (E)",
    },
    fr: {
      climate: "Climat (C)",
      hydrology: "Hydrologie (H)",
      hydrogeology: "Hydrogéologie (G)",
      territory: "Territoire (T)",
      demographic: "Démographie (D)",
      economy: "Économie (E)",
    },
  };
  const w = IRHT_COMPONENT_WEIGHTS;
  const weightPct: Record<keyof IrhtComponents, string> = {
    climate: "25%",
    hydrology: "20%",
    hydrogeology: "15%",
    territory: "15%",
    demographic: "10%",
    economy: "15%",
  };
  return (Object.keys(components) as (keyof IrhtComponents)[]).map((key) => ({
    key,
    label: labels[locale][key],
    value: components[key],
    weight: weightPct[key],
  }));
}
