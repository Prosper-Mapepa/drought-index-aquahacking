export const SIH_LAYER_URL =
  "https://www.servicesgeo.enviroweb.gouv.qc.ca/donnees/rest/services/Public/Themes_publics/MapServer/78";

export const WATERSHED_LAYER_URL =
  "https://www.servicesgeo.enviroweb.gouv.qc.ca/donnees/rest/services/Public/Themes_publics/MapServer/83";

export const THEMES_PUBLIC_MAPSERVER =
  "https://www.servicesgeo.enviroweb.gouv.qc.ca/donnees/rest/services/Public/Themes_publics/MapServer";

export const RSESQ_LAYER_URL =
  "https://www.servicesgeo.enviroweb.gouv.qc.ca/donnees/rest/services/Public/Eaux_souterraines_EXT/MapServer/135";

export const LAND_USE_LAYER_URL = `${THEMES_PUBLIC_MAPSERVER}/148`;

export const GTC_LAYER_URL = `${THEMES_PUBLIC_MAPSERVER}/12`;

export const GREAT_LAKES_BASIN_URL =
  "https://gis.glc.org/server/rest/services/hydrology/Great_Lakes_Basin_Boundary/MapServer/0";

export const NOAA_SPI_HUC6_URL =
  "https://gis.ncdc.noaa.gov/arcgis/rest/services/cdo/nclimgrid/MapServer/125";

export const SPI_IMAGE_SERVER =
  "https://agriculture.canada.ca/imagery-images/rest/services/agclimate/standardized_precipitation_index/ImageServer";

export const SPEI_IMAGE_SERVER =
  "https://agriculture.canada.ca/imagery-images/rest/services/agclimate/standardized_precipitation_evapotranspiration_index/ImageServer";

/** Southern Québec — primary SIH coverage area */
export const QUEBEC_CENTER: [number, number] = [46.8, -71.2];
export const QUEBEC_ZOOM = 10;

/** Great Lakes basin overview */
export const GREAT_LAKES_CENTER: [number, number] = [45.5, -84.0];
export const GREAT_LAKES_ZOOM = 6;

export const DEFAULT_CENTER = QUEBEC_CENTER;
/** Start at SIH min zoom so wells load immediately in Québec view */
export const DEFAULT_ZOOM = QUEBEC_ZOOM;
export const MIN_ZOOM = 5;
export const MAX_ZOOM = 18;

/** Wells visible below 1:100,000 per ArcGIS layer metadata */
export const SIH_MIN_ZOOM = 10;

export const DROUGHT_COLORS = {
  extremeWet: "#1a5276",
  wet: "#2e86c1",
  normal: "#f4d03f",
  moderate: "#e67e22",
  severe: "#c0392b",
  extreme: "#641e16",
} as const;

export function spiValueToColor(value: number): string {
  if (value >= 2) return DROUGHT_COLORS.extremeWet;
  if (value >= 1) return DROUGHT_COLORS.wet;
  if (value >= -1) return DROUGHT_COLORS.normal;
  if (value >= -1.5) return DROUGHT_COLORS.moderate;
  if (value >= -2) return DROUGHT_COLORS.severe;
  return DROUGHT_COLORS.extreme;
}

export function droughtCategory(value: number): keyof typeof DROUGHT_COLORS {
  if (value >= 2) return "extremeWet";
  if (value >= 1) return "wet";
  if (value >= -1) return "normal";
  if (value >= -1.5) return "moderate";
  if (value >= -2) return "severe";
  return "extreme";
}

export function droughtLabel(value: number, locale: "en" | "fr"): string {
  const cat = droughtCategory(value);
  const labels = {
    en: {
      extremeWet: "Extremely wet",
      wet: "Wet",
      normal: "Normal",
      moderate: "Moderate drought",
      severe: "Severe drought",
      extreme: "Extreme drought",
    },
    fr: {
      extremeWet: "Extrêmement humide",
      wet: "Humide",
      normal: "Normal",
      moderate: "Sécheresse modérée",
      severe: "Sécheresse sévère",
      extreme: "Sécheresse extrême",
    },
  };
  return labels[locale][cat];
}
