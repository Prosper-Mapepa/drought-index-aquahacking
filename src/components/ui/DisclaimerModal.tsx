"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function DisclaimerModal() {
  const { locale, disclaimerAccepted, acceptDisclaimer } = useApp();

  if (disclaimerAccepted) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg mx-4 p-6 animate-fade-in">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t(locale, "disclaimerTitle")}
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              {t(locale, "disclaimerText")}
            </p>
          </div>
        </div>
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
