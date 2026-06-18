import { NextRequest, NextResponse } from "next/server";
import { buildDroughtScore } from "@/lib/drought-index";
import { buildInvestmentRisk } from "@/lib/investment-risk";
import { fetchClimateIndices } from "@/lib/climate-data";
import { parseWeightsFromSearchParams } from "@/lib/index-weights";
import type { ClimateScenarioId } from "@/lib/scenarios";
import {
  parseCustomScenarioFromSearchParams,
  resolveScenario,
} from "@/lib/scenarios";
import type { WatershedProperties } from "@/lib/types";

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
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const customScenario = parseCustomScenarioFromSearchParams(params);
  const scenario = resolveScenario(scenarioId, customScenario);
  const { spi, spei } = await fetchClimateIndices(
    lat,
    lng,
    scenario.useAafcSpi,
    scenario.wmsLayer
  );

  const weights = parseWeightsFromSearchParams(params);
  const droughtScore = buildDroughtScore({ spi, spei, depth, yieldLpm, weights }, locale);
  const report = buildInvestmentRisk({
    droughtScore,
    watershed,
    scenarioId,
    customScenario: scenarioId === "custom" ? customScenario : null,
    locale,
  });

  return NextResponse.json(report, {
    headers: { "Cache-Control": "public, s-maxage=3600" },
  });
}
