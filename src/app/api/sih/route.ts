import { NextRequest, NextResponse } from "next/server";
import { SIH_LAYER_URL } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = new URLSearchParams();

  const passthrough = [
    "where",
    "geometry",
    "geometryType",
    "spatialRel",
    "outFields",
    "f",
    "outSR",
    "resultRecordCount",
    "resultOffset",
    "inSR",
    "returnGeometry",
  ];

  for (const key of passthrough) {
    const value = params.get(key);
    if (value) query.set(key, value);
  }

  if (!query.has("f")) query.set("f", "geojson");
  if (!query.has("outSR")) query.set("outSR", "4326");
  if (!query.has("outFields")) query.set("outFields", "*");

  const url = `${SIH_LAYER_URL}/query?${query.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "ArcGIS query failed", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch SIH data", details: String(error) },
      { status: 502 }
    );
  }
}
