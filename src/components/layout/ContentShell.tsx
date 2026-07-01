"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";
import { Header } from "./Header";

interface ContentShellProps {
  children: React.ReactNode;
  backHref?: string;
  showBack?: boolean;
}

export function ContentShell({
  children,
  backHref = "/",
  showBack = true,
}: ContentShellProps) {
  const { locale } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-100 to-slate-50">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-10 pb-16">
          {showBack && (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover mb-8 transition-colors"
            >
              ← {t(locale, "backToMap")}
            </Link>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
