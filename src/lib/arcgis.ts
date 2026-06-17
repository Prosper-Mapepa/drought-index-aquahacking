import type { WellFeature } from "./types";

export async function querySihWells(params: {
  bbox?: string;
  offset?: number;
  limit?: number;
}): Promise<{ features: WellFeature[]; exceededTransferLimit: boolean }> {
  const searchParams = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    f: "geojson",
    outSR: "4326",
    resultRecordCount: String(params.limit ?? 1000),
    resultOffset: String(params.offset ?? 0),
  });

  if (params.bbox) {
    searchParams.set("geometry", params.bbox);
    searchParams.set("geometryType", "esriGeometryEnvelope");
    searchParams.set("spatialRel", "esriSpatialRelIntersects");
    searchParams.set("inSR", "4326");
  }

  const response = await fetch(`/api/sih?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error(`SIH query failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    features: data.features ?? [],
    exceededTransferLimit: Boolean(data.properties?.exceededTransferLimit),
  };
}

export async function queryAllSihWellsInBbox(
  bbox: string
): Promise<WellFeature[]> {
  const allFeatures: WellFeature[] = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const { features, exceededTransferLimit } = await querySihWells({
      bbox,
      offset,
      limit,
    });
    allFeatures.push(...features);
    hasMore = exceededTransferLimit && features.length === limit;
    offset += limit;
    if (offset > 50000) break;
  }

  return allFeatures;
}

export function wellsToCsv(features: WellFeature[]): string {
  if (features.length === 0) return "";
  const keys = [
    "CLE_PUITS",
    "VILLE",
    "ADRESSE",
    "LATITUDE",
    "LONGITUDE",
    "PROFOND_PUITS",
    "NIVEAU",
    "DEBT_ESSAI_POMP",
    "DATE_FORAGE",
    "ENTREPRISE",
  ];
  const header = keys.join(",");
  const rows = features.map((f) =>
    keys
      .map((k) => {
        const val = f.properties[k];
        if (val == null) return "";
        const str = String(val).replace(/"/g, '""');
        return str.includes(",") ? `"${str}"` : str;
      })
      .join(",")
  );
  return [header, ...rows].join("\n");
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
