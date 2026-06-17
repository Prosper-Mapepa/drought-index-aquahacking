"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerModal } from "@/components/ui/DisclaimerModal";
import { DroughtLegend } from "@/components/ui/DroughtLegend";
import { ScenarioBar, ScenarioBadge } from "@/components/ui/ScenarioBar";
import { RiskPanel } from "@/components/ui/RiskPanel";

const DroughtMap = dynamic(
  () => import("@/components/map/DroughtMap").then((m) => m.DroughtMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-slate-800 text-white/60">
        Loading map...
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header showSearch />
      <div className="flex flex-1 overflow-hidden relative min-w-0">
        <Sidebar />
        <main className="flex-1 relative min-w-0 w-full">
          <DroughtMap />
          <ScenarioBadge />
          <DroughtLegend />
          <ScenarioBar />
          <RiskPanel />
        </main>
      </div>
      <Footer />
      <DisclaimerModal />
    </div>
  );
}
