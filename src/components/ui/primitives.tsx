"use client";

import { cn } from "@/lib/cn";

export function MapGlassCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("glass-panel pointer-events-auto", className)} {...props}>
      {children}
    </div>
  );
}

export function MapPanelHeader({
  title,
  subtitle,
  actions,
  variant = "light",
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "light" | "demo";
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-2 px-3 py-2.5 border-b",
        variant === "demo"
          ? "bg-gradient-to-r from-demo to-sky-500 border-demo/20 text-white"
          : "bg-surface-muted/80 border-surface-border"
      )}
    >
      <div className="min-w-0">
        <h3
          className={cn(
            "text-panel-title truncate",
            variant === "demo" ? "text-white" : "text-slate-900"
          )}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className={cn(
              "text-caption truncate mt-0.5",
              variant === "demo" ? "text-sky-100" : "text-slate-500"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
    </div>
  );
}

export function IconButton({
  onClick,
  label,
  children,
  variant = "light",
  className,
}: {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  variant?: "light" | "dark" | "demo";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-150",
        variant === "light" && "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
        variant === "dark" && "text-white/60 hover:text-white hover:bg-white/10",
        variant === "demo" && "text-white/90 hover:bg-white/20",
        className
      )}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  className,
  children,
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150",
        "bg-accent text-white hover:bg-accent-hover active:scale-[0.98]",
        "focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2",
        size === "sm" ? "px-2.5 py-1.5 text-[11px]" : "px-4 py-2 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
