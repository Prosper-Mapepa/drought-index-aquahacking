import { SPI_IMAGE_SERVER, SPEI_IMAGE_SERVER } from "./constants";
import { GEOMET_CLIMATE_WMS } from "./scenarios";

export async function identifyAafcRaster(
  imageServerUrl: string,
  lng: number,
  lat: number
): Promise<number | null> {
  const params = new URLSearchParams({
    geometry: JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
    geometryType: "esriGeometryPoint",
    returnGeometry: "false",
    returnCatalogItems: "false",
    f: "json",
    inSR: "4326",
  });

  const response = await fetch(`${imageServerUrl}/identify?${params}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;

  const data = await response.json();
  const raw = data.value ?? data?.objects?.[0]?.value;
  if (raw == null || raw === "" || raw === "NoData") return null;

  const parsed = parseFloat(String(raw));
  return isNaN(parsed) ? null : parsed;
}

export async function queryProjectedSpei(
  layer: string,
  lat: number,
  lng: number
): Promise<number | null> {
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
    const res = await fetch(`${GEOMET_CLIMATE_WMS}?${wmsParams}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const props = data.features?.[0]?.properties ?? {};
    const raw = Object.values(props).find((v) => typeof v === "number");
    if (raw == null) return null;
    const parsed = parseFloat(String(raw));
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

export async function fetchClimateIndices(
  lat: number,
  lng: number,
  useAafc: boolean,
  wmsLayer: string | null
): Promise<{ spi: number | null; spei: number | null }> {
  if (useAafc) {
    const [spi, spei] = await Promise.all([
      identifyAafcRaster(SPI_IMAGE_SERVER, lng, lat),
      identifyAafcRaster(SPEI_IMAGE_SERVER, lng, lat),
    ]);
    return { spi, spei };
  }
  if (wmsLayer) {
    const spei = await queryProjectedSpei(wmsLayer, lat, lng);
    return { spi: spei, spei };
  }
  return { spi: null, spei: null };
}
