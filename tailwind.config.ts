import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: "#152232",
          hover: "#1e3044",
          border: "#243548",
          muted: "#8ba3bc",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          muted: "#dbeafe",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f8fafc",
          border: "#e2e8f0",
        },
        demo: {
          DEFAULT: "#0ea5e9",
          hover: "#0284c7",
          muted: "#e0f2fe",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        panel: "0 8px 32px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06)",
        "panel-lg":
          "0 16px 48px rgba(15, 23, 42, 0.16), 0 4px 16px rgba(15, 23, 42, 0.08)",
        chrome: "0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 4px 24px rgba(0, 0, 0, 0.25)",
        glow: "0 0 0 1px rgba(59, 130, 246, 0.15), 0 8px 32px rgba(59, 130, 246, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      zIndex: {
        legend: "998",
        controls: "1000",
        overlay: "1001",
        risk: "1002",
        sidebar: "1060",
        modal: "9999",
      },
    },
  },
  plugins: [],
};

export default config;
