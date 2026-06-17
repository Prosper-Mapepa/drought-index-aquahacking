"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  useMap,
  useMapEvents,
  ScaleControl,
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
  spiValueToColor,
  droughtLabel,
} from "@/lib/constants";
import { GEOMET_CLIMATE_WMS, getScenario } from "@/lib/scenarios";
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

function safeRemoveLayer(map: L.Map, layer?: L.Layer | null) {
  if (layer && map.hasLayer(layer)) {
    map.removeLayer(layer);
  }
}

function MapPortal({ children }: { children: React.ReactNode }) {
  const map = useMap();
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRoot(map.getContainer().parentElement);
  }, [map]);

  if (!root) return null;
  return createPortal(children, root);
}

function MapFlyTo() {
  const map = useMap();
  const { flyToTarget, setMapTransitioning } = useApp();
  const lastIdRef = useRef(0);

  useEffect(() => {
    if (!flyToTarget?.id || flyToTarget.id === lastIdRef.current) return;
    lastIdRef.current = flyToTarget.id;

    map.stop();
    map.once("moveend", () => setMapTransitioning(false));
    map.flyTo(flyToTarget.center, flyToTarget.zoom, { duration: 1.0 });
  }, [flyToTarget, map, setMapTransitioning]);

  return null;
}

function MapEventHandler({
  onMove,
}: {
  onMove: (center: [number, number], zoom: number, bounds: L.LatLngBounds) => void;
}) {
  const map = useMap();

  useMapEvents({
    moveend() {
      const c = map.getCenter();
      onMove([c.lat, c.lng], map.getZoom(), map.getBounds());
    },
    zoomend() {
      const c = map.getCenter();
      onMove([c.lat, c.lng], map.getZoom(), map.getBounds());
    },
  });

  useEffect(() => {
    const c = map.getCenter();
    onMove([c.lat, c.lng], map.getZoom(), map.getBounds());
  }, [map, onMove]);

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
  const { scenario, layers } = useApp();
  const scenarioDef = getScenario(scenario);
  const spiVisible = layers.find((l) => l.id === "spi")?.visible ?? false;

  if (scenarioDef.useAafcSpi || !scenarioDef.wmsLayer || !spiVisible) return null;

  return (
    <WMSTileLayer
      key={scenarioDef.wmsLayer}
      url={GEOMET_CLIMATE_WMS}
      layers={scenarioDef.wmsLayer}
      format="image/png"
      transparent
      version="1.3.0"
      styles="SPEI"
      opacity={0.65}
      attribution="ECCC GeoMet-Climate"
    />
  );
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
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled) return;

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
      });
      layer.addTo(map);
      layerRef.current = layer;
    }

    sync();
    return () => {
      cancelled = true;
      safeRemoveLayer(map, layerRef.current);
      layerRef.current = null;
    };
  }, [map, visible, opacity]);

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
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled) return;

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
      });
      layer.addTo(map);
      layerRef.current = layer;
    }

    sync();
    return () => {
      cancelled = true;
      safeRemoveLayer(map, layerRef.current);
      layerRef.current = null;
    };
  }, [map, visible, opacity]);

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
    compareMode,
    indexWeights,
    setSelectedWatershed,
    setInvestmentRisk,
    setCompareRisk,
    setRiskLocation,
  } = useApp();
  const localeRef = useRef(locale);
  const scenarioRef = useRef(scenario);
  const compareModeRef = useRef(compareMode);
  const indexWeightsRef = useRef(indexWeights);
  localeRef.current = locale;
  scenarioRef.current = scenario;
  compareModeRef.current = compareMode;
  indexWeightsRef.current = indexWeights;

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled) return;

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
            maxWidth: 420,
            minWidth: 360,
            className: "watershed-popup",
            autoPanPaddingTopLeft: L.point(20, 20),
            autoPanPaddingBottomRight: L.point(24, 24),
          };

          layer.bindPopup(formatLoadingPopup(localeRef.current), popupOpts);

          layer.on("click", async (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            const loc = localeRef.current;
            const scen = scenarioRef.current;
            const weights = indexWeightsRef.current;
            setSelectedWatershed(props);
            setRiskLocation([lat, lng]);
            layer.openPopup(e.latlng);

            const risk = await fetchInvestmentRisk(lat, lng, scen, loc, props, weights);
            setInvestmentRisk(risk);
            layer.setPopupContent(formatWatershedPopup(props, loc, risk));

            if (compareModeRef.current && scen !== "current") {
              const current = await fetchInvestmentRisk(
                lat,
                lng,
                "current",
                loc,
                props,
                weights
              );
              setCompareRisk(current);
            } else {
              setCompareRisk(null);
            }
          });
        },
      });
      watershed.addTo(map);
      layerRef.current = watershed;
    }

    sync();
    return () => {
      cancelled = true;
      safeRemoveLayer(map, layerRef.current);
      layerRef.current = null;
    };
  }, [
    map,
    visible,
    opacity,
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
  const layerRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled) return;

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
      });
      basin.addTo(map);
      layerRef.current = basin;
    }

    sync();
    return () => {
      cancelled = true;
      safeRemoveLayer(map, layerRef.current);
      layerRef.current = null;
    };
  }, [map, visible, opacity]);

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
  const layerRef = useRef<L.Layer | null>(null);
  const { locale } = useApp();
  const localeRef = useRef(locale);
  localeRef.current = locale;

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (!visible) {
        safeRemoveLayer(map, layerRef.current);
        layerRef.current = null;
        return;
      }

      const esri = await esriLoad;
      if (cancelled) return;

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
          layer.on("click", () => {
            const p = feature.properties ?? {};
            const val = p.VALUE as number | undefined;
            const basin = p.BASIN ?? p.NAME ?? "—";
            const loc = localeRef.current;
            const label = val != null ? droughtLabel(val, loc) : "—";
            layer.setPopupContent(
              `<div style="font-family:system-ui,sans-serif;min-width:180px">
                <strong style="font-size:13px">${basin}</strong>
                <div style="margin-top:6px;font-size:12px;color:#64748b">
                  SPI: <strong style="color:#1e293b">${val?.toFixed(2) ?? "—"}</strong>
                </div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px">${label}</div>
              </div>`
            );
          });
        },
      });
      usSpi.addTo(map);
      layerRef.current = usSpi;
    }

    sync();
    return () => {
      cancelled = true;
      safeRemoveLayer(map, layerRef.current);
      layerRef.current = null;
    };
  }, [map, visible, opacity]);

  return null;
}

function EsriLayers() {
  const { layers, scenario } = useApp();
  const spiLayer = layers.find((l) => l.id === "spi");
  const speiLayer = layers.find((l) => l.id === "spei");
  const watershedLayer = layers.find((l) => l.id === "watersheds");
  const basinLayer = layers.find((l) => l.id === "great-lakes-basin");
  const usSpiLayer = layers.find((l) => l.id === "us-spi");
  const scenarioDef = getScenario(scenario);
  const showAafcSpi = scenarioDef.useAafcSpi && (spiLayer?.visible ?? false);

  return (
    <>
      <AafcSpiLayer visible={showAafcSpi} opacity={spiLayer?.opacity ?? 0.65} />
      <AafcSpeiLayer
        visible={speiLayer?.visible ?? false}
        opacity={speiLayer?.opacity ?? 0.65}
      />
      <WatershedEsriLayer
        visible={watershedLayer?.visible ?? false}
        opacity={watershedLayer?.opacity ?? 0.5}
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
  const { isLayerVisible, setWellCount, locale, setLegendMode, setSelectedWellScore, scenario, indexWeights, mapTransitioning } =
    useApp();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const featuresRef = useRef<WellFeature[]>([]);
  const loadingRef = useRef(false);
  const localeRef = useRef(locale);
  const scenarioRef = useRef(scenario);
  const indexWeightsRef = useRef(indexWeights);
  localeRef.current = locale;
  scenarioRef.current = scenario;
  indexWeightsRef.current = indexWeights;

  const loadWells = useCallback(
    async (bounds: L.LatLngBounds, zoom: number) => {
      if (!isLayerVisible("sih-wells") || zoom < SIH_MIN_ZOOM) {
        safeRemoveLayer(map, layerGroupRef.current);
        layerGroupRef.current = null;
        setWellCount(0);
        featuresRef.current = [];
        return;
      }

      if (loadingRef.current) return;
      loadingRef.current = true;

      try {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const bbox = `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`;
        const features = await queryAllSihWellsInBbox(bbox);
        featuresRef.current = features;
        setWellCount(features.length);

        safeRemoveLayer(map, layerGroupRef.current);

        const group = L.layerGroup();
        for (const feature of features) {
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
            const weights = indexWeightsRef.current;
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
              weights
            );

            setSelectedWellScore(score);
            marker.setPopupContent(formatWellPopup(props, score, loc));
          });

          marker.on("popupclose", () => {
            setLegendMode("spi");
            setSelectedWellScore(null);
          });

          group.addLayer(marker);
        }
        group.addTo(map);
        layerGroupRef.current = group;
      } catch (err) {
        console.error("Failed to load SIH wells:", err);
      } finally {
        loadingRef.current = false;
      }
    },
    [map, isLayerVisible, setWellCount, setLegendMode, setSelectedWellScore]
  );

  useMapEvents({
    moveend() {
      if (mapTransitioning) return;
      loadWells(map.getBounds(), map.getZoom());
    },
    zoomend() {
      loadWells(map.getBounds(), map.getZoom());
    },
  });

  useEffect(() => {
    loadWells(map.getBounds(), map.getZoom());
    return () => {
      safeRemoveLayer(map, layerGroupRef.current);
      layerGroupRef.current = null;
    };
  }, [map, loadWells, isLayerVisible]);

  useEffect(() => {
    (window as unknown as { __sihFeatures: WellFeature[] }).__sihFeatures =
      featuresRef.current;
  });

  return null;
}

function SihZoomGuard() {
  const map = useMap();
  const { layers } = useApp();
  const sihVisible = layers.find((l) => l.id === "sih-wells")?.visible ?? false;
  const prevVisible = useRef(sihVisible);

  useEffect(() => {
    if (sihVisible && !prevVisible.current && map.getZoom() < SIH_MIN_ZOOM) {
      map.setZoom(SIH_MIN_ZOOM);
    }
    prevVisible.current = sihVisible;
  }, [sihVisible, map]);

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

function MapControls() {
  const map = useMap();

  return (
    <MapPortal>
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
      <button
        onClick={() => map.zoomIn()}
        className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center 
                   hover:bg-slate-50 text-slate-700 text-lg font-light"
        title="Zoom in"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center 
                   hover:bg-slate-50 text-slate-700 text-lg font-light"
        title="Zoom out"
      >
        −
      </button>
      <button
        onClick={() => {
          map.locate({ setView: true, maxZoom: 14 });
        }}
        className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center 
                   hover:bg-slate-50 text-slate-600"
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
    </MapPortal>
  );
}

function ExportControls() {
  const { locale } = useApp();

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
    <MapPortal>
      <div className="absolute bottom-24 sm:bottom-14 left-2 sm:left-14 z-[1000] flex flex-col sm:flex-row gap-1 sm:gap-1.5 pointer-events-auto">
      <button
        onClick={() => handleExport("csv")}
        className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white/95 backdrop-blur rounded-md shadow-md text-[10px] sm:text-[11px] 
                   text-slate-600 hover:bg-white whitespace-nowrap font-medium"
      >
        {t(locale, "exportCsv")}
      </button>
      <button
        onClick={() => handleExport("geojson")}
        className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white/95 backdrop-blur rounded-md shadow-md text-[10px] sm:text-[11px] 
                   text-slate-600 hover:bg-white whitespace-nowrap font-medium"
      >
        {t(locale, "exportGeoJson")}
      </button>
      </div>
    </MapPortal>
  );
}

function BaseLayers() {
  const { isLayerVisible } = useApp();
  const showSatellite = isLayerVisible("satellite");
  const showTerrain = isLayerVisible("terrain");

  return (
    <>
      {showSatellite && (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Esri, Maxar, Earthstar Geographics"
          maxZoom={MAX_ZOOM}
        />
      )}
      {showTerrain && !showSatellite && (
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution="OpenTopoMap"
          maxZoom={17}
        />
      )}
      {!showSatellite && !showTerrain && (
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="OpenStreetMap, CARTO"
          maxZoom={MAX_ZOOM}
        />
      )}
      {(showSatellite || showTerrain) && (
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
          attribution=""
          maxZoom={MAX_ZOOM}
          pane="overlayPane"
        />
      )}
    </>
  );
}

export function DroughtMap() {
  const { setMapView } = useApp();
  const [, setMapBounds] = useState<L.LatLngBounds | null>(null);

  const handleMove = useCallback(
    (center: [number, number], zoom: number, bounds: L.LatLngBounds) => {
      setMapView({ center, zoom });
      setMapBounds(bounds);
    },
    [setMapView]
  );

  return (
    <MapContainer
      key="drought-map"
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      className="w-full h-full"
      zoomControl={false}
      preferCanvas
    >
      <BaseLayers />
      <EsriLayers />
      <ClimateProjectionLayer />
      <SihWellsLayer />
      <SihZoomGuard />
      <MapFlyTo />
      <MapSearch />
      <MapControls />
      <ExportControls />
      <CoordinateTracker />
      <MapEventHandler onMove={handleMove} />
      <ScaleControl position="bottomleft" imperial metric />
    </MapContainer>
  );
}
