import { droughtLabel, DROUGHT_COLORS } from "./constants";
import { DEFAULT_INDEX_WEIGHTS, normalizeWeights } from "./index-weights";
import type { IndexWeights, Locale } from "./types";

export type RiskTier = "low" | "moderate" | "high" | "extreme";

export interface DroughtScore {
  spi: number | null;
  spei: number | null;
  groundwaterStress: number | null;
  yieldStress: number | null;
  composite: number | null;
  riskTier: RiskTier;
  riskLabel: string;
  droughtCategory: string;
}

const RISK_COLORS: Record<RiskTier, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#dc2626",
};

export function computeGroundwaterStress(depth?: number): number | null {
  if (depth == null || isNaN(depth)) return null;
  if (depth < 30) return 0.8;
  if (depth < 60) return 0.5;
  return 0.2;
}

export function computeYieldStress(yieldLpm?: number): number | null {
  if (yieldLpm == null || isNaN(yieldLpm)) return null;
  if (yieldLpm < 10) return 0.9;
  if (yieldLpm < 30) return 0.6;
  if (yieldLpm < 60) return 0.35;
  return 0.15;
}

export function computeCompositeIndex(
  spi: number | null,
  spei: number | null,
  groundwaterStress: number | null,
  yieldStress: number | null,
  weights: IndexWeights = DEFAULT_INDEX_WEIGHTS
): number | null {
  const w = normalizeWeights(weights);
  const components: { value: number; weight: number }[] = [];

  if (spi != null) components.push({ value: -spi, weight: w.spi });
  if (spei != null) components.push({ value: -spei, weight: w.spei });
  if (groundwaterStress != null)
    components.push({ value: groundwaterStress * 2 - 1, weight: w.groundwater });
  if (yieldStress != null)
    components.push({ value: yieldStress * 2 - 1, weight: w.yield });

  if (components.length === 0) return null;

  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  const composite =
    components.reduce((s, c) => s + c.value * c.weight, 0) / totalWeight;

  return Number(composite.toFixed(2));
}

export function compositeToRiskTier(composite: number | null): RiskTier {
  if (composite == null) return "moderate";
  if (composite <= -0.5) return "low";
  if (composite <= 0.5) return "moderate";
  if (composite <= 1.2) return "high";
  return "extreme";
}

export function riskTierLabel(tier: RiskTier, locale: Locale): string {
  const labels = {
    en: { low: "Low risk", moderate: "Moderate risk", high: "High risk", extreme: "Extreme risk" },
    fr: { low: "Risque faible", moderate: "Risque modéré", high: "Risque élevé", extreme: "Risque extrême" },
  };
  return labels[locale][tier];
}

export function buildDroughtScore(
  params: {
    spi: number | null;
    spei: number | null;
    depth?: number;
    yieldLpm?: number;
    weights?: IndexWeights;
  },
  locale: Locale
): DroughtScore {
  const groundwaterStress = computeGroundwaterStress(params.depth);
  const yieldStress = computeYieldStress(params.yieldLpm);
  const composite = computeCompositeIndex(
    params.spi,
    params.spei,
    groundwaterStress,
    yieldStress,
    params.weights
  );
  const riskTier = compositeToRiskTier(composite);

  return {
    spi: params.spi,
    spei: params.spei,
    groundwaterStress,
    yieldStress,
    composite,
    riskTier,
    riskLabel: riskTierLabel(riskTier, locale),
    droughtCategory:
      params.spi != null ? droughtLabel(params.spi, locale) : "—",
  };
}

export function riskTierColor(tier: RiskTier): string {
  return RISK_COLORS[tier];
}

export function scoreBarColor(value: number): string {
  if (value <= -1) return DROUGHT_COLORS.wet;
  if (value <= 0) return DROUGHT_COLORS.normal;
  if (value <= 1) return DROUGHT_COLORS.moderate;
  return DROUGHT_COLORS.severe;
}
