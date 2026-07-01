"use client";

import type { RsesqTimeSeriesPoint } from "@/lib/types";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function TimeSeriesChart({
  title,
  series,
  locale,
  unit = "m",
  demoNote,
}: {
  title: string;
  series: RsesqTimeSeriesPoint[];
  locale: Locale;
  unit?: string;
  demoNote?: boolean;
}) {
  if (series.length === 0) return null;

  const values = series.map((p) => p.level);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 280;
  const h = 80;
  const pad = 8;

  const points = series
    .map((p, i) => {
      const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
      const y = h - pad - ((p.level - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="mt-2">
      <p className="text-[11px] font-medium text-slate-700 mb-1">{title}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-20 bg-slate-50 rounded border border-slate-100">
        <polyline
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="2"
          points={points}
        />
        {series.map((p, i) => {
          const x = pad + (i / Math.max(series.length - 1, 1)) * (w - pad * 2);
          const y = h - pad - ((p.level - min) / range) * (h - pad * 2);
          return <circle key={p.date} cx={x} cy={y} r="2.5" fill="#0284c7" />;
        })}
      </svg>
      <div className="flex justify-between text-[9px] text-slate-400 mt-0.5 px-1">
        <span>{series[0]?.date}</span>
        <span>
          {min.toFixed(1)}–{max.toFixed(1)} {unit}
        </span>
        <span>{series[series.length - 1]?.date}</span>
      </div>
      {demoNote && (
        <p className="text-[9px] text-amber-600 mt-1">{t(locale, "rsesqDemoNote")}</p>
      )}
    </div>
  );
}
