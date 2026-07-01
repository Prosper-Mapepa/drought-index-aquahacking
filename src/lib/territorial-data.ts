import {
  GTC_LAYER_URL,
  THEMES_PUBLIC_MAPSERVER,
} from "./constants";
import type { DemographicInfo } from "./demographics";

export interface LandUseInfo {
  category: string | null;
  detail: string | null;
  landUseStress: number;
}

export interface ContaminationInfo {
  nearby: boolean;
  siteCount: number;
  contaminationStress: number;
  nearestSite?: string;
}

export interface TerritorialFactors {
  landUse: LandUseInfo;
  contamination: ContaminationInfo;
  demographicPressure: number;
  demographics?: DemographicInfo;
}

async function arcgisIdentify(
  mapServerUrl: string,
  layerId: number,
  lat: number,
  lng: number
): Promise<Record<string, string | number> | null> {
  const delta = 0.05;
  const params = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
    geometryType: "esriGeometryPoint",
    sr: "4326",
    layers: `visible:${layerId}`,
    tolerance: "5",
    mapExtent: `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`,
    imageDisplay: "600,400,96",
    returnGeometry: "false",
    f: "json",
  });

  const res = await fetch(`${mapServerUrl}/identify?${params}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0]?.attributes ?? null;
}

function landUseStressFromCategory(
  category?: string | null,
  detail?: string | null
): number {
  const text = `${category ?? ""} ${detail ?? ""}`.toLowerCase();
  if (/urbain|urban|commercial|industriel|industrial|route|transport/.test(text))
    return 0.85;
  if (/agricol|agri|culture|cultiv/.test(text)) return 0.65;
  if (/aquatique|lac|plan d'eau|eau|wetland|milieu humide/.test(text))
    return 0.55;
  if (/forest|forêt|boisé|boise/.test(text)) return 0.25;
  if (/naturel|parc|conservation/.test(text)) return 0.2;
  return 0.45;
}

async function queryNearbyGtc(
  lat: number,
  lng: number,
  distanceMeters = 2000
): Promise<ContaminationInfo> {
  const params = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    distance: String(distanceMeters),
    units: "esriSRUnit_Meter",
    outFields: "NO_MEF_LIEU,NB_FICHES,DESC_MILIEU_RECEPT",
    returnGeometry: "false",
    f: "json",
    resultRecordCount: "5",
  });

  const res = await fetch(`${GTC_LAYER_URL}/query?${params}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    return { nearby: false, siteCount: 0, contaminationStress: 0 };
  }

  const data = await res.json();
  const features = data.features ?? [];
  if (features.length === 0) {
    return { nearby: false, siteCount: 0, contaminationStress: 0 };
  }

  const nearest = features[0].attributes ?? {};
  const fichCount = Number(nearest.NB_FICHES ?? 1);
  const stress = Math.min(0.3 + fichCount * 0.15, 0.95);

  return {
    nearby: true,
    siteCount: features.length,
    contaminationStress: stress,
    nearestSite: String(nearest.NO_MEF_LIEU ?? ""),
  };
}

export async function fetchTerritorialFactors(
  lat: number,
  lng: number,
  demographics?: DemographicInfo
): Promise<TerritorialFactors> {
  const [landAttrs, contamination] = await Promise.all([
    arcgisIdentify(THEMES_PUBLIC_MAPSERVER, 148, lat, lng),
    queryNearbyGtc(lat, lng),
  ]);

  const category = landAttrs
    ? String(landAttrs.DESC_CAT ?? landAttrs.DESC_RCL_A ?? "")
    : null;
  const detail = landAttrs ? String(landAttrs.classe_detaillee ?? "") : null;

  const demo = demographics;
  const pressure = demo ? 1 - demo.resilienceScore : 0.5;

  return {
    landUse: {
      category,
      detail,
      landUseStress: landUseStressFromCategory(category, detail),
    },
    contamination,
    demographicPressure: pressure,
    demographics: demo,
  };
}

export function parseRsesqStationId(popupInfo: string): string | null {
  const match = popupInfo.match(/Station\s*=\s*(\d+)/);
  return match?.[1] ?? null;
}

export function buildRsesqDemoSeries(stationId: string): { date: string; level: number }[] {
  const seed = stationId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const base = 2 + (seed % 80) / 10;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, i) => ({
    date: month,
    level: Number((base + Math.sin((i / 12) * Math.PI * 2) * 1.2 + (seed % 10) / 20).toFixed(2)),
  }));
}
