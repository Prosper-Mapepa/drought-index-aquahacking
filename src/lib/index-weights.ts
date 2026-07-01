import type { IndexWeights, MapRegion } from "./types";

export const DEFAULT_INDEX_WEIGHTS: IndexWeights = {
  spi: 0.22,
  spei: 0.18,
  groundwater: 0.18,
  yield: 0.1,
  landUse: 0.12,
  contamination: 0.1,
  demographic: 0.1,
};

export const REGION_VIEWS: Record<
  MapRegion,
  { center: [number, number]; zoom: number }
> = {
  quebec: { center: [46.8, -71.2], zoom: 10 },
  "great-lakes": { center: [45.5, -84.0], zoom: 6 },
};

export function normalizeWeights(weights: Partial<IndexWeights>): IndexWeights {
  const merged: IndexWeights = {
    spi: weights.spi ?? DEFAULT_INDEX_WEIGHTS.spi,
    spei: weights.spei ?? DEFAULT_INDEX_WEIGHTS.spei,
    groundwater: weights.groundwater ?? DEFAULT_INDEX_WEIGHTS.groundwater,
    yield: weights.yield ?? DEFAULT_INDEX_WEIGHTS.yield,
    landUse: weights.landUse ?? DEFAULT_INDEX_WEIGHTS.landUse,
    contamination: weights.contamination ?? DEFAULT_INDEX_WEIGHTS.contamination,
    demographic: weights.demographic ?? DEFAULT_INDEX_WEIGHTS.demographic,
  };
  const total =
    merged.spi +
    merged.spei +
    merged.groundwater +
    merged.yield +
    merged.landUse +
    merged.contamination +
    merged.demographic;
  if (total === 0) return DEFAULT_INDEX_WEIGHTS;
  return {
    spi: merged.spi / total,
    spei: merged.spei / total,
    groundwater: merged.groundwater / total,
    yield: merged.yield / total,
    landUse: merged.landUse / total,
    contamination: merged.contamination / total,
    demographic: merged.demographic / total,
  };
}

export function parseWeightsFromSearchParams(
  params: URLSearchParams
): IndexWeights | undefined {
  const keys = [
    "w_spi",
    "w_spei",
    "w_gw",
    "w_yield",
    "w_land",
    "w_contam",
    "w_demo",
  ] as const;
  if (!keys.some((k) => params.get(k))) return undefined;
  return normalizeWeights({
    spi: parseFloat(params.get("w_spi") ?? "0.22"),
    spei: parseFloat(params.get("w_spei") ?? "0.18"),
    groundwater: parseFloat(params.get("w_gw") ?? "0.18"),
    yield: parseFloat(params.get("w_yield") ?? "0.1"),
    landUse: parseFloat(params.get("w_land") ?? "0.12"),
    contamination: parseFloat(params.get("w_contam") ?? "0.1"),
    demographic: parseFloat(params.get("w_demo") ?? "0.1"),
  });
}
