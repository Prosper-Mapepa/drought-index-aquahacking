import { droughtLabel, DROUGHT_COLORS } from "./constants";
import {
  buildIrhtResult,
  applyScenarioToIrht,
  irhtToResilienceLevel,
  resilienceLevelColor,
  resilienceLevelLabel,
  resilienceToRiskTier,
  type IrhtComponents,
  type IrhtResilienceLevel,
} from "./irht";
import type { ClimateScenarioId } from "./scenarios";
import { computeGroundwaterStress, computeYieldStress } from "./irht-stress";
import type { TerritorialFactors } from "./territorial-data";
import type { Locale, WatershedProperties } from "./types";

export type { IrhtComponents, IrhtResilienceLevel };
export { resilienceLevelColor, resilienceLevelLabel };

export type RiskTier = "low" | "moderate" | "high" | "extreme";

export interface DroughtScore {
  spi: number | null;
  spei: number | null;
  groundwaterStress: number | null;
  yieldStress: number | null;
  landUseStress: number | null;
  contaminationStress: number | null;
  demographicStress: number | null;
  /** Legacy stress scale — prefer `irht` (0–100, higher = more resilient) */
  composite: number | null;
  irht: number | null;
  components: IrhtComponents | null;
  resilienceLevel: IrhtResilienceLevel;
  riskTier: RiskTier;
  riskLabel: string;
  droughtCategory: string;
  landUseCategory?: string | null;
}

const RISK_COLORS: Record<RiskTier, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  extreme: "#dc2626",
};

export { computeGroundwaterStress, computeYieldStress };

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
    territorial?: TerritorialFactors | null;
    watershed?: WatershedProperties;
    scenarioId?: ClimateScenarioId;
  },
  locale: Locale
): DroughtScore {
  const groundwaterStress = computeGroundwaterStress(params.depth);
  const yieldStress = computeYieldStress(params.yieldLpm);

  const base = buildIrhtResult(
    {
      spi: params.spi,
      spei: params.spei,
      depth: params.depth,
      yieldLpm: params.yieldLpm,
      territorial: params.territorial,
      watershed: params.watershed,
    },
    locale
  );

  const projected =
    params.scenarioId && params.scenarioId !== "current"
      ? applyScenarioToIrht(base, params.scenarioId, locale)
      : { ...base, baseIrht: base.irht };

  const riskTier = resilienceToRiskTier(projected.resilienceLevel);
  const legacyComposite = Number(((projected.irht - 50) / 25).toFixed(2));

  return {
    spi: params.spi,
    spei: params.spei,
    groundwaterStress,
    yieldStress,
    landUseStress: params.territorial?.landUse.landUseStress ?? null,
    contaminationStress: params.territorial?.contamination.contaminationStress ?? null,
    demographicStress: params.territorial?.demographicPressure ?? null,
    composite: legacyComposite,
    irht: projected.irht,
    components: projected.components,
    resilienceLevel: projected.resilienceLevel,
    riskTier,
    riskLabel: projected.resilienceLabel,
    droughtCategory:
      params.spi != null ? droughtLabel(params.spi, locale) : "—",
    landUseCategory: params.territorial?.landUse.category ?? null,
  };
}

export function riskTierColor(tier: RiskTier): string {
  return RISK_COLORS[tier];
}

export function irhtDisplayColor(irht: number | null): string {
  if (irht == null) return RISK_COLORS.moderate;
  return resilienceLevelColor(irhtToResilienceLevel(irht));
}

export function scoreBarColor(value: number): string {
  if (value <= -1) return DROUGHT_COLORS.wet;
  if (value <= 0) return DROUGHT_COLORS.normal;
  if (value <= 1) return DROUGHT_COLORS.moderate;
  return DROUGHT_COLORS.severe;
}
