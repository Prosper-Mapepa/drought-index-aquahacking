import type { WatershedProperties } from "./types";

export interface DemographicInfo {
  population: number | null;
  densityPerKm2: number | null;
  growthRate: number | null;
  /** 0–1 resilience score for IRHT component D */
  resilienceScore: number;
  source: "watershed" | "regional" | "default";
}

/** Pilot basins from LAPARA / IRHT PDF (OBV Yamaska, etc.) */
const WATERSHED_DEMOGRAPHICS: Record<
  string,
  { population: number; areaKm2: number; growthRate: number }
> = {
  Yamaska: { population: 266355, areaKm2: 4843, growthRate: 0.2 },
  "Rivière Yamaska": { population: 266355, areaKm2: 4843, growthRate: 0.2 },
  "Saint-Laurent": { population: 4200000, areaKm2: 120000, growthRate: 0.08 },
  "Grands Lacs": { population: 34000000, areaKm2: 244000, growthRate: 0.05 },
};

function densityToResilience(density: number): number {
  if (density < 15) return 0.72;
  if (density < 40) return 0.6;
  if (density < 80) return 0.5;
  if (density < 150) return 0.42;
  return 0.35;
}

function growthToResilience(growth: number): number {
  if (growth <= 0.05) return 0.65;
  if (growth <= 0.12) return 0.55;
  if (growth <= 0.2) return 0.45;
  return 0.38;
}

export function computeDemographicResilience(
  density: number | null,
  growth: number | null
): number {
  const d = density != null ? densityToResilience(density) : 0.55;
  const g = growth != null ? growthToResilience(growth) : 0.55;
  return Number((0.55 * d + 0.45 * g).toFixed(2));
}

function matchWatershedKey(name?: string | null): string | null {
  if (!name) return null;
  const n = name.toLowerCase();
  for (const key of Object.keys(WATERSHED_DEMOGRAPHICS)) {
    if (n.includes(key.toLowerCase())) return key;
  }
  return null;
}

function regionalEstimate(lat: number, lng: number): DemographicInfo {
  if (lat >= 45 && lat <= 50 && lng >= -80 && lng <= -57) {
    const urban = lat > 45.4 && lat < 45.7 && lng > -73.8 && lng < -73.4;
    const density = urban ? 120 : lat > 46 ? 8 : 35;
    const growth = urban ? 0.12 : 0.06;
    return {
      population: null,
      densityPerKm2: density,
      growthRate: growth,
      resilienceScore: computeDemographicResilience(density, growth),
      source: "regional",
    };
  }
  if (lat >= 41 && lat <= 49 && lng >= -92 && lng <= -76) {
    return {
      population: null,
      densityPerKm2: 45,
      growthRate: 0.04,
      resilienceScore: computeDemographicResilience(45, 0.04),
      source: "regional",
    };
  }
  return {
    population: null,
    densityPerKm2: null,
    growthRate: null,
    resilienceScore: 0.55,
    source: "default",
  };
}

export function getDemographics(
  lat: number,
  lng: number,
  watershed?: WatershedProperties | null
): DemographicInfo {
  const wsName = watershed?.ZGIEBV ?? watershed?.OBV ?? null;
  const key = matchWatershedKey(wsName);
  if (key) {
    const w = WATERSHED_DEMOGRAPHICS[key];
    const density = w.population / w.areaKm2;
    return {
      population: w.population,
      densityPerKm2: Number(density.toFixed(1)),
      growthRate: w.growthRate,
      resilienceScore: computeDemographicResilience(density, w.growthRate),
      source: "watershed",
    };
  }

  const areaKm2 = watershed?.ZGIE_KM2;
  if (areaKm2 && areaKm2 > 0) {
    const density = 50000 / areaKm2;
    return {
      population: null,
      densityPerKm2: Number(density.toFixed(1)),
      growthRate: 0.08,
      resilienceScore: computeDemographicResilience(density, 0.08),
      source: "regional",
    };
  }

  return regionalEstimate(lat, lng);
}

export const YAMASKA_VIEW = {
  center: [45.45, -72.92] as [number, number],
  zoom: 9,
  label: "Yamaska",
};
