"use client";

import { useApp } from "@/context/AppContext";
import type { Locale } from "@/lib/types";

interface LanguageToggleProps {
  variant?: "header" | "modal";
}

export function LanguageToggle({ variant = "header" }: LanguageToggleProps) {
  const { locale, setLocale } = useApp();

  const set = (l: Locale) => setLocale(l);

  if (variant === "modal") {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-slate-200 p-0.5 bg-slate-50">
        <LangButton active={locale === "en"} onClick={() => set("en")} label="English" />
        <LangButton active={locale === "fr"} onClick={() => set("fr")} label="Français" />
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 rounded-md border border-white/20 p-0.5"
      title="Language / Langue"
    >
      <svg
        className="w-3.5 h-3.5 text-white/60 ml-1 shrink-0 hidden sm:block"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5a18.022 18.022 0 01-3.827 5.475M6 10h13a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z"
        />
      </svg>
      <LangButton
        active={locale === "en"}
        onClick={() => set("en")}
        label="English"
        dark
      />
      <LangButton
        active={locale === "fr"}
        onClick={() => set("fr")}
        label="Français"
        dark
      />
    </div>
  );
}

function LangButton({
  active,
  onClick,
  label,
  dark = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-0.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
        dark
          ? active
            ? "bg-white text-sidebar"
            : "text-white/70 hover:text-white"
          : active
            ? "bg-accent text-white"
            : "text-slate-500 hover:text-slate-800"
      }`}
      aria-pressed={active}
      aria-label={label}
    >
      {label}
    </button>
  );
}
