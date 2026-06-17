import type { IndexWeights, MapRegion } from "./types";

export const DEFAULT_INDEX_WEIGHTS: IndexWeights = {
  spi: 0.35,
  spei: 0.25,
  groundwater: 0.25,
  yield: 0.15,
};

export const REGION_VIEWS: Record<
  MapRegion,
  { center: [number, number]; zoom: number }
> = {
  quebec: { center: [46.8, -71.2], zoom: 10 },
  "great-lakes": { center: [45.5, -84.0], zoom: 6 },
};

export function normalizeWeights(weights: IndexWeights): IndexWeights {
  const total = weights.spi + weights.spei + weights.groundwater + weights.yield;
  if (total === 0) return DEFAULT_INDEX_WEIGHTS;
  return {
    spi: weights.spi / total,
    spei: weights.spei / total,
    groundwater: weights.groundwater / total,
    yield: weights.yield / total,
  };
}

export function parseWeightsFromSearchParams(
  params: URLSearchParams
): IndexWeights | undefined {
  const spi = params.get("w_spi");
  const spei = params.get("w_spei");
  const gw = params.get("w_gw");
  const yld = params.get("w_yield");
  if (!spi && !spei && !gw && !yld) return undefined;
  return normalizeWeights({
    spi: parseFloat(spi ?? "0.35"),
    spei: parseFloat(spei ?? "0.25"),
    groundwater: parseFloat(gw ?? "0.25"),
    yield: parseFloat(yld ?? "0.15"),
  });
}
