"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { ContentShell } from "@/components/layout/ContentShell";
import { resilienceLevelColor, YAMASKA_DEMO } from "@/lib/irht";

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
    <section id={id} className="scroll-mt-24">
      {title && <h2 className="content-section-title">{title}</h2>}
      <div className="text-slate-600 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function WeightRow({ label, pct }: { label: string; pct: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-surface-border last:border-0">
      <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
      <span className="text-sm text-slate-700">{label}</span>
      <span className="ml-auto text-sm text-data text-slate-500">{pct}</span>
    </div>
  );
}

function ResilienceBadge({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  );
}

export default function AboutPage() {
  const { locale } = useApp();
  const demo = YAMASKA_DEMO;

  return (
    <ContentShell>
      <div className="mb-10">
        <p className="text-overline text-accent mb-2">{t(locale, "platformName")}</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">
          {t(locale, "aboutTitle")}
        </h1>
        <p className="text-slate-500 text-lg">{t(locale, "aboutSubtitle")}</p>
      </div>

      <div className="space-y-8">
        <Section>
          <p className="text-base">{t(locale, "methodologyIntro")}</p>
        </Section>

        <Section id="methodology" title={t(locale, "methodology")}>
          <p>{t(locale, "compositeFormulaDesc")}</p>

          <div className="content-card mt-4 !p-5">
            <h3 className="text-overline text-slate-500 mb-3">
              {t(locale, "compositeFormula")}
            </h3>
            <WeightRow label={t(locale, "weightClimate")} pct="25%" />
            <WeightRow label={t(locale, "weightHydrology")} pct="20%" />
            <WeightRow label={t(locale, "weightHydrogeology")} pct="15%" />
            <WeightRow label={t(locale, "weightTerritory")} pct="15%" />
            <WeightRow label={t(locale, "weightDemographic")} pct="10%" />
            <WeightRow label={t(locale, "weightEconomy")} pct="15%" />
          </div>

          <div className="grid gap-3 mt-4 sm:grid-cols-2">
            <div className="content-card !p-4">
              <h4 className="font-semibold text-slate-800 text-sm mb-1.5">SPI / SPEI</h4>
              <p className="text-sm text-slate-600">
                {t(locale, "spiDesc")} {t(locale, "speiDesc")}
              </p>
            </div>
            <div className="content-card !p-4">
              <h4 className="font-semibold text-slate-800 text-sm mb-1.5">
                {t(locale, "groundwaterStress")}
              </h4>
              <p className="text-sm text-slate-600">{t(locale, "gwDesc")}</p>
            </div>
            <div className="content-card !p-4 sm:col-span-2">
              <h4 className="font-semibold text-slate-800 text-sm mb-1.5">
                {t(locale, "yield")}
              </h4>
              <p className="text-sm text-slate-600">{t(locale, "yieldDesc")}</p>
            </div>
          </div>
        </Section>

        <Section title={t(locale, "yamaskaDemoTitle")}>
          <p>{t(locale, "yamaskaDemoDesc")}</p>
          <div className="flex items-center gap-6 mt-4 content-card">
            <div className="text-center flex-1">
              <div
                className="text-3xl font-bold text-data"
                style={{ color: resilienceLevelColor("moderate") }}
              >
                {demo.current.irht}
              </div>
              <div className="text-caption text-slate-500 mt-1">{t(locale, "currentClimate")}</div>
            </div>
            <div className="text-slate-300 text-xl">→</div>
            <div className="text-center flex-1">
              <div
                className="text-3xl font-bold text-data"
                style={{ color: resilienceLevelColor("low") }}
              >
                {demo.scenario2050.irht}
              </div>
              <div className="text-caption text-slate-500 mt-1">{t(locale, "projectedClimate")} 2050</div>
            </div>
          </div>
        </Section>

        <Section title={t(locale, "resilienceTiers")}>
          <div className="content-card space-y-3">
            <ResilienceBadge color={resilienceLevelColor("veryHigh")} label={t(locale, "irhtVeryHigh")} />
            <ResilienceBadge color={resilienceLevelColor("high")} label={t(locale, "irhtHigh")} />
            <ResilienceBadge color={resilienceLevelColor("moderate")} label={t(locale, "irhtModerate")} />
            <ResilienceBadge color={resilienceLevelColor("low")} label={t(locale, "irhtLow")} />
            <ResilienceBadge color={resilienceLevelColor("critical")} label={t(locale, "irhtCritical")} />
          </div>
        </Section>

        <Section title={t(locale, "watershedInfo")}>
          <p>{t(locale, "watershedDesc")}</p>
        </Section>

        <Section title={t(locale, "dataSources")}>
          <ul className="list-disc pl-5 space-y-2 text-sm content-card">
            <li>
              <strong>SIH</strong> — Gouvernement du Québec (
              <a
                href="https://www.donneesquebec.ca/recherche/dataset/eau-souterraines-sih-index"
                className="text-accent hover:text-accent-hover hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Données Québec
              </a>
              )
            </li>
            <li>
              <strong>RSESQ</strong> — Réseau de surveillance des eaux souterraines (
              <a
                href="https://www.donneesquebec.ca/recherche/dataset/eaux-souterraines-ext"
                className="text-accent hover:text-accent-hover hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Données Québec
              </a>
              )
            </li>
            <li>
              <strong>ZGIEBV</strong> — Zones de gestion intégrée de l&apos;eau par bassin versant
            </li>
            <li>
              <strong>Occupation du sol</strong> — Thèmes publics MELCCFP (couche 148)
            </li>
            <li>
              <strong>GTC</strong> — Grand inventaire des terrains contaminés (couche 12)
            </li>
            <li>
              <strong>SPI / SPEI</strong> — Agriculture and Agri-Food Canada / ECCC GeoMet
            </li>
            <li>
              <strong>StatCan</strong> — Proxys démographiques régionaux (population, densité)
            </li>
            <li>
              <strong>Ouranos</strong> — Projections climatiques SSP (Phase B)
            </li>
          </ul>
        </Section>

        <Section title={t(locale, "limitations")}>
          <p>{t(locale, "limitationsText")}</p>
        </Section>

        <Section title={t(locale, "phaseRoadmap")}>
          <ol className="list-decimal pl-5 space-y-2 text-sm content-card">
            <li>{t(locale, "phase1")}</li>
            <li>{t(locale, "phase2")}</li>
            <li>{t(locale, "phase3")}</li>
          </ol>
        </Section>
      </div>

      <p className="mt-12 pt-6 border-t border-surface-border text-caption text-slate-400">
        © {new Date().getFullYear()} {t(locale, "copyrightName")} · {t(locale, "platformName")}
      </p>
    </ContentShell>
  );
}
