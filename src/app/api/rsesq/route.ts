import { NextRequest, NextResponse } from "next/server";
import { buildRsesqDemoSeries } from "@/lib/territorial-data";

export async function GET(request: NextRequest) {
  const stationId = request.nextUrl.searchParams.get("station");
  if (!stationId) {
    return NextResponse.json({ error: "station is required" }, { status: 400 });
  }

  return NextResponse.json({
    stationId,
    series: buildRsesqDemoSeries(stationId),
    source: "seasonal-model",
    note:
      "Demo seasonal trend. Full historical series available via Données Québec RSESQ.",
  });
}
