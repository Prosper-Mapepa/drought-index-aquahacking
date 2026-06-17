"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { riskTierColor } from "@/lib/drought-index";

function RiskScore({ score, label }: { score: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-slate-900">{(score * 100).toFixed(0)}</div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  );
}

export function RiskPanel() {
  const {
    locale,
    investmentRisk,
    compareRisk,
    selectedWatershed,
    riskLocation,
    compareMode,
    setInvestmentRisk,
    setSelectedWatershed,
    setCompareRisk,
  } = useApp();

  if (!investmentRisk || !selectedWatershed) return null;

  const close = () => {
    setInvestmentRisk(null);
    setSelectedWatershed(null);
    setCompareRisk(null);
  };

  const reportParams = new URLSearchParams({
    scenario: investmentRisk.scenario,
    zgiebv: selectedWatershed.ZGIEBV ?? "",
    locale,
  });
  if (riskLocation) {
    reportParams.set("lat", String(riskLocation[0]));
    reportParams.set("lng", String(riskLocation[1]));
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1001] animate-fade-in pointer-events-none">
      <div className="mx-4 mb-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto">
        <div className="flex items-start justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {t(locale, "investmentRisk")} — {selectedWatershed.ZGIEBV}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {investmentRisk.scenarioLabel}
            </p>
          </div>
          <button
            onClick={close}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: riskTierColor(investmentRisk.riskTier) }}
            >
              {(investmentRisk.overallScore * 100).toFixed(0)}
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">
                {investmentRisk.riskLabel}
              </div>
              <div className="text-xs text-slate-500">
                {t(locale, "overallRiskScore")}
              </div>
            </div>
          </div>

          {compareMode && compareRisk && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <RiskScore
                score={compareRisk.overallScore}
                label={t(locale, "currentClimate")}
              />
              <span className="text-slate-300">→</span>
              <RiskScore
                score={investmentRisk.overallScore}
                label={t(locale, "projectedClimate")}
              />
              <div className="text-[10px] text-slate-500 ml-1">
                {t(locale, "riskChange")}:{" "}
                <span className="font-semibold text-slate-700">
                  {((investmentRisk.overallScore - compareRisk.overallScore) * 100).toFixed(0)} pts
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 text-xs ml-auto">
            {(
              [
                ["drought", investmentRisk.factors.drought],
                ["climateProjection", investmentRisk.factors.climateProjection],
                ["watershed", investmentRisk.factors.watershed],
                ["groundwater", investmentRisk.factors.groundwater],
              ] as const
            ).map(([key, val]) => (
              <div key={key} className="text-center">
                <div className="font-mono font-semibold text-slate-800">
                  {(val * 100).toFixed(0)}%
                </div>
                <div className="text-slate-500">{t(locale, key)}</div>
              </div>
            ))}
          </div>

          <Link
            href={`/report?${reportParams.toString()}`}
            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-medium rounded-lg transition-colors shrink-0"
          >
            {t(locale, "viewFullReport")}
          </Link>
        </div>
      </div>
    </div>
  );
}
