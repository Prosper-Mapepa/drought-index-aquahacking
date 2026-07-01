import { NextRequest, NextResponse } from "next/server";
import { buildDroughtScore } from "@/lib/drought-index";
import { fetchClimateIndices } from "@/lib/climate-data";
import {
  parseCustomScenarioFromSearchParams,
  resolveScenario,
  type ClimateScenarioId,
} from "@/lib/scenarios";
import { fetchTerritorialWithDemographics } from "@/lib/territorial-lookup";
import { applyScenarioToIrht, buildIrhtResult } from "@/lib/irht";
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
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
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

    return NextResponse.json(
      {
        ...projected,
        spi,
        spei,
        scenario: scenarioId,
        demographics: territorial.demographics ?? null,
        territorial: {
          landUse: territorial.landUse,
          contamination: territorial.contamination,
        },
      },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "IRHT lookup failed", details: String(error) },
      { status: 502 }
    );
  }
}
