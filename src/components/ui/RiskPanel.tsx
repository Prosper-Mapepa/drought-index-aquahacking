"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { riskTierColor } from "@/lib/drought-index";
import { appendCustomScenarioParams } from "@/lib/scenarios";
import { MapGlassCard, MapPanelHeader, IconButton, PrimaryButton } from "@/components/ui/primitives";

export function RiskPanel() {
  const {
    locale,
    investmentRisk,
    compareRisk,
    selectedWatershed,
    riskLocation,
    compareMode,
    customScenario,
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
  appendCustomScenarioParams(
    reportParams,
    investmentRisk.scenario,
    customScenario
  );

  const irht = investmentRisk.droughtScore?.irht;

  return (
    <div className="absolute bottom-2 left-2 right-2 sm:left-3 sm:right-3 z-risk animate-slide-up pointer-events-none">
      <MapGlassCard className="overflow-hidden pointer-events-auto max-h-[34dvh] overflow-y-auto shadow-panel-lg">
        <MapPanelHeader
          title={selectedWatershed.ZGIEBV}
          subtitle={`${selectedWatershed.OBV ?? selectedWatershed.SIGLE} · ${investmentRisk.scenarioLabel}`}
          actions={
            <IconButton onClick={close} label={t(locale, "close")}>
              <span className="text-lg leading-none">×</span>
            </IconButton>
          }
        />

        <div className="px-3 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm"
              style={{ backgroundColor: riskTierColor(investmentRisk.riskTier) }}
            >
              {(investmentRisk.overallScore * 100).toFixed(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-tight">
                {investmentRisk.riskLabel}
              </div>
              <div className="text-overline text-slate-500 normal-case tracking-normal font-normal mt-0.5">
                {t(locale, "investmentRisk")}
                {irht != null && (
                  <span className="ml-1 text-data">
                    · IRHT {irht.toFixed(1)}/100
                  </span>
                )}
              </div>
            </div>
          </div>

          {compareMode && compareRisk && (
            <div className="flex items-center gap-2 text-caption text-slate-600 bg-surface-muted rounded-lg px-2.5 py-1.5 border border-surface-border">
              <span className="text-data">{(compareRisk.overallScore * 100).toFixed(0)}</span>
              <span className="text-slate-300">→</span>
              <span className="font-semibold text-data">
                {(investmentRisk.overallScore * 100).toFixed(0)}
              </span>
              <span className="text-slate-400">{t(locale, "riskChange")}</span>
            </div>
          )}

          <div className="flex gap-3 text-caption ml-auto flex-wrap">
            {(
              [
                ["drought", investmentRisk.factors.drought],
                ["climateProjection", investmentRisk.factors.climateProjection],
                ["watershed", investmentRisk.factors.watershed],
                ["groundwater", investmentRisk.factors.groundwater],
              ] as const
            ).map(([key, val]) => (
              <div key={key} className="text-center min-w-[3rem]">
                <div className="text-data font-semibold text-slate-800">
                  {(val * 100).toFixed(0)}%
                </div>
                <div className="text-slate-500 leading-tight">{t(locale, key)}</div>
              </div>
            ))}
          </div>

          <Link href={`/report?${reportParams.toString()}`}>
            <PrimaryButton size="sm">{t(locale, "viewFullReport")}</PrimaryButton>
          </Link>
        </div>
      </MapGlassCard>
    </div>
  );
}
