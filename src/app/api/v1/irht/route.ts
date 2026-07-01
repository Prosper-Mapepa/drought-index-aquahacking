import { NextRequest } from "next/server";
import { fetchClimateIndices } from "@/lib/climate-data";
import type { ClimateScenarioId } from "@/lib/scenarios";
import {
  parseCustomScenarioFromSearchParams,
  resolveScenario,
} from "@/lib/scenarios";
import type { WatershedProperties } from "@/lib/types";
import { fetchTerritorialWithDemographics } from "@/lib/territorial-lookup";
import { applyScenarioToIrht, buildIrhtResult } from "@/lib/irht";
import { v1Json, v1Error } from "@/lib/api-v1";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get("lat") ?? "");
  const lng = parseFloat(params.get("lng") ?? "");
  const locale = params.get("locale") === "fr" ? "fr" : "en";
  const scenarioId = (params.get("scenario") ?? "current") as ClimateScenarioId;
  const depth = params.get("depth") ? parseFloat(params.get("depth")!) : undefined;
  const yieldLpm = params.get("yield") ? parseFloat(params.get("yield")!) : undefined;

  let watershed: WatershedProperties | undefined;
  if (params.get("watershed")) {
    try {
      watershed = JSON.parse(params.get("watershed")!);
    } catch {
      /* ignore */
    }
  }

  if (isNaN(lat) || isNaN(lng)) {
    return v1Error("lat and lng are required", 400);
  }

  try {
    const customScenario = parseCustomScenarioFromSearchParams(params);
    const scenario = resolveScenario(scenarioId, customScenario);
    const territorial = await fetchTerritorialWithDemographics(lat, lng, watershed);
    const { spi, spei } = await fetchClimateIndices(
      lat,
      lng,
      scenario.useAafcSpi,
      scenario.wmsLayer
    );

    const base = buildIrhtResult(
      { spi, spei, depth, yieldLpm, territorial, watershed },
      locale
    );
    const projected = applyScenarioToIrht(base, scenarioId, locale);

    return v1Json({
      ...projected,
      spi,
      spei,
      scenario: scenarioId,
      demographics: territorial.demographics ?? null,
      location: { lat, lng },
    });
  } catch (error) {
    return v1Error(`IRHT lookup failed: ${String(error)}`, 502);
  }
}
