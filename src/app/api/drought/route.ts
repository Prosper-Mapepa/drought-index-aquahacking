import { NextRequest, NextResponse } from "next/server";
import { buildDroughtScore, computeGroundwaterStress, computeYieldStress } from "@/lib/drought-index";
import { fetchClimateIndices } from "@/lib/climate-data";
import { parseWeightsFromSearchParams } from "@/lib/index-weights";
import type { ClimateScenarioId } from "@/lib/scenarios";
import {
  parseCustomScenarioFromSearchParams,
  resolveScenario,
} from "@/lib/scenarios";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get("lat") ?? "");
  const lng = parseFloat(params.get("lng") ?? "");
  const depth = params.get("depth") ? parseFloat(params.get("depth")!) : undefined;
  const yieldLpm = params.get("yield") ? parseFloat(params.get("yield")!) : undefined;
  const locale = params.get("locale") === "fr" ? "fr" : "en";
  const scenarioId = (params.get("scenario") ?? "current") as ClimateScenarioId;

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
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

    return NextResponse.json(
      {
        ...score,
        groundwaterStress: computeGroundwaterStress(depth),
        yieldStress: computeYieldStress(yieldLpm),
        scenario: scenarioId,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Drought score lookup failed", details: String(error) },
      { status: 502 }
    );
  }
}
