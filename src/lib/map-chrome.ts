"use client";

import { useApp } from "@/context/AppContext";

/** Shared bottom inset for map overlays when the risk panel is open */
export function useMapBottomInset(): string {
  const { investmentRisk } = useApp();
  return investmentRisk
    ? "bottom-[11.5rem] sm:bottom-[10.5rem]"
    : "bottom-20 sm:bottom-10";
}

/** Keep top-right overlays clear of custom +/- / locate controls (~56px wide) */
export const MAP_ZOOM_RESERVE_RIGHT = "right-14";

export function useMapChromeHidden(): boolean {
  const { investmentRisk, selectedWatershed } = useApp();
  return Boolean(investmentRisk || selectedWatershed);
}
