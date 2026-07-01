"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { DROUGHT_COLORS } from "@/lib/constants";
import { irhtDisplayColor, resilienceLevelColor } from "@/lib/drought-index";
import { useMapBottomInset, useMapChromeHidden } from "@/lib/map-chrome";
import { MapGlassCard } from "@/components/ui/primitives";
import { cn } from "@/lib/cn";

export function DroughtLegend() {
  const { locale, isLayerVisible, legendMode, selectedWellScore } = useApp();
  const bottomInset = useMapBottomInset();
  const chromeHidden = useMapChromeHidden();
  const showLegend =
    isLayerVisible("spi") ||
    isLayerVisible("spei") ||
    isLayerVisible("us-spi") ||
    legendMode === "composite";

  if (!showLegend) return null;

  const posClass = cn("absolute z-legend", bottomInset, "right-2 sm:right-3");

  if (legendMode === "composite") {
    const tiers = [
      { level: "veryHigh" as const, key: "irhtVeryHigh" as const },
      { level: "high" as const, key: "irhtHigh" as const },
      { level: "moderate" as const, key: "irhtModerate" as const },
      { level: "low" as const, key: "irhtLow" as const },
      { level: "critical" as const, key: "irhtCritical" as const },
    ];

    return (
      <MapGlassCard className={cn(posClass, "p-2.5 sm:p-3 text-[10px] sm:text-xs max-w-[min(240px,calc(100vw-5rem))]", chromeHidden && "opacity-90")}>
        <h3 className="text-panel-title mb-1.5">{t(locale, "irhtLegend")}</h3>
        {selectedWellScore?.irht != null && (
          <div className="text-caption text-slate-500 mb-2 pb-2 border-b border-surface-border">
            <span
              className="text-data font-semibold text-sm"
              style={{ color: irhtDisplayColor(selectedWellScore.irht) }}
            >
              {selectedWellScore.irht.toFixed(1)}
            </span>
            <span className="text-slate-400"> /100</span>
            {" · "}
            {selectedWellScore.riskLabel}
          </div>
        )}
        <p className="text-overline text-slate-400 normal-case tracking-normal font-normal mb-2">{t(locale, "legendWellHint")}</p>
        <div className="space-y-1.5">
          {tiers.map(({ level, key }) => (
            <div key={level} className="flex items-center gap-2">
              <span
                className="w-4 h-3 rounded-sm shrink-0 shadow-sm"
                style={{ backgroundColor: resilienceLevelColor(level) }}
              />
              <span className="text-slate-600 leading-tight">{t(locale, key)}</span>
            </div>
          ))}
        </div>
      </MapGlassCard>
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
    <MapGlassCard className={cn(posClass, "p-2.5 sm:p-3 text-[10px] sm:text-xs max-w-[min(220px,calc(100vw-5rem))]", chromeHidden && "opacity-90")}>
      <h3 className="text-panel-title mb-2">{t(locale, "droughtLegend")}</h3>
      <div className="space-y-1.5">
        {items.map(({ key, color }) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="w-4 h-3 rounded-sm shrink-0 border border-black/10 shadow-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-slate-600 leading-tight">{t(locale, key)}</span>
          </div>
        ))}
      </div>
    </MapGlassCard>
  );
}
