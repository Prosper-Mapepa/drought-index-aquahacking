"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { Header } from "@/components/layout/Header";
import { riskTierColor } from "@/lib/drought-index";

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      {title && (
        <h2 className="text-xl font-semibold text-slate-900 mb-3">{title}</h2>
      )}
      <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function WeightRow({ label, pct }: { label: string; pct: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
      <span className="text-sm text-slate-700">{label}</span>
      <span className="ml-auto text-sm font-mono text-slate-500">{pct}</span>
    </div>
  );
}

function RiskBadge({ tier, label }: { tier: "low" | "moderate" | "high" | "extreme"; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: riskTierColor(tier) }}
      />
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  );
}

export default function AboutPage() {
  const { locale } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-10 pb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover mb-6"
          >
            ← {t(locale, "backToMap")}
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            {t(locale, "aboutTitle")}
          </h1>
          <p className="text-slate-500 mb-10">{t(locale, "aboutSubtitle")}</p>

          <div className="space-y-10">
            <Section>
              <p>{t(locale, "methodologyIntro")}</p>
            </Section>

            <Section id="methodology" title={t(locale, "methodology")}>
              <p>{t(locale, "compositeFormulaDesc")}</p>

              <div className="bg-white rounded-xl border border-slate-200 p-5 mt-4 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">
                  {t(locale, "compositeFormula")}
                </h3>
                <WeightRow label={t(locale, "weightSpi")} pct="35%" />
                <WeightRow label={t(locale, "weightSpei")} pct="25%" />
                <WeightRow label={t(locale, "weightGw")} pct="25%" />
                <WeightRow label={t(locale, "weightYield")} pct="15%" />
              </div>

              <div className="grid gap-4 mt-4">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h4 className="font-medium text-slate-800 text-sm mb-1">SPI</h4>
                  <p className="text-sm text-slate-600">{t(locale, "spiDesc")}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h4 className="font-medium text-slate-800 text-sm mb-1">SPEI</h4>
                  <p className="text-sm text-slate-600">{t(locale, "speiDesc")}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h4 className="font-medium text-slate-800 text-sm mb-1">
                    {t(locale, "groundwaterStress")}
                  </h4>
                  <p className="text-sm text-slate-600">{t(locale, "gwDesc")}</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h4 className="font-medium text-slate-800 text-sm mb-1">
                    {t(locale, "yield")}
                  </h4>
                  <p className="text-sm text-slate-600">{t(locale, "yieldDesc")}</p>
                </div>
              </div>
            </Section>

            <Section title={t(locale, "riskTiers")}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
                <RiskBadge tier="low" label={t(locale, "riskLow")} />
                <RiskBadge tier="moderate" label={t(locale, "riskModerate")} />
                <RiskBadge tier="high" label={t(locale, "riskHigh")} />
                <RiskBadge tier="extreme" label={t(locale, "riskExtreme")} />
              </div>
            </Section>

            <Section title={t(locale, "watershedInfo")}>
              <p>{t(locale, "watershedDesc")}</p>
            </Section>

            <Section title={t(locale, "dataSources")}>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>
                  <strong>SIH</strong> — Gouvernement du Québec (
                  <a
                    href="https://www.donneesquebec.ca/recherche/dataset/eau-souterraines-sih-index"
                    className="text-accent hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Données Québec
                  </a>
                  )
                </li>
                <li>
                  <strong>ZGIEBV</strong> — Zones de gestion intégrée de l&apos;eau par bassin versant (
                  <a
                    href="https://www.donneesquebec.ca/recherche/dataset/zgiebv"
                    className="text-accent hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Données Québec
                  </a>
                  )
                </li>
                <li>
                  <strong>SPI / SPEI</strong> — Agriculture and Agri-Food Canada (
                  <a
                    href="https://agriculture.canada.ca/en/agriculture-and-environment/agroclimate"
                    className="text-accent hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Agroclimate
                  </a>
                  )
                </li>
              </ul>
            </Section>

            <Section title={t(locale, "limitations")}>
              <p>{t(locale, "limitationsText")}</p>
            </Section>

            <Section title={t(locale, "phaseRoadmap")}>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>{t(locale, "phase1")}</li>
                <li>{t(locale, "phase2")}</li>
                <li>{t(locale, "phase3")}</li>
              </ol>
            </Section>
          </div>

          <p className="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-400">
            © {new Date().getFullYear()} {t(locale, "copyrightName")} · {t(locale, "platformName")}
          </p>
        </div>
      </main>
    </div>
  );
}
