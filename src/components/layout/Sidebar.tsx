"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import type { LayerId, MapRegion } from "@/lib/types";

interface LayerGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function LayerGroup({ title, children, defaultOpen = true }: LayerGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-sidebar-border">
      <button className="layer-group-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-1">{children}</div>}
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
        <span className={visible ? "text-white" : ""}>{label}</span>
      </label>
      {showOpacity && visible && (
        <div className="px-8 pb-2">
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
    <div className="px-4 py-3 border-b border-sidebar-border">
      <p className="text-[10px] uppercase tracking-wide text-white/40 mb-2">
        {t(locale, "mapRegion")}
      </p>
      <div className="flex gap-1">
        {regions.map((r) => (
          <button
            key={r.id}
            onClick={() => applyRegionDefaults(r.id)}
            className={`flex-1 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
              region === r.id
                ? "bg-accent text-white"
                : "bg-white/10 text-white/70 hover:bg-white/15"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function IndexWeightsPanel() {
  const { locale, indexWeights, setIndexWeights, resetIndexWeights } = useApp();
  const keys = [
    { key: "spi" as const, label: "SPI" },
    { key: "spei" as const, label: "SPEI" },
    { key: "groundwater" as const, label: t(locale, "groundwater") },
    { key: "yield" as const, label: t(locale, "yield") },
  ];

  return (
    <div className="px-4 py-2 space-y-2">
      {keys.map(({ key, label }) => (
        <div key={key}>
          <div className="flex justify-between text-[11px] text-white/70 mb-0.5">
            <span>{label}</span>
            <span>{Math.round(indexWeights[key] * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={indexWeights[key] * 100}
            onChange={(e) =>
              setIndexWeights({
                ...indexWeights,
                [key]: Number(e.target.value) / 100,
              })
            }
            className="opacity-slider w-full"
          />
        </div>
      ))}
      <button
        onClick={resetIndexWeights}
        className="text-[10px] text-white/50 hover:text-white/80 transition-colors"
      >
        {t(locale, "resetWeights")}
      </button>
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
      <div className="flex gap-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t(locale, "areaNamePlaceholder")}
          className="flex-1 px-2 py-1 text-[11px] bg-white/10 border border-white/10 rounded text-white placeholder-white/30"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button
          onClick={handleSave}
          className="px-2 py-1 text-[11px] bg-accent hover:bg-accent-hover text-white rounded"
        >
          {t(locale, "saveArea")}
        </button>
      </div>
      {savedAreas.length === 0 ? (
        <p className="text-[10px] text-white/40">{t(locale, "noSavedAreas")}</p>
      ) : (
        <ul className="space-y-1 max-h-28 overflow-y-auto sidebar-scroll">
          {savedAreas.map((area) => (
            <li
              key={area.id}
              className="flex items-center justify-between gap-1 group"
            >
              <button
                onClick={() => {
                  applyRegionDefaults(area.region);
                  requestFlyTo(area.center, area.zoom);
                }}
                className="text-[11px] text-white/80 hover:text-white truncate text-left flex-1"
              >
                {area.name}
              </button>
              <button
                onClick={() => deleteSavedArea(area.id)}
                className="text-white/30 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100"
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

export function Sidebar() {
  const { locale, wellCount, region } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-40 bg-sidebar text-white p-2 
                   rounded-r-lg border border-l-0 border-sidebar-border hover:bg-sidebar-hover"
        title={t(locale, "layers")}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <aside
      className="bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 z-40 relative"
      style={{ width: "var(--sidebar-width)" }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <h2 className="text-sm font-semibold text-white">{t(locale, "layers")}</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <RegionSelector />

      <div className="flex-1 overflow-y-auto sidebar-scroll">
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
          <IndexWeightsPanel />
        </LayerGroup>

        <LayerGroup title={t(locale, "savedAreas")} defaultOpen={false}>
          <SavedAreasPanel />
        </LayerGroup>
      </div>

      <div className="px-4 py-3 border-t border-sidebar-border text-xs text-white/50 space-y-1">
        {region === "quebec" && wellCount > 0 ? (
          <span>
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
  );
}
