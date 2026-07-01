"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import type { LayerId, MapRegion } from "@/lib/types";

interface LayerGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function LayerGroup({ title, children, defaultOpen = true }: LayerGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-sidebar-border/80">
      <button className="layer-group-header" onClick={() => setOpen(!open)}>
        <span className="flex items-center gap-2">
          <span className={cn("w-1 h-3 rounded-full bg-accent/60 transition-opacity", open ? "opacity-100" : "opacity-40")} />
          {title}
        </span>
        <svg
          className={cn("w-4 h-4 text-white/50 transition-transform duration-200", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-1.5">{children}</div>}
    </div>
  );
}

function LayerToggle({
  id,
  label,
  showOpacity = false,
}: {
  id: LayerId;
  label: string;
  showOpacity?: boolean;
}) {
  const { isLayerVisible, toggleLayer, getLayerOpacity, setLayerOpacity } = useApp();
  const visible = isLayerVisible(id);
  const opacity = getLayerOpacity(id);

  return (
    <div>
      <label className="layer-item cursor-pointer">
        <input
          type="checkbox"
          checked={visible}
          onChange={() => toggleLayer(id)}
          className="w-3.5 h-3.5 accent-accent rounded"
        />
        <span className={cn("transition-colors", visible ? "text-white font-medium" : "")}>{label}</span>
      </label>
      {showOpacity && visible && (
        <div className="px-8 pb-2 pt-0.5">
          <input
            type="range"
            min={0}
            max={100}
            value={opacity * 100}
            onChange={(e) => setLayerOpacity(id, Number(e.target.value) / 100)}
            className="opacity-slider"
          />
        </div>
      )}
    </div>
  );
}

function RegionSelector() {
  const { locale, region, applyRegionDefaults } = useApp();
  const regions: { id: MapRegion; label: string }[] = [
    { id: "quebec", label: t(locale, "regionQuebec") },
    { id: "great-lakes", label: t(locale, "regionGreatLakes") },
  ];

  return (
    <div className="px-4 py-3.5 border-b border-sidebar-border/80">
      <p className="text-overline text-white/40 mb-2.5">{t(locale, "mapRegion")}</p>
      <div className="flex gap-1.5 p-1 bg-black/20 rounded-lg">
        {regions.map((r) => (
          <button
            key={r.id}
            onClick={() => applyRegionDefaults(r.id)}
            className={cn(
              "flex-1 py-2 text-[13px] font-medium rounded-md transition-all duration-150",
              region === r.id
                ? "bg-accent text-white shadow-sm"
                : "text-white/65 hover:text-white hover:bg-white/8"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function IrhtWeightsPanel() {
  const { locale } = useApp();
  const components = [
    { label: t(locale, "irhtComponentClimate"), pct: "25%" },
    { label: t(locale, "irhtComponentHydrology"), pct: "20%" },
    { label: t(locale, "irhtComponentHydrogeology"), pct: "15%" },
    { label: t(locale, "irhtComponentTerritory"), pct: "15%" },
    { label: t(locale, "irhtComponentDemographic"), pct: "10%" },
    { label: t(locale, "irhtComponentEconomy"), pct: "15%" },
  ];

  return (
    <div className="px-4 py-2 space-y-1">
      <p className="text-caption text-white/45 leading-relaxed mb-2.5">
        {t(locale, "irhtFormulaDesc")}
      </p>
      {components.map(({ label, pct }) => (
        <div key={label} className="flex justify-between text-caption text-white/70 py-0.5">
          <span>{label}</span>
          <span className="text-data text-white/45">{pct}</span>
        </div>
      ))}
    </div>
  );
}

function SavedAreasPanel() {
  const {
    locale,
    savedAreas,
    saveCurrentArea,
    deleteSavedArea,
    applyRegionDefaults,
    requestFlyTo,
  } = useApp();
  const [name, setName] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    saveCurrentArea(trimmed);
    setName("");
  };

  return (
    <div className="px-4 py-2 space-y-2">
      <div className="flex gap-1.5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t(locale, "areaNamePlaceholder")}
          className="flex-1 px-2.5 py-1.5 text-caption bg-white/8 border border-white/10 rounded-md text-white placeholder-white/30 focus:border-accent/40 focus:outline-none transition-colors"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button
          onClick={handleSave}
          className="px-2.5 py-1.5 text-caption bg-accent hover:bg-accent-hover text-white rounded-md transition-colors font-medium"
        >
          {t(locale, "saveArea")}
        </button>
      </div>
      {savedAreas.length === 0 ? (
        <p className="text-overline text-white/35 normal-case tracking-normal font-normal">{t(locale, "noSavedAreas")}</p>
      ) : (
        <ul className="space-y-0.5 max-h-28 overflow-y-auto sidebar-scroll">
          {savedAreas.map((area) => (
            <li
              key={area.id}
              className="flex items-center justify-between gap-1 group rounded-md hover:bg-white/5 px-1 -mx-1"
            >
              <button
                onClick={() => {
                  applyRegionDefaults(area.region);
                  requestFlyTo(area.center, area.zoom);
                }}
                className="text-caption text-white/80 hover:text-white truncate text-left flex-1 py-1"
              >
                {area.name}
              </button>
              <button
                onClick={() => deleteSavedArea(area.id)}
                className="text-white/30 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity p-1"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SidebarExpandTab() {
  const { locale, setSidebarOpen } = useApp();

  return (
    <button
      type="button"
      onClick={() => setSidebarOpen(true)}
      className="fixed left-0 z-sidebar flex items-center gap-2 bg-sidebar text-white
                 py-2.5 pl-2 pr-3.5 rounded-r-xl border border-l-0 border-sidebar-border
                 shadow-chrome hover:bg-sidebar-hover transition-all duration-150 pointer-events-auto group"
      style={{
        top: "calc(var(--header-height) + (100dvh - var(--header-height) - var(--footer-height)) / 2)",
        transform: "translateY(-50%)",
      }}
      aria-label={t(locale, "openLayers")}
    >
      <svg className="w-5 h-5 shrink-0 text-accent group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <span className="text-xs font-semibold pr-0.5">{t(locale, "openLayers")}</span>
    </button>
  );
}

export function Sidebar() {
  const { locale, wellCount, region, sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {!sidebarOpen && <SidebarExpandTab />}

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[1050] bg-black/50 backdrop-blur-[2px] md:hidden"
          style={{
            top: "var(--header-height)",
            bottom: "var(--footer-height)",
          }}
          onClick={() => setSidebarOpen(false)}
          aria-label={t(locale, "close")}
        />
      )}

      <aside
        className={cn(
          "fixed z-sidebar flex flex-col chrome-gradient border-r border-sidebar-border",
          "w-[min(300px,88vw)] md:w-[var(--sidebar-width)]",
          "transition-transform duration-300 ease-out shadow-chrome",
          sidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
        style={{
          top: "var(--header-height)",
          bottom: "var(--footer-height)",
          left: 0,
        }}
        aria-hidden={!sidebarOpen}
      >
        <div className="relative flex items-center justify-between px-4 py-3.5 border-b border-sidebar-border/80 shrink-0">
          <div className="accent-stripe" aria-hidden />
          <h2 className="text-sm font-semibold text-white tracking-tight">{t(locale, "layers")}</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white/45 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/8"
            aria-label={t(locale, "close")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <RegionSelector />

        <div className="flex-1 overflow-y-auto sidebar-scroll min-h-0">
          <LayerGroup title={t(locale, "droughtIndices")}>
            <LayerToggle id="spi" label={t(locale, "spi")} showOpacity />
            <LayerToggle id="spei" label={t(locale, "spei")} showOpacity />
            {region === "great-lakes" && (
              <LayerToggle id="us-spi" label={t(locale, "usSpi")} showOpacity />
            )}
          </LayerGroup>

          {region === "quebec" && (
            <LayerGroup title={t(locale, "groundwater")}>
              <LayerToggle id="sih-wells" label={t(locale, "sihWells")} />
              <LayerToggle id="rsesq-stations" label={t(locale, "rsesqStations")} />
            </LayerGroup>
          )}

          {region === "quebec" && (
            <LayerGroup title={t(locale, "territorialLayers")}>
              <LayerToggle id="land-use" label={t(locale, "landUseLayer")} showOpacity />
              <LayerToggle id="gtc-sites" label={t(locale, "gtcSites")} />
            </LayerGroup>
          )}

          <LayerGroup title={t(locale, "surfaceWater")}>
            {region === "quebec" && (
              <LayerToggle id="watersheds" label={t(locale, "watersheds")} showOpacity />
            )}
            <LayerToggle id="great-lakes-basin" label={t(locale, "greatLakesBasin")} showOpacity />
          </LayerGroup>

          <LayerGroup title={t(locale, "terrain")}>
            <LayerToggle id="satellite" label={t(locale, "satellite")} />
            <LayerToggle id="terrain" label={t(locale, "terrainBase")} />
          </LayerGroup>

          <LayerGroup title={t(locale, "indexWeights")} defaultOpen={false}>
            <IrhtWeightsPanel />
          </LayerGroup>

          <LayerGroup title={t(locale, "savedAreas")} defaultOpen={false}>
            <SavedAreasPanel />
          </LayerGroup>
        </div>

        <div className="px-4 py-3.5 border-t border-sidebar-border/80 text-caption text-white/50 space-y-1 shrink-0 bg-black/15">
          {region === "quebec" && wellCount > 0 ? (
            <span className="text-white/70 font-medium">
              {wellCount.toLocaleString()} {t(locale, "wellsLoaded")}
            </span>
          ) : region === "quebec" ? (
            <span>{t(locale, "zoomToSeeWells")}</span>
          ) : (
            <span>{t(locale, "greatLakesHint")}</span>
          )}
          <p className="text-white/40 leading-relaxed">{t(locale, "clickWatershed")}</p>
        </div>
      </aside>
    </>
  );
}
