"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { riskTierColor } from "@/lib/drought-index";
import type { InvestmentRiskReport } from "@/lib/investment-risk";
import type { ClimateScenarioId } from "@/lib/scenarios";
import { Header } from "@/components/layout/Header";

export default function ReportContent() {
  const searchParams = useSearchParams();
  const { locale: ctxLocale } = useApp();
  const locale = (searchParams.get("locale") as "en" | "fr") || ctxLocale;
  const [report, setReport] = useState<InvestmentRiskReport | null>(null);
  const [compareReport, setCompareReport] = useState<InvestmentRiskReport | null>(null);
  const [loading, setLoading] = useState(true);

  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const scenario = (searchParams.get("scenario") ?? "current") as ClimateScenarioId;
  const zgiebv = searchParams.get("zgiebv") ?? "";

  useEffect(() => {
    if (isNaN(lat) || isNaN(lng)) {
      setLoading(false);
      return;
    }

    async function load() {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        locale,
        scenario,
      });

      const res = await fetch(`/api/risk?${params}`);
      if (res.ok) setReport(await res.json());

      if (scenario !== "current") {
        const currentParams = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
          locale,
          scenario: "current",
        });
        const currentRes = await fetch(`/api/risk?${currentParams}`);
        if (currentRes.ok) setCompareReport(await currentRes.json());
      }

      setLoading(false);
    }

    load();
  }, [lat, lng, locale, scenario]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-8 py-10 pb-16 print:py-6">
        <div className="flex items-center justify-between mb-8 print:mb-4">
          <Link href="/" className="text-sm text-accent hover:underline print:hidden">
            ← {t(locale, "backToMap")}
          </Link>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-accent text-white text-sm rounded-lg print:hidden"
          >
            {t(locale, "printReport")}
          </button>
        </div>

        <header className="border-b-2 border-slate-900 pb-4 mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            {t(locale, "reportTitle")}
          </h1>
          <p className="text-slate-500 mt-1">
            {t(locale, "reportGenerated")}{" "}
            {new Date().toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}
          </p>
        </header>

        {loading && <p className="text-slate-500">{t(locale, "loadingRisk")}</p>}

        {!loading && !report && (
          <p className="text-slate-500">
            {locale === "fr"
              ? "Paramètres de localisation manquants. Retournez à la carte et cliquez sur un bassin versant."
              : "Missing location parameters. Return to the map and click a watershed."}
          </p>
        )}

        {report && (
          <div className="space-y-8">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
                {t(locale, "reportWatershed")}
              </h2>
              <p className="text-xl font-bold text-slate-900">
                {zgiebv || report.watershed?.ZGIEBV || "—"}
              </p>
              {report.watershed?.OBV && (
                <p className="text-slate-600 mt-1">{report.watershed.OBV}</p>
              )}
              <p className="text-sm text-slate-500 mt-2">
                {t(locale, "reportScenario")}: {report.scenarioLabel}
              </p>
            </section>

            <section className="flex items-center gap-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: riskTierColor(report.riskTier) }}
              >
                {(report.overallScore * 100).toFixed(0)}
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{report.riskLabel}</div>
                <div className="text-slate-500">{t(locale, "overallRiskScore")}</div>
              </div>
            </section>

            {compareReport && scenario !== "current" && (
              <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h2 className="text-sm font-semibold text-slate-800 mb-3">
                  {t(locale, "scenarioComparison")}
                </h2>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {(compareReport.overallScore * 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-slate-500">{t(locale, "currentClimate")}</div>
                  </div>
                  <div className="text-slate-300 text-xl">→</div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {(report.overallScore * 100).toFixed(0)}
                    </div>
                    <div className="text-xs text-slate-500">{t(locale, "projectedClimate")}</div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {t(locale, "riskChange")}:{" "}
                    <strong>
                      +{((report.overallScore - compareReport.overallScore) * 100).toFixed(0)} pts
                    </strong>
                  </div>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
                {t(locale, "reportFactors")}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["drought", report.factors.drought],
                    ["climateProjection", report.factors.climateProjection],
                    ["watershed", report.factors.watershed],
                    ["groundwater", report.factors.groundwater],
                  ] as const
                ).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-slate-900">
                      {(val * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-slate-500">{t(locale, key)}</div>
                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${val * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {report.droughtScore && (
              <section>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
                  {t(locale, "compositeIndex")}
                </h2>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">SPI</span>
                    <div className="font-mono font-semibold">
                      {report.droughtScore.spi?.toFixed(2) ?? "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">SPEI</span>
                    <div className="font-mono font-semibold">
                      {report.droughtScore.spei?.toFixed(2) ?? "—"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">{t(locale, "compositeIndex")}</span>
                    <div className="font-mono font-semibold">
                      {report.droughtScore.composite?.toFixed(2) ?? "—"}
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
                {t(locale, "reportRecommendations")}
              </h2>
              <ul className="space-y-2">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-slate-700 text-sm leading-relaxed">
                    <span className="text-accent font-bold shrink-0">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </section>

            <footer className="text-[10px] text-slate-400 border-t pt-4 print:mt-8">
              {t(locale, "attribution")} · ECCC GeoMet-Climate
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}
