"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { DROUGHT_COLORS } from "@/lib/constants";
import { riskTierColor } from "@/lib/drought-index";

export function DroughtLegend() {
  const { locale, isLayerVisible, legendMode, selectedWellScore } = useApp();
  const showLegend = isLayerVisible("spi") || isLayerVisible("spei") || legendMode === "composite";

  if (!showLegend) return null;

  if (legendMode === "composite") {
    const tiers = [
      { tier: "low" as const, key: "riskLow" as const },
      { tier: "moderate" as const, key: "riskModerate" as const },
      { tier: "high" as const, key: "riskHigh" as const },
      { tier: "extreme" as const, key: "riskExtreme" as const },
    ];

    return (
      <div className="absolute bottom-10 right-3 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 text-xs max-w-[220px]">
        <h3 className="font-semibold text-slate-800 mb-1">
          {t(locale, "compositeLegend")}
        </h3>
        {selectedWellScore?.composite != null && (
          <div className="text-[11px] text-slate-500 mb-2 pb-2 border-b border-slate-100">
            <span className="font-mono font-semibold text-slate-800 text-sm">
              {selectedWellScore.composite.toFixed(2)}
            </span>
            {" · "}
            {selectedWellScore.riskLabel}
          </div>
        )}
        <p className="text-[10px] text-slate-400 mb-2">{t(locale, "legendWellHint")}</p>
        <div className="space-y-1.5">
          {tiers.map(({ tier, key }) => (
            <div key={tier} className="flex items-center gap-2">
              <span
                className="w-4 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: riskTierColor(tier) }}
              />
              <span className="text-slate-600 leading-tight">{t(locale, key)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = [
    { key: "extremelyWet" as const, color: DROUGHT_COLORS.extremeWet },
    { key: "wet" as const, color: DROUGHT_COLORS.wet },
    { key: "normal" as const, color: DROUGHT_COLORS.normal },
    { key: "moderateDrought" as const, color: DROUGHT_COLORS.moderate },
    { key: "severeDrought" as const, color: DROUGHT_COLORS.severe },
    { key: "extremeDrought" as const, color: DROUGHT_COLORS.extreme },
  ];

  return (
    <div className="absolute bottom-10 right-3 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 text-xs max-w-[220px]">
      <h3 className="font-semibold text-slate-800 mb-2">
        {t(locale, "droughtLegend")}
      </h3>
      <div className="space-y-1">
        {items.map(({ key, color }) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="w-4 h-3 rounded-sm shrink-0 border border-black/10"
              style={{ backgroundColor: color }}
            />
            <span className="text-slate-600 leading-tight">{t(locale, key)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
