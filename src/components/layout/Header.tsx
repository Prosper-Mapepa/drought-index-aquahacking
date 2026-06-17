"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

interface HeaderProps {
  showSearch?: boolean;
}

export function Header({ showSearch = false }: HeaderProps) {
  const { locale, sidebarOpen, setSidebarOpen } = useApp();
  const pathname = usePathname();

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-4 bg-sidebar border-b border-sidebar-border shrink-0 z-50"
      style={{ height: "var(--header-height)" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {showSearch && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={`md:hidden shrink-0 p-1.5 rounded-md border transition-colors ${
              sidebarOpen
                ? "border-accent/60 bg-accent/20 text-white"
                : "border-white/20 text-white/80 hover:text-white hover:bg-white/10"
            }`}
            aria-label={t(locale, "openLayers")}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Link href="/" className="flex flex-col min-w-0 hover:opacity-90 transition-opacity">
          <h1 className="text-base font-bold text-white tracking-wide truncate">
            {t(locale, "platformName")}
          </h1>
          <span className="text-[12px] text-white/50 truncate hidden sm:block">
            {t(locale, "platformSubtitle")}
          </span>
        </Link>
      </div>

      {showSearch && (
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <input
            type="text"
            placeholder={t(locale, "search")}
            className="w-full px-3 py-1.5 text-sm bg-white/10 border border-white/10 rounded-md 
                       text-white placeholder-white/40 focus:outline-none focus:border-accent/60"
            id="map-search"
          />
        </div>
      )}

      <nav className="flex items-center gap-1 sm:gap-3 shrink-0">
        <Link
          href="/docs"
          className={`text-xs transition-colors hidden sm:inline ${
            pathname === "/docs"
              ? "text-white font-medium"
              : "text-white/60 hover:text-white"
          }`}
        >
          {t(locale, "apiDocs")}
        </Link>
        <Link
          href="/about"
          className={`text-xs transition-colors hidden sm:inline ${
            pathname === "/about"
              ? "text-white font-medium"
              : "text-white/60 hover:text-white"
          }`}
        >
          {t(locale, "about")}
        </Link>
        <Link
          href="/about#methodology"
          className="text-xs text-white/60 hover:text-white transition-colors hidden sm:inline"
        >
          {t(locale, "help")}
        </Link>
        <LanguageToggle />
      </nav>
    </header>
  );
}
