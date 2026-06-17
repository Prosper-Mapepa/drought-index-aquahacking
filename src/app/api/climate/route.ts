import { NextRequest, NextResponse } from "next/server";
import { GEOMET_CLIMATE_WMS } from "@/lib/scenarios";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get("lat") ?? "");
  const lng = parseFloat(params.get("lng") ?? "");
  const layer = params.get("layer");

  if (isNaN(lat) || isNaN(lng) || !layer) {
    return NextResponse.json(
      { error: "lat, lng, and layer are required" },
      { status: 400 }
    );
  }

  const delta = 0.05;
  const bbox = `${lat - delta},${lng - delta},${lat + delta},${lng + delta}`;

  const wmsParams = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.3.0",
    REQUEST: "GetFeatureInfo",
    LAYERS: layer,
    QUERY_LAYERS: layer,
    CRS: "EPSG:4326",
    BBOX: bbox,
    WIDTH: "101",
    HEIGHT: "101",
    I: "50",
    J: "50",
    INFO_FORMAT: "application/json",
    STYLES: "SPEI",
  });

  try {
    const response = await fetch(`${GEOMET_CLIMATE_WMS}?${wmsParams}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json({ value: null });
    }

    const data = await response.json();
    const feature = data.features?.[0];
    const raw =
      feature?.properties?.[layer] ??
      feature?.properties?.value ??
      Object.values(feature?.properties ?? {}).find(
        (v) => typeof v === "number"
      );

    const parsed = raw != null ? parseFloat(String(raw)) : null;

    return NextResponse.json({
      value: parsed != null && !isNaN(parsed) ? parsed : null,
      layer,
    });
  } catch {
    return NextResponse.json({ value: null });
  }
}
