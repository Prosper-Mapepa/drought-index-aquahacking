"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { useMapBottomInset } from "@/lib/map-chrome";
import {
  CLIMATE_SCENARIOS,
  resolveScenario,
  type CustomScenarioConfig,
  type EnsemblePercentile,
  type ProjectionYear,
  type RcpPathway,
  type SpeiTimescale,
} from "@/lib/scenarios";

function CustomScenarioBuilder({
  config,
  onChange,
}: {
  config: CustomScenarioConfig;
  onChange: (config: CustomScenarioConfig) => void;
}) {
  const { locale } = useApp();

  const selectClass =
    "bg-white text-slate-700 text-caption rounded-md border border-surface-border px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/30";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 glass-panel px-3 py-2.5 pointer-events-auto max-w-[95vw] animate-fade-in">
      <label className="flex items-center gap-1.5 text-caption text-slate-600">
        <span className="whitespace-nowrap">{t(locale, "speiTimescale")}</span>
        <select
          className={selectClass}
          value={config.timescale}
          onChange={(e) =>
            onChange({
              ...config,
              timescale: Number(e.target.value) as SpeiTimescale,
            })
          }
        >
          <option value={1}>1</option>
          <option value={3}>3</option>
          <option value={12}>12</option>
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-caption text-slate-600">
        <span className="whitespace-nowrap">{t(locale, "rcpPathway")}</span>
        <select
          className={selectClass}
          value={config.rcp}
          onChange={(e) =>
            onChange({ ...config, rcp: e.target.value as RcpPathway })
          }
        >
          <option value="2.6">RCP 2.6</option>
          <option value="4.5">RCP 4.5</option>
          <option value="8.5">RCP 8.5</option>
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-caption text-slate-600">
        <span className="whitespace-nowrap">{t(locale, "ensemblePercentile")}</span>
        <select
          className={selectClass}
          value={config.percentile}
          onChange={(e) =>
            onChange({
              ...config,
              percentile: Number(e.target.value) as EnsemblePercentile,
            })
          }
        >
          <option value={25}>P25</option>
          <option value={50}>P50</option>
          <option value={75}>P75</option>
        </select>
      </label>

      <label className="flex items-center gap-1.5 text-caption text-slate-600">
        <span className="whitespace-nowrap">{t(locale, "projectionYear")}</span>
        <select
          className={selectClass}
          value={config.year}
          onChange={(e) =>
            onChange({
              ...config,
              year: Number(e.target.value) as ProjectionYear,
            })
          }
        >
          <option value={2030}>2030</option>
          <option value={2050}>2050</option>
          <option value={2080}>2080</option>
          <option value={2100}>2100</option>
        </select>
      </label>
    </div>
  );
}

export function ScenarioBar() {
  const {
    locale,
    scenario,
    setScenario,
    customScenario,
    setCustomScenario,
    compareMode,
    setCompareMode,
  } = useApp();
  const bottomInset = useMapBottomInset();

  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 z-overlay flex flex-col items-center gap-2 pointer-events-none",
        "transition-all duration-300 px-2 w-full max-w-[100vw]",
        bottomInset
      )}
    >
      <div className="relative flex items-center gap-0.5 glass-panel-dark p-1 pointer-events-auto max-w-full overflow-x-auto shadow-glow">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" aria-hidden />
        {CLIMATE_SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScenario(s.id)}
            title={s.description[locale]}
            className={cn(
              "px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-medium rounded-md transition-all duration-150 whitespace-nowrap shrink-0",
              scenario === s.id
                ? "bg-accent text-white shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/8"
            )}
          >
            {s.label[locale]}
          </button>
        ))}
        <button
          onClick={() => setScenario("custom")}
          title={t(locale, "customScenarioDesc")}
          className={cn(
            "px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-medium rounded-md transition-all duration-150 whitespace-nowrap shrink-0",
            scenario === "custom"
              ? "bg-accent text-white shadow-sm"
              : "text-white/70 hover:text-white hover:bg-white/8"
          )}
        >
          {t(locale, "customScenario")}
        </button>
      </div>

      {scenario === "custom" && (
        <CustomScenarioBuilder
          config={customScenario}
          onChange={setCustomScenario}
        />
      )}

      {scenario !== "current" && (
        <div className="flex items-center gap-2 pointer-events-auto animate-fade-in">
          <label className="flex items-center gap-2 glass-panel px-3 py-1.5 text-caption text-slate-600 cursor-pointer hover:border-accent/30 transition-colors">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="accent-accent w-3.5 h-3.5 rounded"
            />
            {t(locale, "compareScenarios")}
          </label>
        </div>
      )}
    </div>
  );
}

export function ScenarioBadge() {
  const { locale, scenario, customScenario } = useApp();
  if (scenario === "current") return null;
  const s = resolveScenario(scenario, customScenario);

  return (
    <div className="absolute top-3 left-3 z-controls flex items-center gap-2 bg-amber-500/95 text-white text-caption font-semibold px-3 py-1.5 rounded-lg shadow-panel max-w-[min(90vw,420px)] animate-fade-in border border-amber-400/30">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
      <span className="truncate">{t(locale, "viewingScenario")}: {s.label[locale]}</span>
    </div>
  );
}
