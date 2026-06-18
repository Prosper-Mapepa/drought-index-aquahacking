import { NextRequest } from "next/server";
import { buildDroughtScore, computeGroundwaterStress, computeYieldStress } from "@/lib/drought-index";
import { fetchClimateIndices } from "@/lib/climate-data";
import { parseWeightsFromSearchParams } from "@/lib/index-weights";
import type { ClimateScenarioId } from "@/lib/scenarios";
import {
  parseCustomScenarioFromSearchParams,
  resolveScenario,
} from "@/lib/scenarios";
import { v1Json, v1Error } from "@/lib/api-v1";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get("lat") ?? "");
  const lng = parseFloat(params.get("lng") ?? "");
  const depth = params.get("depth") ? parseFloat(params.get("depth")!) : undefined;
  const yieldLpm = params.get("yield") ? parseFloat(params.get("yield")!) : undefined;
  const locale = params.get("locale") === "fr" ? "fr" : "en";
  const scenarioId = (params.get("scenario") ?? "current") as ClimateScenarioId;

  if (isNaN(lat) || isNaN(lng)) {
    return v1Error("lat and lng are required", 400);
  }

  try {
    const customScenario = parseCustomScenarioFromSearchParams(params);
    const scenario = resolveScenario(scenarioId, customScenario);
    const { spi, spei } = await fetchClimateIndices(
      lat,
      lng,
      scenario.useAafcSpi,
      scenario.wmsLayer
    );

    const weights = parseWeightsFromSearchParams(params);
    const score = buildDroughtScore({ spi, spei, depth, yieldLpm, weights }, locale);

    return v1Json({
      ...score,
      groundwaterStress: computeGroundwaterStress(depth),
      yieldStress: computeYieldStress(yieldLpm),
      scenario: scenarioId,
      location: { lat, lng },
    });
  } catch (error) {
    return v1Error(`Drought score lookup failed: ${String(error)}`, 502);
  }
}
