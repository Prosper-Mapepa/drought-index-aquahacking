"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { PrimaryButton } from "@/components/ui/primitives";

const FEATURE_KEYS = [
  "disclaimerFeature1",
  "disclaimerFeature2",
  "disclaimerFeature3",
  "disclaimerFeature4",
  "disclaimerFeature5",
] as const;

export function DisclaimerModal() {
  const { locale, disclaimerAccepted, teamNoteReady, acceptDisclaimer } = useApp();

  if (!teamNoteReady || disclaimerAccepted) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-2xl shadow-panel-lg max-w-lg w-full p-6 sm:p-8 animate-scale-in relative max-h-[90dvh] overflow-y-auto border border-surface-border">
        <div className="absolute top-0 inset-x-0 h-1 rounded-t-2xl bg-gradient-to-r from-accent via-demo to-accent" aria-hidden />

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-muted to-demo-muted flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-overline text-accent mb-1">
                {t(locale, "platformName")}
              </p>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {t(locale, "disclaimerTitle")}
              </h2>
              <p className="text-caption text-slate-500 mt-1">{t(locale, "platformSubtitle")}</p>
            </div>
          </div>
          <div className="shrink-0 self-start sm:self-auto">
            <LanguageToggle variant="modal" />
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {t(locale, "disclaimerText")}
        </p>

        <ul className="text-sm text-slate-600 space-y-2.5 mb-5">
          {FEATURE_KEYS.map((key) => (
            <li key={key} className="flex gap-2.5 leading-relaxed">
              <span className="w-5 h-5 rounded-full bg-accent-muted text-accent flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">✓</span>
              <span>{t(locale, key)}</span>
            </li>
          ))}
        </ul>

        <div className="bg-surface-muted rounded-xl border border-surface-border px-4 py-3 mb-5">
          <p className="text-caption font-mono text-slate-700 font-medium">{t(locale, "irhtFormula")}</p>
          <p className="text-overline text-slate-500 normal-case tracking-normal font-normal mt-1.5">{t(locale, "irhtFormulaDesc")}</p>
        </div>

        <p className="text-caption text-slate-500 mb-4">{t(locale, "disclaimerPrototypeNote")}</p>

        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-6 font-medium">
          {t(locale, "disclaimerSignOff")}
        </p>

        <PrimaryButton onClick={acceptDisclaimer} className="w-full py-3 text-base">
          {t(locale, "acceptDisclaimer")}
        </PrimaryButton>
      </div>
    </div>
  );
}
