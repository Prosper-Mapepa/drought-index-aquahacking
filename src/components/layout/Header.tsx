"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

interface HeaderProps {
  showSearch?: boolean;
}

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={cn("nav-link hidden sm:inline", active ? "nav-link-active" : "nav-link-inactive")}
    >
      {label}
    </Link>
  );
}

export function Header({ showSearch = false }: HeaderProps) {
  const { locale, sidebarOpen, setSidebarOpen } = useApp();
  const pathname = usePathname();

  return (
    <header
      className="relative flex items-center justify-between px-3 sm:px-5 chrome-gradient border-b border-sidebar-border shrink-0 z-50 dark-chrome"
      style={{ height: "var(--header-height)" }}
    >
      <div className="accent-stripe" aria-hidden />

      <div className="flex items-center gap-3 min-w-0">
        {showSearch && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={cn(
              "md:hidden shrink-0 p-2 rounded-lg border transition-all duration-150",
              sidebarOpen
                ? "border-accent/60 bg-accent/20 text-white shadow-glow"
                : "border-white/15 text-white/80 hover:text-white hover:bg-white/10"
            )}
            aria-label={t(locale, "openLayers")}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <Link href="/" className="flex items-center gap-2.5 min-w-0 group">
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-demo items-center justify-center shadow-glow shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V8.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold text-white tracking-tight truncate group-hover:text-white/95 transition-colors">
              {t(locale, "platformName")}
            </h1>
            <span className="text-caption text-sidebar-muted truncate hidden sm:block leading-tight">
              {t(locale, "platformSubtitle")}
            </span>
          </div>
        </Link>
      </div>

      {showSearch && (
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t(locale, "search")}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white/8 border border-white/10 rounded-lg
                         text-white placeholder-white/35
                         focus:outline-none focus:border-accent/50 focus:bg-white/12
                         transition-all duration-150"
              id="map-search"
            />
          </div>
        </div>
      )}

      <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
        <NavLink href="/docs" label={t(locale, "apiDocs")} pathname={pathname} />
        <NavLink href="/about" label={t(locale, "about")} pathname={pathname} />
        <Link
          href="/about#methodology"
          className="nav-link nav-link-inactive hidden sm:inline"
        >
          {t(locale, "help")}
        </Link>
        <div className="w-px h-5 bg-white/10 mx-1 hidden sm:block" />
        <LanguageToggle />
      </nav>
    </header>
  );
}
