"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export function Footer() {
  const { locale, coordinates } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative flex items-center justify-between gap-3 px-4 sm:px-5 chrome-gradient border-t border-sidebar-border text-caption text-sidebar-muted shrink-0 z-50 dark-chrome"
      style={{ height: "var(--footer-height)" }}
    >
      <div className="accent-stripe bottom-0 top-auto" aria-hidden />

      <div className="flex items-center gap-2 min-w-0 truncate">
        <span className="shrink-0 text-white/70 font-medium">
          © {year} {t(locale, "copyrightName")}
        </span>
        <span className="hidden md:inline text-white/25">·</span>
        <span className="hidden md:inline truncate text-white/45">{t(locale, "attribution")}</span>
      </div>

      <span className="md:hidden shrink-0 text-[10px] text-white/40">© QC · AAFC</span>

      {coordinates && (
        <div className="flex items-center gap-1.5 shrink-0 bg-white/5 rounded-md px-2 py-0.5 border border-white/8">
          <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className={cn("text-data text-[10px] text-white/75")}>
            {coordinates[0].toFixed(5)}, {coordinates[1].toFixed(5)}
          </span>
        </div>
      )}
    </footer>
  );
}
