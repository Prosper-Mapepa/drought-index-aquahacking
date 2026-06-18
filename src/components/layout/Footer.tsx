"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function Footer() {
  const { locale, coordinates } = useApp();
  const year = new Date().getFullYear();

  return (
    <footer
      className="flex items-center justify-between gap-2 px-4 bg-sidebar/95 border-t border-sidebar-border 
                 text-[11px] text-white/50 shrink-0 z-50"
      style={{ height: "var(--footer-height)" }}
    >
      <div className="flex items-center gap-2 min-w-0 truncate">
        <span className="shrink-0 text-white/60">
          © {year} {t(locale, "copyrightName")}
        </span>
        <span className="hidden md:inline text-white/30">·</span>
        <span className="hidden md:inline truncate">{t(locale, "attribution")}</span>
      </div>
      <span className="md:hidden shrink-0 text-[10px]">© QC · AAFC</span>
      {coordinates && (
        <span className="font-mono text-white/70">
          {coordinates[0].toFixed(5)} : {coordinates[1].toFixed(5)}
        </span>
      )}
    </footer>
  );
}
