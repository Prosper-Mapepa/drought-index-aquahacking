"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { CLIMATE_SCENARIOS } from "@/lib/scenarios";
import type { ClimateScenarioId } from "@/lib/scenarios";

export function ScenarioBar() {
  const { locale, scenario, setScenario, compareMode, setCompareMode, investmentRisk } =
    useApp();

  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 z-[1000] flex flex-col items-center gap-2 pointer-events-none transition-all ${
        investmentRisk ? "bottom-36" : "bottom-10"
      }`}
    >
      <div className="flex items-center gap-1 bg-sidebar/95 backdrop-blur rounded-lg shadow-lg p-1 pointer-events-auto border border-sidebar-border">
        {CLIMATE_SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScenario(s.id)}
            title={s.description[locale]}
            className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap ${
              scenario === s.id
                ? "bg-accent text-white"
                : "text-white/70 hover:text-white hover:bg-sidebar-hover"
            }`}
          >
            {s.label[locale]}
          </button>
        ))}
      </div>

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
  const { locale, scenario } = useApp();
  if (scenario === "current") return null;
  const s = CLIMATE_SCENARIOS.find((x) => x.id === scenario);
  if (!s) return null;

  return (
    <div className="absolute top-3 left-3 z-[1000] bg-amber-500/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow">
      {t(locale, "viewingScenario")}: {s.label[locale]}
    </div>
  );
}
