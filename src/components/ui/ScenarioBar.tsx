"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
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
    "bg-white text-slate-700 text-[11px] rounded-md border border-slate-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 bg-white/95 backdrop-blur rounded-lg shadow px-3 py-2 pointer-events-auto border border-slate-200 max-w-[95vw]">
      <label className="flex items-center gap-1.5 text-[11px] text-slate-600">
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

      <label className="flex items-center gap-1.5 text-[11px] text-slate-600">
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

      <label className="flex items-center gap-1.5 text-[11px] text-slate-600">
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

      <label className="flex items-center gap-1.5 text-[11px] text-slate-600">
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
    investmentRisk,
  } = useApp();

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 pointer-events-none transition-all px-2 w-full max-w-[100vw] ${
        investmentRisk ? "bottom-36 sm:bottom-36" : "bottom-20 sm:bottom-10"
      }`}
    >
      <div className="flex items-center gap-1 bg-sidebar/95 backdrop-blur rounded-lg shadow-lg p-1 pointer-events-auto border border-sidebar-border max-w-full overflow-x-auto">
        {CLIMATE_SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScenario(s.id)}
            title={s.description[locale]}
            className={`px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              scenario === s.id
                ? "bg-accent text-white"
                : "text-white/70 hover:text-white hover:bg-sidebar-hover"
            }`}
          >
            {s.label[locale]}
          </button>
        ))}
        <button
          onClick={() => setScenario("custom")}
          title={t(locale, "customScenarioDesc")}
          className={`px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
            scenario === "custom"
              ? "bg-accent text-white"
              : "text-white/70 hover:text-white hover:bg-sidebar-hover"
          }`}
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
        <div className="flex items-center gap-2 pointer-events-auto">
          <label className="flex items-center gap-1.5 bg-white/95 backdrop-blur rounded-md shadow px-2.5 py-1 text-[11px] text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="accent-accent"
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
    <div className="absolute top-3 left-3 z-[1000] bg-amber-500/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow max-w-[min(90vw,420px)] truncate">
      {t(locale, "viewingScenario")}: {s.label[locale]}
    </div>
  );
}
