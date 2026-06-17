"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function DisclaimerModal() {
  const { locale, disclaimerAccepted, teamNoteReady, acceptDisclaimer } = useApp();

  if (!teamNoteReady || disclaimerAccepted) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 sm:p-6 animate-fade-in relative max-h-[90dvh] overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900">
                {t(locale, "disclaimerTitle")}
              </h2>
            </div>
          </div>
          <div className="shrink-0 self-start sm:self-auto">
            <LanguageToggle variant="modal" />
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {t(locale, "disclaimerText")}
        </p>
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-5 font-medium">
          {t(locale, "disclaimerSignOff")}
        </p>

        <button
          onClick={acceptDisclaimer}
          className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium 
                     rounded-lg transition-colors"
        >
          {t(locale, "acceptDisclaimer")}
        </button>
      </div>
    </div>
  );
}
