"use client";

import { useApp } from "@/context/AppContext";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/cn";

interface LanguageToggleProps {
  variant?: "header" | "modal";
}

export function LanguageToggle({ variant = "header" }: LanguageToggleProps) {
  const { locale, setLocale } = useApp();

  const set = (l: Locale) => setLocale(l);

  if (variant === "modal") {
    return (
      <div className="flex items-center gap-0.5 rounded-lg border border-surface-border p-0.5 bg-surface-muted">
        <LangButton active={locale === "en"} onClick={() => set("en")} label="English" />
        <LangButton active={locale === "fr"} onClick={() => set("fr")} label="Français" />
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-white/15 p-0.5 bg-white/5"
      title="Language / Langue"
    >
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
      className={cn(
        "px-2 py-1 text-[11px] font-medium rounded-md transition-all duration-150 whitespace-nowrap",
        dark
          ? active
            ? "bg-white text-sidebar shadow-sm"
            : "text-white/65 hover:text-white hover:bg-white/8"
          : active
            ? "bg-accent text-white shadow-sm"
            : "text-slate-500 hover:text-slate-800 hover:bg-white"
      )}
      aria-pressed={active}
      aria-label={label}
    >
      {label}
    </button>
  );
}
