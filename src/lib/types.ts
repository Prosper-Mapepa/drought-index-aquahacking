export type Locale = "en" | "fr";

import type { ClimateScenarioId } from "./scenarios";

export interface WellFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: WellProperties;
}

export interface WellProperties {
  OBJECTID: number;
  CLE_PUITS?: string;
  CONTEXTE?: string;
  ENTREPRISE?: string;
  METHODE_FORAGE?: string;
  DATE_FORAGE?: string;
  NOM?: string;
  ADRESSE?: string;
  VILLE?: string;
  CODE_POSTAL?: string;
  LATITUDE?: number;
  LONGITUDE?: number;
  PROFOND_PUITS?: number;
  LONG_TUBAGE?: number;
  DIAM_TUBAGE?: number;
  NIVEAU?: string;
  DEBT_ESSAI_POMP?: number;
  DUREE_ESSAI_POMP?: number;
  METH_POMPAGE?: string;
  IND_HYDRO?: string;
  [key: string]: string | number | null | undefined;
}

export interface GeoJSONCollection {
  type: "FeatureCollection";
  features: WellFeature[];
}

export type LayerId =
  | "sih-wells"
  | "rsesq-stations"
  | "spi"
  | "spei"
  | "watersheds"
  | "land-use"
  | "gtc-sites"
  | "great-lakes-basin"
  | "us-spi"
  | "satellite"
  | "terrain";

export type MapRegion = "quebec" | "great-lakes";

export interface IndexWeights {
  spi: number;
  spei: number;
  groundwater: number;
  yield: number;
  landUse: number;
  contamination: number;
  demographic: number;
}

export interface RsesqTimeSeriesPoint {
  date: string;
  level: number;
}

export interface RsesqStationSelection {
  name: string;
  stationId: string | null;
  series: RsesqTimeSeriesPoint[];
}

export interface SavedArea {
  id: string;
  name: string;
  center: [number, number];
  zoom: number;
  region: MapRegion;
  createdAt: string;
}

export interface FlyToTarget {
  center: [number, number];
  zoom: number;
  id?: number;
  /** Apply climate scenario after fly animation completes */
  scenarioAfter?: ClimateScenarioId;
}

export interface LayerState {
  id: LayerId;
  visible: boolean;
  opacity: number;
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
}

export interface DroughtIndexResult {
  spi: number | null;
  spei: number | null;
  groundwaterStress: number | null;
  yieldStress: number | null;
  composite: number | null;
  riskTier: "low" | "moderate" | "high" | "extreme";
  category: string;
}

export interface WatershedProperties {
  ZGIEBV?: string;
  OBV?: string;
  SIGLE?: string;
  ZGIE_KM2?: number;
  CAT_PROB_A?: string;
  CAT_PROB_B?: string;
  SITE_WEB?: string;
  PDE?: string;
  NO_ZGIEBV?: number;
  OBJECTID?: number;
  [key: string]: string | number | null | undefined;
}
