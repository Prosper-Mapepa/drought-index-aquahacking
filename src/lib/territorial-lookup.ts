import { getDemographics } from "./demographics";
import {
  fetchTerritorialFactors,
  type TerritorialFactors,
} from "./territorial-data";
import type { WatershedProperties } from "./types";

export async function fetchTerritorialWithDemographics(
  lat: number,
  lng: number,
  watershed?: WatershedProperties | null
): Promise<TerritorialFactors> {
  const demographics = getDemographics(lat, lng, watershed ?? undefined);
  return fetchTerritorialFactors(lat, lng, demographics);
}
