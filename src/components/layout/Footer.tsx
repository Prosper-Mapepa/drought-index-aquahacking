"use client";

import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

export function Footer() {
  const { locale, coordinates } = useApp();

  return (
    <footer
      className="flex items-center justify-between px-4 bg-sidebar/95 border-t border-sidebar-border 
                 text-[11px] text-white/50 shrink-0 z-50"
      style={{ height: "var(--footer-height)" }}
    >
      <span className="hidden sm:inline">{t(locale, "attribution")}</span>
      <span className="sm:hidden">© QC · AAFC · OSM</span>
      {coordinates && (
        <span className="font-mono text-white/70">
          {coordinates[0].toFixed(5)} : {coordinates[1].toFixed(5)}
        </span>
      )}
    </footer>
  );
}
