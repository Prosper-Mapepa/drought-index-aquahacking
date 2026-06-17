import type { DroughtScore } from "./drought-index";
import { riskTierColor } from "./drought-index";
import type { InvestmentRiskReport } from "./investment-risk";
import type { ClimateScenarioId } from "./scenarios";
import type { Locale, IndexWeights } from "./types";
import type { WellProperties, WatershedProperties } from "./types";

const popupStyles = {
  font: "font-family:system-ui,-apple-system,sans-serif",
  table: "font-size:12px;border-collapse:collapse;width:100%",
  label: "padding:4px 12px 4px 0;font-weight:600;color:#64748b;white-space:nowrap;vertical-align:top;width:38%",
  value: "padding:4px 0;color:#1e293b;vertical-align:top;word-break:break-word;line-height:1.4",
};

function row(label: string, value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  return `<tr><td style="${popupStyles.label}">${label}</td><td style="${popupStyles.value}">${value}</td></tr>`;
}

export function formatLoadingPopup(locale: Locale): string {
  const text = locale === "fr" ? "Calcul de l'indice..." : "Computing drought index...";
  return `<div style="${popupStyles.font};min-width:200px;padding:4px 0">
    <span style="color:#64748b;font-size:12px">${text}</span>
  </div>`;
}

export function formatWellPopup(
  props: WellProperties,
  score: DroughtScore | null,
  locale: Locale
): string {
  const L =
    locale === "fr"
      ? {
          id: "No. forage",
          depth: "Profondeur",
          city: "Municipalité",
          level: "Niveau",
          yield: "Débit",
          date: "Date",
          composite: "Indice composite",
          spi: "SPI",
          spei: "SPEI",
          gwStress: "Stress hydrique",
          risk: "Niveau de risque",
          drought: "Catégorie sécheresse",
        }
      : {
          id: "Well ID",
          depth: "Depth",
          city: "Municipality",
          level: "Water level",
          yield: "Yield",
          date: "Date",
          composite: "Composite index",
          spi: "SPI",
          spei: "SPEI",
          gwStress: "Groundwater stress",
          risk: "Risk level",
          drought: "Drought category",
        };

  const rows = [
    row(L.depth, props.PROFOND_PUITS ? `${props.PROFOND_PUITS} m` : null),
    row(L.city, props.VILLE),
    row(L.level, props.NIVEAU),
    row(L.yield, props.DEBT_ESSAI_POMP ? `${props.DEBT_ESSAI_POMP} L/min` : null),
    row(L.date, props.DATE_FORAGE),
  ].join("");

  let scoreSection = "";
  if (score) {
    const tierColor = riskTierColor(score.riskTier);
    const compositeDisplay =
      score.composite != null ? score.composite.toFixed(2) : "—";

    scoreSection = `
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid #e2e8f0">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">
            ${L.composite}
          </span>
          <span style="background:${tierColor};color:#fff;font-size:11px;font-weight:700;
                         padding:2px 8px;border-radius:9999px">${score.riskLabel}</span>
        </div>
        <div style="font-size:28px;font-weight:700;color:#1e293b;line-height:1">${compositeDisplay}</div>
        <table style="${popupStyles.table};margin-top:8px">
          ${row(L.spi, score.spi != null ? score.spi.toFixed(2) : null)}
          ${row(L.spei, score.spei != null ? score.spei.toFixed(2) : null)}
          ${row(L.gwStress, score.groundwaterStress != null ? `${(score.groundwaterStress * 100).toFixed(0)}%` : null)}
          ${row(L.drought, score.droughtCategory !== "—" ? score.droughtCategory : null)}
        </table>
      </div>`;
  }

  return `<div style="${popupStyles.font};min-width:220px;max-width:300px">
    <strong style="font-size:14px;color:#0f172a">${props.CLE_PUITS ?? "—"}</strong>
    <table style="${popupStyles.table};margin-top:6px">${rows}</table>
    ${scoreSection}
  </div>`;
}

export function formatWatershedPopup(
  props: WatershedProperties,
  locale: Locale,
  risk?: InvestmentRiskReport | null
): string {
  const L =
    locale === "fr"
      ? {
          zone: "Zone ZGIEBV",
          obv: "Organisme de bassin",
          sigle: "Sigle",
          area: "Superficie",
          probA: "Problématiques (A)",
          probB: "Problématiques (B)",
          pde: "Plan directeur de l'eau",
          website: "Site web",
        }
      : {
          zone: "ZGIEBV Zone",
          obv: "Watershed Organization",
          sigle: "Acronym",
          area: "Area",
          probA: "Priority issues (A)",
          probB: "Priority issues (B)",
          pde: "Water Master Plan",
          website: "Website",
        };

  const rows = [
    row(L.obv, props.OBV),
    row(L.area, props.ZGIE_KM2 ? `${props.ZGIE_KM2.toLocaleString()} km²` : null),
    row(L.probA, props.CAT_PROB_A),
    row(L.probB, props.CAT_PROB_B),
    row(L.pde, props.PDE),
  ].join("");

  const websiteLink = props.SITE_WEB
    ? `<a href="${props.SITE_WEB}" target="_blank" rel="noopener noreferrer"
         style="display:inline-flex;align-items:center;gap:4px;color:#2563eb;font-size:12px;
                font-weight:500;text-decoration:none;margin-top:4px">
         ${locale === "fr" ? "Visiter le site de l'OBV →" : "Visit watershed organization →"}
       </a>`
    : "";

  const riskSection = risk
    ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid #e2e8f0">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <span style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase">
            ${locale === "fr" ? "Risque d'investissement" : "Investment risk"}
          </span>
          <span style="background:${riskTierColor(risk.riskTier)};color:#fff;font-size:11px;font-weight:700;
                         padding:2px 8px;border-radius:9999px">${risk.riskLabel}</span>
        </div>
        <div style="font-size:22px;font-weight:700;color:#1e293b;margin-top:4px">
          ${(risk.overallScore * 100).toFixed(0)}<span style="font-size:12px;color:#64748b"> /100</span>
        </div>
        <div style="font-size:11px;color:#64748b;margin-top:2px">${risk.scenarioLabel}</div>
      </div>`
    : "";

  return `<div style="${popupStyles.font};min-width:340px;max-width:400px">
    <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:2px;line-height:1.3">
      ${props.ZGIEBV ?? "—"}
    </div>
    ${props.SIGLE ? `<div style="font-size:11px;color:#64748b;margin-bottom:8px">${props.SIGLE}</div>` : ""}
    <table style="${popupStyles.table}">${rows}</table>
    ${riskSection}
    ${websiteLink ? `<div style="margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f0">${websiteLink}</div>` : ""}
  </div>`;
}

export async function fetchDroughtScore(
  lat: number,
  lng: number,
  depth?: number,
  yieldLpm?: number,
  locale: Locale = "en",
  scenario: ClimateScenarioId = "current",
  weights?: IndexWeights
): Promise<DroughtScore | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    locale,
    scenario,
  });
  if (depth != null) params.set("depth", String(depth));
  if (yieldLpm != null) params.set("yield", String(yieldLpm));
  if (weights) {
    params.set("w_spi", String(weights.spi));
    params.set("w_spei", String(weights.spei));
    params.set("w_gw", String(weights.groundwater));
    params.set("w_yield", String(weights.yield));
  }

  try {
    const res = await fetch(`/api/drought?${params}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchInvestmentRisk(
  lat: number,
  lng: number,
  scenario: ClimateScenarioId,
  locale: Locale,
  watershed?: WatershedProperties,
  weights?: IndexWeights
): Promise<InvestmentRiskReport | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    locale,
    scenario,
  });
  if (watershed) params.set("watershed", JSON.stringify(watershed));
  if (weights) {
    params.set("w_spi", String(weights.spi));
    params.set("w_spei", String(weights.spei));
    params.set("w_gw", String(weights.groundwater));
    params.set("w_yield", String(weights.yield));
  }

  try {
    const res = await fetch(`/api/risk?${params}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
