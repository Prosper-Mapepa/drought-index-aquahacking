import type { DroughtScore, RiskTier } from "./drought-index";
import { compositeToRiskTier, riskTierLabel } from "./drought-index";
import type { ClimateScenarioId } from "./scenarios";
import { getScenario } from "./scenarios";
import type { Locale, WatershedProperties } from "./types";

export interface InvestmentRiskReport {
  overallScore: number;
  riskTier: RiskTier;
  riskLabel: string;
  scenario: ClimateScenarioId;
  scenarioLabel: string;
  factors: {
    drought: number;
    climateProjection: number;
    watershed: number;
    groundwater: number;
  };
  recommendations: string[];
  watershed?: WatershedProperties;
  droughtScore?: DroughtScore;
}

function watershedIssueScore(props?: WatershedProperties): number {
  if (!props) return 0.5;
  let score = 0.3;
  const issues = `${props.CAT_PROB_A ?? ""} ${props.CAT_PROB_B ?? ""}`.toLowerCase();
  if (/érosion|erosion|sécheresse|drought|étiage|low flow/.test(issues)) score += 0.25;
  if (/eutroph|cyanobact|contamin|pollut/.test(issues)) score += 0.2;
  if (/prélèvement|withdrawal|stress|pénurie/.test(issues)) score += 0.15;
  return Math.min(score, 1);
}

function scenarioStressBonus(scenarioId: ClimateScenarioId): number {
  switch (scenarioId) {
    case "2050-rcp45":
      return 0.15;
    case "2050-rcp85":
      return 0.35;
    case "2100-rcp85":
      return 0.55;
    default:
      return 0;
  }
}

export function buildInvestmentRisk(params: {
  droughtScore: DroughtScore | null;
  watershed?: WatershedProperties;
  scenarioId: ClimateScenarioId;
  locale: Locale;
}): InvestmentRiskReport {
  const { droughtScore, watershed, scenarioId, locale } = params;
  const scenario = getScenario(scenarioId);

  const droughtFactor = droughtScore?.composite != null
    ? Math.max(0, Math.min(1, (droughtScore.composite + 2) / 4))
    : 0.5;

  const climateFactor = scenarioStressBonus(scenarioId);
  const watershedFactor = watershedIssueScore(watershed);
  const groundwaterFactor = droughtScore?.groundwaterStress ?? 0.5;

  const overallScore = Number(
    (
      droughtFactor * 0.35 +
      climateFactor * 0.25 +
      watershedFactor * 0.25 +
      groundwaterFactor * 0.15
    ).toFixed(2)
  );

  const normalizedComposite = overallScore * 2 - 1;
  const riskTier = compositeToRiskTier(normalizedComposite);

  const recommendations = buildRecommendations(riskTier, scenarioId, locale, watershed);

  return {
    overallScore,
    riskTier,
    riskLabel: riskTierLabel(riskTier, locale),
    scenario: scenarioId,
    scenarioLabel: scenario.label[locale],
    factors: {
      drought: Number(droughtFactor.toFixed(2)),
      climateProjection: Number(climateFactor.toFixed(2)),
      watershed: Number(watershedFactor.toFixed(2)),
      groundwater: Number(groundwaterFactor.toFixed(2)),
    },
    recommendations,
    watershed,
    droughtScore: droughtScore ?? undefined,
  };
}

function buildRecommendations(
  tier: RiskTier,
  scenarioId: ClimateScenarioId,
  locale: Locale,
  watershed?: WatershedProperties
): string[] {
  const isFr = locale === "fr";
  const recs: string[] = [];

  if (tier === "low" || tier === "moderate") {
    recs.push(
      isFr
        ? "Risque hydrique acceptable pour la plupart des investissements résidentiels et agricoles."
        : "Water risk acceptable for most residential and agricultural investments."
    );
  } else {
    recs.push(
      isFr
        ? "Évaluation approfondie de la disponibilité en eau recommandée avant tout investissement."
        : "Detailed water availability assessment recommended before investment."
    );
  }

  if (scenarioId !== "current") {
    recs.push(
      isFr
        ? `Projection ${getScenario(scenarioId).label.fr} : prévoir une augmentation du stress hydrique.`
        : `${getScenario(scenarioId).label.en} projection: anticipate increased water stress.`
    );
  }

  if (watershed?.CAT_PROB_A) {
    recs.push(
      isFr
        ? `Problématique prioritaire du bassin : ${watershed.CAT_PROB_A}.`
        : `Watershed priority issue: ${watershed.CAT_PROB_A}.`
    );
  }

  if (tier === "extreme") {
    recs.push(
      isFr
        ? "Assurance et financement pourraient exiger des mesures d'atténuation ou des primes plus élevées."
        : "Insurance and financing may require mitigation measures or higher premiums."
    );
  }

  return recs;
}
