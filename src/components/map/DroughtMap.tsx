"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  MapContainer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useApp } from "@/context/AppContext";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  SIH_MIN_ZOOM,
  SPI_IMAGE_SERVER,
  SPEI_IMAGE_SERVER,
  WATERSHED_LAYER_URL,
  GREAT_LAKES_BASIN_URL,
  NOAA_SPI_HUC6_URL,
  RSESQ_LAYER_URL,
  LAND_USE_LAYER_URL,
  GTC_LAYER_URL,
  spiValueToColor,
  droughtLabel,
} from "@/lib/constants";
import { GEOMET_CLIMATE_WMS, resolveScenario } from "@/lib/scenarios";
import { buildRsesqDemoSeries, parseRsesqStationId } from "@/lib/territorial-data";
import {
  queryAllSihWellsInBbox,
  wellsToCsv,
  downloadFile,
} from "@/lib/arcgis";
import {
  formatWellPopup,
  formatLoadingPopup,
  formatWatershedPopup,
  fetchDroughtScore,
  fetchInvestmentRisk,
} from "@/lib/popups";
import type { WellFeature, WatershedProperties } from "@/lib/types";
import { t } from "@/lib/i18n";
import {
  safeCloseLayerPopup,
  safeMapCleanup,
  safeRemoveLayer,
  safeSetPopupContent,
  safeAddToMap,
  isMapUsable,
  deferLayerMutation,
  useTransitioningRef,
  bumpAsyncGeneration,
  isAsyncGenerationStale,
  runLayerSync,
  safeGetMapView,
} from "@/lib/map-safe";
import type { MutableRefObject } from "react";

function layerEffectCleanup(
  map: L.Map,
  layerRef: React.MutableRefObject<L.Layer | null>,
  layersLockedRef: React.MutableRefObject<boolean>,
  setCancelled: () => void
) {
  setCancelled();
  if (!layersLockedRef.current) {
    safeRemoveLayer(map, layerRef.current);
    layerRef.current = null;
  }
}

/** After async work, bail if layers are locked or map is torn down */
function abortLayerSync(
  map: L.Map,
  layersLockedRef: MutableRefObject<boolean>
): boolean {
  return layersLockedRef.current || !isMapUsable(map);
}

function MapRegionTransition() {
  const map = useMap();
  const { region, mapTransitioning } = useApp();
  const prevRegion = useRef(region);

  useEffect(() => {
    if (prevRegion.current !== region) {
      safeMapCleanup(map);
      prevRegion.current = region;
    }
  }, [region, map]);

  useEffect(() => {
    if (mapTransitioning) {
      safeMapCleanup(map);
    }
  }, [mapTransitioning, map]);

  return null;
}

function MapScaleControl() {
  const map = useMap();

  useEffect(() => {
    if (!isMapUsable(map)) return;
    const control = L.control.scale({
      imperial: true,
      metric: true,
      position: "bottomleft",
    });
    control.addTo(map);
    return () => {
      try {
        control.remove();
      } catch {
        /* map may be gone */
      }
    };
  }, [map]);

  return null;
}

function MapCleanupGuard() {
  const map = useMap();
  useEffect(() => {
    return () => safeMapCleanup(map);
  }, [map]);
  return null;
}

function MapInstanceRegistrar({ onMap }: { onMap: (map: L.Map | null) => void }) {
  const map = useMap();
  useEffect(() => {
    onMap(map);
    return () => onMap(null);
  }, [map, onMap]);
  return null;
}

function MapFlyTo() {
  const map = useMap();
  const { flyToTarget, setMapTransitioning, setScenario } = useApp();
  const lastIdRef = useRef(0);

  useEffect(() => {
    if (!flyToTarget?.id || flyToTarget.id === lastIdRef.current) return;
    if (!isMapUsable(map)) return;
    lastIdRef.current = flyToTarget.id;
    const scenarioAfter = flyToTarget.scenarioAfter;

    setMapTransitioning(true);
    safeMapCleanup(map);
    map.stop();

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      setMapTransitioning(false);
    };

    const safety = window.setTimeout(finish, 3000);
    map.once("moveend", () => {
      window.clearTimeout(safety);
      finish();
      if (scenarioAfter) {
        window.setTimeout(() => setScenario(scenarioAfter), 100);
      }
    });

    try {
      map.flyTo(flyToTarget.center, flyToTarget.zoom, {
        duration: 1.0,
        noMoveStart: true,
      });
    } catch {
      window.clearTimeout(safety);
      finish();
    }
  }, [flyToTarget, map, setMapTransitioning, setScenario]);

  return null;
}

function MapEventHandler({
  onMove,
}: {
  onMove: (center: [number, number], zoom: number, bounds: L.LatLngBounds) => void;
}) {
  const map = useMap();
  const { layersLocked } = useApp();
  const layersLockedRef = useTransitioningRef(layersLocked);

  const publishView = useCallback(() => {
    if (layersLockedRef.current) return;
    const view = safeGetMapView(map);
    if (!view) return;
    const c = view.bounds.getCenter();
    onMove([c.lat, c.lng], view.zoom, view.bounds);
  }, [map, onMove, layersLockedRef]);

  useMapEvents({
    moveend() {
      publishView();
    },
    zoomend() {
      publishView();
    },
  });

  useEffect(() => {
    if (layersLocked) return;
    publishView();
  }, [layersLocked, publishView]);

  return null;
}

function CoordinateTracker() {
  const { setCoordinates } = useApp();
  useMapEvents({
    mousemove(e) {
      setCoordinates([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function ClimateProjectionLayer() {
  const map = useMap();
  const { scenario, customScenario, layers, layersLocked } = useApp();
  const layerRef = useRef<L.TileLayer.WMS | null>(null);
  const activeLayerRef = useRef<string | null>(null);
  const layersLockedRef = useTransitioningRef(layersLocked);
  const scenarioDef = resolveScenario(scenario, customScenario);
  const spiVisible = layers.find((l) => l.id === "spi")?.visible ?? false;
  const wmsLayerId = scenarioDef.wmsLayer;
  const active =
    !layersLocked &&
    !scenarioDef.useAafcSpi &&
    Boolean(wmsLayerId) &&
    spiVisible;

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (deferLayerMutation(layersLocked)) return;

      if (!active || !wmsLayerId) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        activeLayerRef.current = null;
        return;
      }

      if (
        layerRef.current &&
        map.hasLayer(layerRef.current) &&
        activeLayerRef.current === wmsLayerId
      ) {
        return;
      }

      safeMapCleanup(map);
      safeRemoveLayer(map, layerRef.current);
      layerRef.current = null;

      const wms = L.tileLayer.wms(GEOMET_CLIMATE_WMS, {
        layers: wmsLayerId,
        format: "image/png",
        transparent: true,
        version: "1.3.0",
        styles: "SPEI",
        opacity: 0.65,
        attribution: "ECCC GeoMet-Climate",
      });

      if (cancelled || abortLayerSync(map, layersLockedRef)) return;
      if (!safeAddToMap(map, wms)) return;
      layerRef.current = wms;
      activeLayerRef.current = wmsLayerId;
    }

    runLayerSync(sync);
    return () =>
      layerEffectCleanup(map, layerRef, layersLockedRef, () => {
        cancelled = true;
      });
  }, [map, active, wmsLayerId, layersLocked]);

  return null;
}

const esriLoad = import("esri-leaflet");

function AafcSpiLayer({
  visible,
  opacity,
}: {
  visible: boolean;
  opacity: number;
}) {
  const map = useMap();
  const { layersLocked } = useApp();
  const layerRef = useRef<L.Layer | null>(null);
  const layersLockedRef = useTransitioningRef(layersLocked);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (deferLayerMutation(layersLocked)) return;

      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled || abortLayerSync(map, layersLockedRef)) return;

      if (layerRef.current && map.hasLayer(layerRef.current)) {
        (layerRef.current as L.Layer & { setOpacity?: (o: number) => void }).setOpacity?.(
          opacity
        );
        return;
      }

      safeRemoveLayer(map, layerRef.current);
      const layer = esri.imageMapLayer({
        url: SPI_IMAGE_SERVER,
        opacity,
        attribution: "Agriculture and Agri-Food Canada",
        // esri-leaflet supports this at runtime; prevents blocking map pan/zoom
        interactive: false,
      } as Parameters<typeof esri.imageMapLayer>[0]);
      if (!safeAddToMap(map, layer)) return;
      layerRef.current = layer;
    }

    runLayerSync(sync);
    return () =>
      layerEffectCleanup(map, layerRef, layersLockedRef, () => {
        cancelled = true;
      });
  }, [map, visible, opacity, layersLocked]);

  return null;
}

function AafcSpeiLayer({
  visible,
  opacity,
}: {
  visible: boolean;
  opacity: number;
}) {
  const map = useMap();
  const { layersLocked } = useApp();
  const layerRef = useRef<L.Layer | null>(null);
  const layersLockedRef = useTransitioningRef(layersLocked);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (deferLayerMutation(layersLocked)) return;

      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled || abortLayerSync(map, layersLockedRef)) return;

      if (layerRef.current && map.hasLayer(layerRef.current)) {
        (layerRef.current as L.Layer & { setOpacity?: (o: number) => void }).setOpacity?.(
          opacity
        );
        return;
      }

      safeRemoveLayer(map, layerRef.current);
      const layer = esri.imageMapLayer({
        url: SPEI_IMAGE_SERVER,
        opacity,
        attribution: "Agriculture and Agri-Food Canada",
        interactive: false,
      } as Parameters<typeof esri.imageMapLayer>[0]);
      if (!safeAddToMap(map, layer)) return;
      layerRef.current = layer;
    }

    runLayerSync(sync);
    return () =>
      layerEffectCleanup(map, layerRef, layersLockedRef, () => {
        cancelled = true;
      });
  }, [map, visible, opacity, layersLocked]);

  return null;
}

function WatershedEsriLayer({
  visible,
  opacity,
}: {
  visible: boolean;
  opacity: number;
}) {
  const map = useMap();
  const layerRef = useRef<L.Layer | null>(null);
  const {
    locale,
    scenario,
    customScenario,
    compareMode,
    indexWeights,
    layersLocked,
    setSelectedWatershed,
    setInvestmentRisk,
    setCompareRisk,
    setRiskLocation,
  } = useApp();
  const layersLockedRef = useTransitioningRef(layersLocked);
  const localeRef = useRef(locale);
  const scenarioRef = useRef(scenario);
  const customScenarioRef = useRef(customScenario);
  const compareModeRef = useRef(compareMode);
  const indexWeightsRef = useRef(indexWeights);
  localeRef.current = locale;
  scenarioRef.current = scenario;
  customScenarioRef.current = customScenario;
  compareModeRef.current = compareMode;
  indexWeightsRef.current = indexWeights;

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (deferLayerMutation(layersLocked)) return;

      if (!visible) {
        safeMapCleanup(map);
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled || abortLayerSync(map, layersLockedRef)) return;

      if (layerRef.current && map.hasLayer(layerRef.current)) {
        const fl = layerRef.current as L.Layer & {
          setOpacity?: (o: number) => void;
          setStyle?: (s: L.PathOptions) => void;
        };
        fl.setOpacity?.(opacity);
        fl.setStyle?.({
          color: "#38bdf8",
          weight: 1.5,
          fillColor: "#0ea5e9",
          fillOpacity: opacity * 0.15,
        });
        return;
      }

      safeMapCleanup(map);
      safeRemoveLayer(map, layerRef.current);
      const watershed = esri.featureLayer({
        url: WATERSHED_LAYER_URL,
        style: () => ({
          color: "#38bdf8",
          weight: 1.5,
          fillColor: "#0ea5e9",
          fillOpacity: opacity * 0.15,
        }),
        opacity,
        onEachFeature: (feature, layer) => {
          const props = (feature.properties ?? {}) as WatershedProperties;
          const popupOpts = {
            maxWidth: 360,
            minWidth: 280,
            className: "watershed-popup",
            autoPanPaddingTopLeft: L.point(16, 80),
            autoPanPaddingBottomRight: L.point(16, 200),
          };

          layer.bindPopup(formatLoadingPopup(localeRef.current), popupOpts);

          layer.on("click", async (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            const loc = localeRef.current;
            const scen = scenarioRef.current;
            const custom = customScenarioRef.current;
            setSelectedWatershed(props);
            setRiskLocation([lat, lng]);
            layer.openPopup(e.latlng);

            try {
              const risk = await fetchInvestmentRisk(
                lat,
                lng,
                scen,
                loc,
                props,
                custom
              );
              if (cancelled || !map.hasLayer(layer)) return;
              setInvestmentRisk(risk);
              safeCloseLayerPopup(layer, map);

              if (compareModeRef.current && scen !== "current") {
                const current = await fetchInvestmentRisk(
                  lat,
                  lng,
                  "current",
                  loc,
                  props
                );
                if (!cancelled) setCompareRisk(current);
              } else {
                setCompareRisk(null);
              }
            } catch {
              safeCloseLayerPopup(layer, map);
            }
          });
        },
      });
      if (!safeAddToMap(map, watershed)) return;
      layerRef.current = watershed;
    }

    runLayerSync(sync);
    return () =>
      layerEffectCleanup(map, layerRef, layersLockedRef, () => {
        cancelled = true;
      });
  }, [
    map,
    visible,
    opacity,
    layersLocked,
    setSelectedWatershed,
    setInvestmentRisk,
    setCompareRisk,
    setRiskLocation,
  ]);

  return null;
}

function GreatLakesBasinLayer({
  visible,
  opacity,
}: {
  visible: boolean;
  opacity: number;
}) {
  const map = useMap();
  const { layersLocked, locale } = useApp();
  const layerRef = useRef<L.Layer | null>(null);
  const layersLockedRef = useTransitioningRef(layersLocked);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (deferLayerMutation(layersLocked)) return;

      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled || abortLayerSync(map, layersLockedRef)) return;

      safeRemoveLayer(map, layerRef.current);
      const basin = esri.featureLayer({
        url: GREAT_LAKES_BASIN_URL,
        style: () => ({
          color: "#f59e0b",
          weight: 2.5,
          fillColor: "#f59e0b",
          fillOpacity: opacity * 0.06,
        }),
        opacity,
        onEachFeature: (_feature, layer) => {
          const loc = localeRef.current;
          const title = loc === "fr" ? "Bassin des Grands Lacs" : "Great Lakes Basin";
          const hint =
            loc === "fr"
              ? "Cliquez sur un polygone SPI (HUC6) pour les détails de sécheresse."
              : "Click an SPI polygon (HUC6) for drought details.";
          layer.bindPopup(
            `<div style="font-family:system-ui,sans-serif;font-size:12px;min-width:200px">
              <strong>${title}</strong>
              <p style="color:#64748b;margin:6px 0 0;line-height:1.4">${hint}</p>
            </div>`
          );
        },
      });
      if (!safeAddToMap(map, basin)) return;
      layerRef.current = basin;
    }

    runLayerSync(sync);
    return () =>
      layerEffectCleanup(map, layerRef, layersLockedRef, () => {
        cancelled = true;
      });
  }, [map, visible, opacity, layersLocked]);

  return null;
}

function UsSpiLayer({
  visible,
  opacity,
}: {
  visible: boolean;
  opacity: number;
}) {
  const map = useMap();
  const { layersLocked, locale } = useApp();
  const layerRef = useRef<L.Layer | null>(null);
  const layersLockedRef = useTransitioningRef(layersLocked);
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (deferLayerMutation(layersLocked)) return;

      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled || abortLayerSync(map, layersLockedRef)) return;

      safeRemoveLayer(map, layerRef.current);
      const usSpi = esri.featureLayer({
        url: NOAA_SPI_HUC6_URL,
        style: (feature) => {
          const val = feature?.properties?.VALUE as number | undefined;
          const color = val != null ? spiValueToColor(val) : "#cbd5e1";
          return {
            fillColor: color,
            fillOpacity: opacity * 0.75,
            color: "#64748b",
            weight: 0.5,
          };
        },
        opacity,
        onEachFeature: (feature, layer) => {
          const p = feature.properties ?? {};
          const val = p.VALUE as number | undefined;
          const basin = p.BASIN ?? p.NAME ?? p.HUC6 ?? "—";
          const loc = localeRef.current;
          const label = val != null ? droughtLabel(val, loc) : "—";
          const popupHtml = `<div style="font-family:system-ui,sans-serif;min-width:180px">
                <strong style="font-size:13px">${basin}</strong>
                <div style="margin-top:6px;font-size:12px;color:#64748b">
                  SPI: <strong style="color:#1e293b">${val?.toFixed(2) ?? "—"}</strong>
                </div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px">${label}</div>
              </div>`;

          layer.bindPopup(popupHtml);
          layer.on("click", (e: L.LeafletMouseEvent) => {
            layer.openPopup(e.latlng);
          });
        },
      });
      if (!safeAddToMap(map, usSpi)) return;
      layerRef.current = usSpi;
    }

    runLayerSync(sync);
    return () =>
      layerEffectCleanup(map, layerRef, layersLockedRef, () => {
        cancelled = true;
      });
  }, [map, visible, opacity, layersLocked]);

  return null;
}

function RsesqStationsLayer({
  visible,
  opacity,
}: {
  visible: boolean;
  opacity: number;
}) {
  const map = useMap();
  const { layersLocked, setRsesqStation } = useApp();
  const layerRef = useRef<L.Layer | null>(null);
  const layersLockedRef = useTransitioningRef(layersLocked);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (deferLayerMutation(layersLocked)) return;

      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled || abortLayerSync(map, layersLockedRef)) return;

      safeRemoveLayer(map, layerRef.current);
      const stations = esri.featureLayer({
        url: RSESQ_LAYER_URL,
        pointToLayer: (_geojson, latlng) =>
          L.circleMarker(latlng, {
            radius: 6,
            fillColor: "#14b8a6",
            color: "#ffffff",
            weight: 1.5,
            fillOpacity: opacity,
          }),
        onEachFeature: (feature, layer) => {
          const attrs = feature.properties ?? {};
          const name = String(attrs.Name ?? "RSESQ");
          const popupInfo = String(attrs.PopupInfo ?? "");
          const stationId = parseRsesqStationId(popupInfo);

          layer.bindPopup(
            `<div style="font-family:system-ui,sans-serif;min-width:180px">
              <strong>${name}</strong>
              <div style="font-size:11px;color:#64748b;margin-top:4px">RSESQ · ${stationId ?? "—"}</div>
            </div>`
          );

          layer.on("click", () => {
            if (!stationId) return;
            const series = buildRsesqDemoSeries(stationId);
            setRsesqStation({ name, stationId, series });
          });
        },
      });
      if (!safeAddToMap(map, stations)) return;
      layerRef.current = stations;
    }

    runLayerSync(sync);
    return () =>
      layerEffectCleanup(map, layerRef, layersLockedRef, () => {
        cancelled = true;
      });
  }, [map, visible, opacity, layersLocked, setRsesqStation]);

  return null;
}

function LandUseLayer({
  visible,
  opacity,
}: {
  visible: boolean;
  opacity: number;
}) {
  const map = useMap();
  const { layersLocked } = useApp();
  const layerRef = useRef<L.Layer | null>(null);
  const layersLockedRef = useTransitioningRef(layersLocked);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (deferLayerMutation(layersLocked)) return;

      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled || abortLayerSync(map, layersLockedRef)) return;

      safeRemoveLayer(map, layerRef.current);
      const landUse = esri.featureLayer({
        url: LAND_USE_LAYER_URL,
        style: () => ({
          color: "#a855f7",
          weight: 0.5,
          fillColor: "#c084fc",
          fillOpacity: opacity * 0.35,
        }),
        opacity,
        onEachFeature: (feature, layer) => {
          const p = feature.properties ?? {};
          layer.bindPopup(
            `<div style="font-family:system-ui,sans-serif;font-size:12px">
              <strong>${p.classe_detaillee ?? p.DESC_CAT ?? "Land use"}</strong>
              <div style="color:#64748b;margin-top:4px">${p.DESC_RCL_A ?? ""}</div>
            </div>`
          );
        },
      });
      if (!safeAddToMap(map, landUse)) return;
      layerRef.current = landUse;
    }

    runLayerSync(sync);
    return () =>
      layerEffectCleanup(map, layerRef, layersLockedRef, () => {
        cancelled = true;
      });
  }, [map, visible, opacity, layersLocked]);

  return null;
}

function GtcSitesLayer({
  visible,
  opacity,
}: {
  visible: boolean;
  opacity: number;
}) {
  const map = useMap();
  const { layersLocked } = useApp();
  const layerRef = useRef<L.Layer | null>(null);
  const layersLockedRef = useTransitioningRef(layersLocked);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (deferLayerMutation(layersLocked)) return;

      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled || abortLayerSync(map, layersLockedRef)) return;

      safeRemoveLayer(map, layerRef.current);
      const gtc = esri.featureLayer({
        url: GTC_LAYER_URL,
        pointToLayer: (_geojson, latlng) =>
          L.circleMarker(latlng, {
            radius: 5,
            fillColor: "#ef4444",
            color: "#fff",
            weight: 1,
            fillOpacity: opacity,
          }),
        onEachFeature: (feature, layer) => {
          const p = feature.properties ?? {};
          layer.bindPopup(
            `<div style="font-family:system-ui,sans-serif;font-size:12px">
              <strong>GTC ${p.NO_MEF_LIEU ?? ""}</strong>
              <div style="color:#64748b;margin-top:4px">${p.DESC_MILIEU_RECEPT ?? ""}</div>
              <div style="font-size:11px;margin-top:2px">${p.NB_FICHES ?? 0} fiche(s)</div>
            </div>`
          );
        },
      });
      if (!safeAddToMap(map, gtc)) return;
      layerRef.current = gtc;
    }

    runLayerSync(sync);
    return () =>
      layerEffectCleanup(map, layerRef, layersLockedRef, () => {
        cancelled = true;
      });
  }, [map, visible, opacity, layersLocked]);

  return null;
}

function EsriLayers() {
  const { layers, scenario, customScenario, region } = useApp();
  const spiLayer = layers.find((l) => l.id === "spi");
  const speiLayer = layers.find((l) => l.id === "spei");
  const watershedLayer = layers.find((l) => l.id === "watersheds");
  const basinLayer = layers.find((l) => l.id === "great-lakes-basin");
  const usSpiLayer = layers.find((l) => l.id === "us-spi");
  const rsesqLayer = layers.find((l) => l.id === "rsesq-stations");
  const landUseLayer = layers.find((l) => l.id === "land-use");
  const gtcLayer = layers.find((l) => l.id === "gtc-sites");
  const scenarioDef = resolveScenario(scenario, customScenario);
  const showAafcSpi =
    region === "quebec" &&
    scenarioDef.useAafcSpi &&
    (spiLayer?.visible ?? false);

  return (
    <>
      <AafcSpiLayer visible={showAafcSpi} opacity={spiLayer?.opacity ?? 0.65} />
      <AafcSpeiLayer
        visible={region === "quebec" && (speiLayer?.visible ?? false)}
        opacity={speiLayer?.opacity ?? 0.65}
      />
      <LandUseLayer
        visible={region === "quebec" && (landUseLayer?.visible ?? false)}
        opacity={landUseLayer?.opacity ?? 0.45}
      />
      <WatershedEsriLayer
        visible={region === "quebec" && (watershedLayer?.visible ?? false)}
        opacity={watershedLayer?.opacity ?? 0.5}
      />
      <RsesqStationsLayer
        visible={region === "quebec" && (rsesqLayer?.visible ?? false)}
        opacity={rsesqLayer?.opacity ?? 1}
      />
      <GtcSitesLayer
        visible={region === "quebec" && (gtcLayer?.visible ?? false)}
        opacity={gtcLayer?.opacity ?? 1}
      />
      <GreatLakesBasinLayer
        visible={basinLayer?.visible ?? false}
        opacity={basinLayer?.opacity ?? 0.7}
      />
      <UsSpiLayer visible={usSpiLayer?.visible ?? false} opacity={usSpiLayer?.opacity ?? 0.55} />
    </>
  );
}

function SihWellsLayer() {
  const map = useMap();
  const {
    isLayerVisible,
    setWellCount,
    locale,
    setLegendMode,
    setSelectedWellScore,
    scenario,
    customScenario,
    layersLocked,
    region,
  } = useApp();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const featuresRef = useRef<WellFeature[]>([]);
  const loadingRef = useRef(false);
  const loadGenerationRef = useRef(0);
  const layersLockedRef = useTransitioningRef(layersLocked);
  const regionRef = useRef(region);
  const localeRef = useRef(locale);
  const scenarioRef = useRef(scenario);
  const customScenarioRef = useRef(customScenario);
  const sihVisibleRef = useRef(isLayerVisible("sih-wells"));
  regionRef.current = region;
  localeRef.current = locale;
  scenarioRef.current = scenario;
  customScenarioRef.current = customScenario;
  sihVisibleRef.current = isLayerVisible("sih-wells");

  const clearWells = useCallback(() => {
    if (!layerGroupRef.current && featuresRef.current.length === 0) return;

    if (!isMapUsable(map)) {
      layerGroupRef.current = null;
      featuresRef.current = [];
      return;
    }
    safeMapCleanup(map);
    safeRemoveLayer(map, layerGroupRef.current);
    layerGroupRef.current = null;
    featuresRef.current = [];
    setWellCount(0);
  }, [map, setWellCount]);

  useEffect(() => {
    bumpAsyncGeneration(loadGenerationRef);
    loadingRef.current = false;

    if (region !== "quebec" || !isLayerVisible("sih-wells")) {
      if (layerGroupRef.current && !deferLayerMutation(layersLocked)) {
        clearWells();
      }
    }
  }, [region, layersLocked, isLayerVisible, clearWells]);

  const loadWells = useCallback(
    async (bounds: L.LatLngBounds, zoom: number) => {
      const token = loadGenerationRef.current;

      const isStale = () =>
        isAsyncGenerationStale(loadGenerationRef, token) ||
        layersLockedRef.current ||
        regionRef.current !== "quebec" ||
        !sihVisibleRef.current ||
        !isMapUsable(map);

      if (regionRef.current !== "quebec" || !sihVisibleRef.current || zoom < SIH_MIN_ZOOM) {
        if (layerGroupRef.current && !deferLayerMutation(layersLockedRef.current)) {
          clearWells();
        }
        return;
      }

      if (layersLockedRef.current || loadingRef.current) return;

      loadingRef.current = true;

      try {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
        const features = await queryAllSihWellsInBbox(bbox);

        if (isStale()) return;

        featuresRef.current = features;
        setWellCount(features.length);

        safeMapCleanup(map);
        safeRemoveLayer(map, layerGroupRef.current);

        const group = L.layerGroup();
        for (const feature of features) {
          if (isStale()) return;

          const [lng, lat] = feature.geometry.coordinates;
          const props = feature.properties;
          const marker = L.circleMarker([lat, lng], {
            radius: 5,
            fillColor: "#2563eb",
            color: "#ffffff",
            weight: 1.5,
            fillOpacity: 0.85,
          });

          marker.on("click", async () => {
            const loc = localeRef.current;
            const scen = scenarioRef.current;
            const custom = customScenarioRef.current;
            setLegendMode("composite");
            marker
              .bindPopup(formatLoadingPopup(loc), {
                maxWidth: 320,
                className: "well-popup",
              })
              .openPopup();

            const score = await fetchDroughtScore(
              lat,
              lng,
              props.PROFOND_PUITS,
              props.DEBT_ESSAI_POMP,
              loc,
              scen,
              custom
            );

            if (!isMapUsable(map) || !map.hasLayer(marker)) return;
            setSelectedWellScore(score);
            safeSetPopupContent(marker, formatWellPopup(props, score, loc));
          });

          marker.on("popupclose", () => {
            setLegendMode("spi");
            setSelectedWellScore(null);
          });

          group.addLayer(marker);
        }

        if (isStale()) return;

        if (!safeAddToMap(map, group)) return;
        layerGroupRef.current = group;
      } catch (err) {
        if (!isAsyncGenerationStale(loadGenerationRef, token)) {
          console.error("Failed to load SIH wells:", err);
        }
      } finally {
        if (!isAsyncGenerationStale(loadGenerationRef, token)) {
          loadingRef.current = false;
        }
      }
    },
    [map, setWellCount, setLegendMode, setSelectedWellScore, clearWells, layersLockedRef]
  );

  useMapEvents({
    moveend() {
      if (
        layersLockedRef.current ||
        regionRef.current !== "quebec" ||
        !sihVisibleRef.current
      ) {
        return;
      }
      const view = safeGetMapView(map);
      if (!view) return;
      loadWells(view.bounds, view.zoom);
    },
    zoomend() {
      if (
        layersLockedRef.current ||
        regionRef.current !== "quebec" ||
        !sihVisibleRef.current
      ) {
        return;
      }
      const view = safeGetMapView(map);
      if (!view) return;
      loadWells(view.bounds, view.zoom);
    },
  });

  useEffect(() => {
    if (layersLockedRef.current) return;
    if (region !== "quebec" || !isLayerVisible("sih-wells")) return;
    const view = safeGetMapView(map);
    if (!view) return;
    loadWells(view.bounds, view.zoom);
    return () =>
      layerEffectCleanup(map, layerGroupRef, layersLockedRef, () => {});
  }, [map, loadWells, region, layersLocked, isLayerVisible]);

  useEffect(() => {
    (window as unknown as { __sihFeatures: WellFeature[] }).__sihFeatures =
      featuresRef.current;
  });

  return null;
}

function SihZoomGuard() {
  const map = useMap();
  const { layers, layersLocked } = useApp();
  const sihVisible = layers.find((l) => l.id === "sih-wells")?.visible ?? false;
  const prevVisible = useRef(sihVisible);

  useEffect(() => {
    if (layersLocked) return;
    if (sihVisible && !prevVisible.current && map.getZoom() < SIH_MIN_ZOOM) {
      map.setZoom(SIH_MIN_ZOOM);
    }
    prevVisible.current = sihVisible;
  }, [sihVisible, map, layersLocked]);

  return null;
}

function MapSearch() {
  const map = useMap();

  useEffect(() => {
    const input = document.getElementById("map-search") as HTMLInputElement | null;
    if (!input) return;

    const handler = async (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      const q = input.value.trim();
      if (!q) return;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=ca&limit=1`
        );
        const results = await res.json();
        if (results.length > 0) {
          const { lat, lon } = results[0];
          map.setView([parseFloat(lat), parseFloat(lon)], 12);
        }
      } catch {
        /* geocoding failed */
      }
    };

    input.addEventListener("keydown", handler);
    return () => input.removeEventListener("keydown", handler);
  }, [map]);

  return null;
}

function MapOverlayControls({ map }: { map: L.Map | null }) {
  if (!map) return null;

  return (
    <div className="absolute top-3 right-3 z-controls flex flex-col gap-1 pointer-events-auto rounded-xl bg-white/95 backdrop-blur-md p-1 shadow-panel border border-surface-border">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="w-8 h-8 rounded-lg flex items-center justify-center
                   hover:bg-surface-muted text-slate-700 text-lg font-light transition-colors"
        title="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="w-8 h-8 rounded-lg flex items-center justify-center
                   hover:bg-surface-muted text-slate-700 text-lg font-light transition-colors"
        title="Zoom out"
      >
        −
      </button>
      <div className="h-px bg-surface-border mx-1" />
      <button
        type="button"
        onClick={() => {
          map.locate({ setView: true, maxZoom: 14 });
        }}
        className="w-8 h-8 rounded-lg flex items-center justify-center
                   hover:bg-surface-muted text-slate-600 transition-colors"
        title="My location"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}

function ExportControlsOverlay() {
  const { locale, region } = useApp();
  if (region !== "quebec") return null;

  const handleExport = (format: "csv" | "geojson") => {
    const features =
      (window as unknown as { __sihFeatures?: WellFeature[] }).__sihFeatures ??
      [];
    if (features.length === 0) return;

    if (format === "csv") {
      downloadFile(wellsToCsv(features), "sih-wells.csv", "text/csv");
    } else {
      downloadFile(
        JSON.stringify({ type: "FeatureCollection", features }),
        "sih-wells.geojson",
        "application/geo+json"
      );
    }
  };

  return (
    <div className="absolute bottom-24 sm:bottom-14 left-2 sm:left-4 z-controls flex flex-col sm:flex-row gap-1.5 pointer-events-auto">
      <button
        type="button"
        onClick={() => handleExport("csv")}
        className="px-2.5 py-1.5 glass-panel text-caption text-slate-600 hover:text-slate-900 whitespace-nowrap font-medium transition-colors"
      >
        {t(locale, "exportCsv")}
      </button>
      <button
        type="button"
        onClick={() => handleExport("geojson")}
        className="px-2.5 py-1.5 glass-panel text-caption text-slate-600 hover:text-slate-900 whitespace-nowrap font-medium transition-colors"
      >
        {t(locale, "exportGeoJson")}
      </button>
    </div>
  );
}

function BaseLayers() {
  const map = useMap();
  const { isLayerVisible } = useApp();
  const showSatellite = isLayerVisible("satellite");
  const showTerrain = isLayerVisible("terrain");
  const baseRef = useRef<L.TileLayer | null>(null);
  const labelsRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    let cancelled = false;

    safeMapCleanup(map);
    safeRemoveLayer(map, baseRef.current);
    safeRemoveLayer(map, labelsRef.current);
    baseRef.current = null;
    labelsRef.current = null;

    let base: L.TileLayer;
    if (showSatellite) {
      base = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Esri, Maxar, Earthstar Geographics",
          maxZoom: MAX_ZOOM,
        }
      );
    } else if (showTerrain) {
      base = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: "OpenTopoMap",
        maxZoom: 17,
      });
    } else {
      base = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "OpenStreetMap, CARTO",
          maxZoom: MAX_ZOOM,
        }
      );
    }

    if (cancelled || !isMapUsable(map)) return;
    if (!safeAddToMap(map, base)) return;
    baseRef.current = base;

    if (showSatellite || showTerrain) {
      const labels = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
        { attribution: "", maxZoom: MAX_ZOOM, pane: "overlayPane" }
      );
      if (safeAddToMap(map, labels)) {
        labelsRef.current = labels;
      }
    }

    return () => {
      cancelled = true;
      safeRemoveLayer(map, baseRef.current);
      safeRemoveLayer(map, labelsRef.current);
      baseRef.current = null;
      labelsRef.current = null;
    };
  }, [map, showSatellite, showTerrain]);

  return null;
}

export function DroughtMap() {
  const { setMapView } = useApp();
  const [, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [leafletMap, setLeafletMap] = useState<L.Map | null>(null);
  const handleMapInstance = useCallback((map: L.Map | null) => {
    setLeafletMap(map);
  }, []);

  const handleMove = useCallback(
    (center: [number, number], zoom: number, bounds: L.LatLngBounds) => {
      setMapView({ center, zoom });
      setMapBounds(bounds);
    },
    [setMapView]
  );

  return (
    <div className="relative w-full h-full">
      <MapContainer
        key="drought-map"
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapInstanceRegistrar onMap={handleMapInstance} />
        <MapCleanupGuard />
        <MapRegionTransition />
        <BaseLayers />
        <EsriLayers />
        <ClimateProjectionLayer />
        <SihWellsLayer />
        <SihZoomGuard />
        <MapFlyTo />
        <MapSearch />
        <CoordinateTracker />
        <MapEventHandler onMove={handleMove} />
        <MapScaleControl />
      </MapContainer>
      <MapOverlayControls map={leafletMap} />
      <ExportControlsOverlay />
    </div>
  );
}
