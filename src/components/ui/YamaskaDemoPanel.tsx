"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { YAMASKA_VIEW } from "@/lib/demographics";
import {
  YAMASKA_DEMO,
  formatComponentsBreakdown,
  irhtToResilienceLevel,
  resilienceLevelColor,
} from "@/lib/irht";
import { useMapChromeHidden } from "@/lib/map-chrome";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui/primitives";

const PANEL_BASE = "absolute left-3 z-overlay print:hidden pointer-events-auto";

const CARD_CLASS =
  "bg-white/98 backdrop-blur-md rounded-xl border-2 border-demo shadow-[0_12px_40px_rgba(14,165,233,0.3),0_4px_16px_rgba(15,23,42,0.15)] ring-2 ring-demo/25";

export function YamaskaDemoPanel() {
  const { locale, region, requestFlyTo, scenario } = useApp();
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const chromeHidden = useMapChromeHidden();

  if (region !== "quebec" || dismissed || chromeHidden) return null;

  const current = YAMASKA_DEMO.current;
  const projected = YAMASKA_DEMO.scenario2050;
  const currentLevel = irhtToResilienceLevel(current.irht);
  const projectedLevel = irhtToResilienceLevel(projected.irht);
  const topClass = scenario !== "current" ? "top-14" : "top-12";
  const posClass = cn(PANEL_BASE, topClass);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={cn(
          posClass,
          "max-w-[min(calc(100vw-1.5rem),300px)]",
          CARD_CLASS,
          "px-3 py-2.5 text-left hover:border-demo hover:shadow-[0_14px_44px_rgba(14,165,233,0.35)] transition-all animate-fade-in"
        )}
      >
        <p className="text-overline text-demo">{t(locale, "yamaskaDemoBadge")}</p>
        <p className="text-xs font-semibold text-slate-900 mt-0.5">
          {t(locale, "yamaskaDemoTitle")}
        </p>
        <p className="text-caption text-slate-600 mt-1 text-data">
          {current.irht} → {projected.irht} · {t(locale, "yamaskaExpandHint")}
        </p>
      </button>
    );
  }

  return (
    <div
      className={cn(
        posClass,
        "w-[min(calc(100vw-1.5rem),320px)] max-h-[min(70vh,520px)]",
        CARD_CLASS,
        "overflow-hidden animate-scale-in"
      )}
    >
      <div className="bg-gradient-to-r from-demo to-sky-500 px-3 py-2.5 flex items-start justify-between gap-2 border-b border-demo/20">
        <div className="min-w-0">
          <p className="text-overline text-sky-100">{t(locale, "yamaskaDemoBadge")}</p>
          <h3 className="text-sm font-bold text-white leading-tight mt-0.5">
            {t(locale, "yamaskaDemoTitle")}
          </h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              requestFlyTo(YAMASKA_VIEW.center, YAMASKA_VIEW.zoom, "2050-rcp85");
              setExpanded(false);
            }}
            className="px-2.5 py-1 text-[10px] font-semibold bg-white text-demo rounded-md hover:bg-sky-50 transition-colors shadow-sm"
          >
            {t(locale, "yamaskaFlyTo")}
          </button>
          <IconButton variant="demo" onClick={() => setExpanded(false)} label={t(locale, "close")}>
            <span className="text-base leading-none">−</span>
          </IconButton>
          <IconButton variant="demo" onClick={() => setDismissed(true)} label={t(locale, "yamaskaDismiss")}>
            <span className="text-base leading-none">×</span>
          </IconButton>
        </div>
      </div>

      <div className="p-3 overflow-y-auto max-h-[calc(min(70vh,520px)-3rem)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 text-center rounded-xl bg-surface-muted border border-surface-border py-2.5">
            <div
              className="text-2xl font-bold text-data"
              style={{ color: resilienceLevelColor(currentLevel) }}
            >
              {current.irht}
            </div>
            <div className="text-overline text-slate-500 normal-case tracking-normal font-medium mt-0.5">
              {t(locale, "currentClimate")}
            </div>
          </div>
          <div className="text-slate-300 text-lg font-light">→</div>
          <div className="flex-1 text-center rounded-xl bg-surface-muted border border-surface-border py-2.5">
            <div
              className="text-2xl font-bold text-data"
              style={{ color: resilienceLevelColor(projectedLevel) }}
            >
              {projected.irht}
            </div>
            <div className="text-overline text-slate-500 normal-case tracking-normal font-medium mt-0.5">
              {t(locale, "projectedClimate")}
            </div>
          </div>
        </div>

        <p className="text-caption text-slate-600 mb-3 leading-relaxed">
          {t(locale, "yamaskaDemoDesc")}
        </p>

        <div className="space-y-2">
          {formatComponentsBreakdown(current.components, locale).map((row) => {
            const projectedVal = projected.components[row.key];
            return (
              <div key={row.key}>
                <div className="flex justify-between text-caption text-slate-700 mb-0.5">
                  <span className="font-medium truncate pr-2">{row.label}</span>
                  <span className="text-data text-slate-900 shrink-0">
                    {(row.value * 100).toFixed(0)} → {(projectedVal * 100).toFixed(0)}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-demo to-sky-400 rounded-full transition-all"
                    style={{ width: `${row.value * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
