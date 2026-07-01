import { NextRequest, NextResponse } from "next/server";
import { getDemographics } from "@/lib/demographics";
import { fetchTerritorialFactors } from "@/lib/territorial-data";
import type { WatershedProperties } from "@/lib/types";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get("lat") ?? "");
  const lng = parseFloat(params.get("lng") ?? "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  let watershed: WatershedProperties | undefined;
  if (params.get("watershed")) {
    try {
      watershed = JSON.parse(params.get("watershed")!);
    } catch {
      /* ignore */
    }
  }

  try {
    const demographics = getDemographics(lat, lng, watershed);
    const factors = await fetchTerritorialFactors(lat, lng, demographics);
    return NextResponse.json(factors, {
      headers: { "Cache-Control": "public, s-maxage=86400" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Territorial lookup failed", details: String(error) },
      { status: 502 }
    );
  }
}
