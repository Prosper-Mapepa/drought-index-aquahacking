"use client";

import { useApp } from "@/context/AppContext";
import { MAP_ZOOM_RESERVE_RIGHT } from "@/lib/map-chrome";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { MapGlassCard, MapPanelHeader, IconButton } from "@/components/ui/primitives";
import { TimeSeriesChart } from "./TimeSeriesChart";

export function RsesqTimeSeriesPanel() {
  const { locale, rsesqStation, setRsesqStation } = useApp();
  if (!rsesqStation) return null;

  return (
    <MapGlassCard
      className={cn(
        "absolute top-14 z-overlay w-[min(320px,calc(100vw-5rem))] overflow-hidden animate-fade-in p-0",
        MAP_ZOOM_RESERVE_RIGHT
      )}
    >
      <MapPanelHeader
        title={rsesqStation.name}
        subtitle={t(locale, "rsesqStation")}
        actions={
          <IconButton onClick={() => setRsesqStation(null)} label={t(locale, "close")}>
            <span className="text-lg leading-none">×</span>
          </IconButton>
        }
      />
      <div className="p-3">
        <TimeSeriesChart
          title={t(locale, "waterLevelTrend")}
          series={rsesqStation.series}
          locale={locale}
          demoNote
        />
      </div>
    </MapGlassCard>
  );
}
