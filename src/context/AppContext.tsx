"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Locale,
  LayerId,
  LayerState,
  WatershedProperties,
  MapRegion,
  IndexWeights,
  SavedArea,
  FlyToTarget,
} from "@/lib/types";
import type { DroughtScore } from "@/lib/drought-index";
import type { InvestmentRiskReport } from "@/lib/investment-risk";
import type { ClimateScenarioId, CustomScenarioConfig } from "@/lib/scenarios";
import { DEFAULT_CUSTOM_SCENARIO } from "@/lib/scenarios";
import { DEFAULT_INDEX_WEIGHTS, normalizeWeights, REGION_VIEWS } from "@/lib/index-weights";
import { loadSavedAreas, addSavedArea, removeSavedArea, createSavedArea } from "@/lib/saved-areas";
import {
  loadCustomScenario,
  persistCustomScenario,
} from "@/lib/custom-scenario-storage";

export type LegendMode = "spi" | "composite";

interface AppContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  layers: LayerState[];
  toggleLayer: (id: LayerId) => void;
  setLayerOpacity: (id: LayerId, opacity: number) => void;
  disclaimerAccepted: boolean;
  teamNoteReady: boolean;
  acceptDisclaimer: () => void;
  coordinates: [number, number] | null;
  setCoordinates: (coords: [number, number] | null) => void;
  wellCount: number;
  setWellCount: (count: number) => void;
  isLayerVisible: (id: LayerId) => boolean;
  getLayerOpacity: (id: LayerId) => number;
  legendMode: LegendMode;
  setLegendMode: (mode: LegendMode) => void;
  selectedWellScore: DroughtScore | null;
  setSelectedWellScore: (score: DroughtScore | null) => void;
  scenario: ClimateScenarioId;
  setScenario: (scenario: ClimateScenarioId) => void;
  customScenario: CustomScenarioConfig;
  setCustomScenario: (config: CustomScenarioConfig) => void;
  selectedWatershed: WatershedProperties | null;
  setSelectedWatershed: (ws: WatershedProperties | null) => void;
  investmentRisk: InvestmentRiskReport | null;
  setInvestmentRisk: (report: InvestmentRiskReport | null) => void;
  compareRisk: InvestmentRiskReport | null;
  setCompareRisk: (report: InvestmentRiskReport | null) => void;
  riskLocation: [number, number] | null;
  setRiskLocation: (loc: [number, number] | null) => void;
  compareMode: boolean;
  setCompareMode: (v: boolean) => void;
  region: MapRegion;
  setRegion: (region: MapRegion) => void;
  indexWeights: IndexWeights;
  setIndexWeights: (weights: IndexWeights) => void;
  resetIndexWeights: () => void;
  savedAreas: SavedArea[];
  saveCurrentArea: (name: string) => void;
  deleteSavedArea: (id: string) => void;
  flyToTarget: FlyToTarget | null;
  requestFlyTo: (center: [number, number], zoom: number) => void;
  mapTransitioning: boolean;
  setMapTransitioning: (v: boolean) => void;
  mapView: FlyToTarget | null;
  setMapView: (view: FlyToTarget | null) => void;
  applyRegionDefaults: (region: MapRegion) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const defaultLayers: LayerState[] = [
  { id: "spi", visible: true, opacity: 0.65 },
  { id: "spei", visible: false, opacity: 0.65 },
  { id: "sih-wells", visible: true, opacity: 1 },
  { id: "watersheds", visible: true, opacity: 0.5 },
  { id: "great-lakes-basin", visible: false, opacity: 0.7 },
  { id: "us-spi", visible: false, opacity: 0.55 },
  { id: "satellite", visible: true, opacity: 1 },
  { id: "terrain", visible: false, opacity: 1 },
];

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  const [layers, setLayers] = useState<LayerState[]>(defaultLayers);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [teamNoteReady, setTeamNoteReady] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [wellCount, setWellCount] = useState(0);
  const [legendMode, setLegendMode] = useState<LegendMode>("spi");
  const [selectedWellScore, setSelectedWellScore] = useState<DroughtScore | null>(null);
  const [scenario, setScenario] = useState<ClimateScenarioId>("current");
  const [customScenario, setCustomScenarioState] = useState<CustomScenarioConfig>(
    DEFAULT_CUSTOM_SCENARIO
  );
  const [selectedWatershed, setSelectedWatershed] = useState<WatershedProperties | null>(null);
  const [investmentRisk, setInvestmentRisk] = useState<InvestmentRiskReport | null>(null);
  const [compareRisk, setCompareRisk] = useState<InvestmentRiskReport | null>(null);
  const [riskLocation, setRiskLocation] = useState<[number, number] | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [region, setRegionState] = useState<MapRegion>("quebec");
  const [indexWeights, setIndexWeightsState] = useState<IndexWeights>(DEFAULT_INDEX_WEIGHTS);
  const [savedAreas, setSavedAreas] = useState<SavedArea[]>([]);
  const [flyToTarget, setFlyToTarget] = useState<FlyToTarget | null>(null);
  const [mapTransitioning, setMapTransitioning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapView, setMapViewState] = useState<FlyToTarget | null>(null);

  useEffect(() => {
    localStorage.removeItem("drought-team-note-seen");
    localStorage.removeItem("drought-disclaimer-accepted");
    if (sessionStorage.getItem("drought-team-note-seen") === "true") {
      setDisclaimerAccepted(true);
    }
    setTeamNoteReady(true);

    if (window.matchMedia("(max-width: 767px)").matches) {
      setSidebarOpen(false);
    }

    const savedLocale = localStorage.getItem("drought-locale") as Locale | null;
    if (savedLocale === "en" || savedLocale === "fr") setLocaleState(savedLocale);
    const savedRegion = localStorage.getItem("drought-region") as MapRegion | null;
    if (savedRegion === "quebec" || savedRegion === "great-lakes") setRegionState(savedRegion);
    const savedWeights = localStorage.getItem("drought-index-weights");
    if (savedWeights) {
      try {
        setIndexWeightsState(normalizeWeights(JSON.parse(savedWeights)));
      } catch {
        /* ignore */
      }
    }
    setSavedAreas(loadSavedAreas());
    setCustomScenarioState(loadCustomScenario());
  }, []);

  const setMapView = useCallback((view: FlyToTarget | null) => {
    setMapViewState((prev) => {
      if (!view) return null;
      if (
        prev &&
        prev.zoom === view.zoom &&
        prev.center[0] === view.center[0] &&
        prev.center[1] === view.center[1]
      ) {
        return prev;
      }
      return view;
    });
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("drought-locale", l);
  }, []);

  const setRegion = useCallback((r: MapRegion) => {
    setRegionState(r);
    localStorage.setItem("drought-region", r);
  }, []);

  const setCustomScenario = useCallback((config: CustomScenarioConfig) => {
    setCustomScenarioState(config);
    persistCustomScenario(config);
  }, []);

  const setIndexWeights = useCallback((weights: IndexWeights) => {
    const normalized = normalizeWeights(weights);
    setIndexWeightsState(normalized);
    localStorage.setItem("drought-index-weights", JSON.stringify(normalized));
  }, []);

  const resetIndexWeights = useCallback(() => {
    setIndexWeights(DEFAULT_INDEX_WEIGHTS);
  }, [setIndexWeights]);

  const requestFlyTo = useCallback((center: [number, number], zoom: number) => {
    setFlyToTarget({ center, zoom, id: Date.now() });
  }, []);

  const acceptDisclaimer = useCallback(() => {
    setDisclaimerAccepted(true);
    sessionStorage.setItem("drought-team-note-seen", "true");
  }, []);

  const saveCurrentArea = useCallback(
    (name: string) => {
      if (!mapView) return;
      const area = createSavedArea(name, mapView.center, mapView.zoom, region);
      const updated = addSavedArea(area);
      setSavedAreas(updated);
    },
    [mapView, region]
  );

  const deleteSavedArea = useCallback((id: string) => {
    const updated = removeSavedArea(id);
    setSavedAreas(updated);
  }, []);

  const applyRegionDefaults = useCallback((r: MapRegion) => {
    setMapTransitioning(true);
    setRegion(r);
    setLayers((prev) =>
      prev.map((l) => {
        if (r === "great-lakes") {
          if (l.id === "great-lakes-basin") return { ...l, visible: true };
          if (l.id === "us-spi") return { ...l, visible: true };
          if (l.id === "sih-wells") return { ...l, visible: false };
          if (l.id === "watersheds") return { ...l, visible: false };
        } else {
          if (l.id === "great-lakes-basin") return { ...l, visible: false };
          if (l.id === "us-spi") return { ...l, visible: false };
          if (l.id === "sih-wells") return { ...l, visible: true };
          if (l.id === "watersheds") return { ...l, visible: true };
        }
        return l;
      })
    );
    const view = REGION_VIEWS[r];
    window.setTimeout(() => {
      setFlyToTarget({ center: view.center, zoom: view.zoom, id: Date.now() });
    }, 250);
  }, [setRegion]);

  const toggleLayer = useCallback((id: LayerId) => {
    setLayers((prev) => {
      const toggled = prev.map((l) => {
        if (l.id !== id) return l;
        return { ...l, visible: !l.visible };
      });
      if (id === "satellite" || id === "terrain") {
        const target = toggled.find((l) => l.id === id);
        if (target?.visible) {
          return toggled.map((l) => {
            if (id === "satellite" && l.id === "terrain")
              return { ...l, visible: false };
            if (id === "terrain" && l.id === "satellite")
              return { ...l, visible: false };
            return l;
          });
        }
      }
      return toggled;
    });
  }, []);

  const setLayerOpacity = useCallback((id: LayerId, opacity: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, opacity } : l))
    );
  }, []);

  const isLayerVisible = useCallback(
    (id: LayerId) => layers.find((l) => l.id === id)?.visible ?? false,
    [layers]
  );

  const getLayerOpacity = useCallback(
    (id: LayerId) => layers.find((l) => l.id === id)?.opacity ?? 1,
    [layers]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      layers,
      toggleLayer,
      setLayerOpacity,
      disclaimerAccepted,
      teamNoteReady,
      acceptDisclaimer,
      coordinates,
      setCoordinates,
      wellCount,
      setWellCount,
      isLayerVisible,
      getLayerOpacity,
      legendMode,
      setLegendMode,
      selectedWellScore,
      setSelectedWellScore,
      scenario,
      setScenario,
      customScenario,
      setCustomScenario,
      selectedWatershed,
      setSelectedWatershed,
      investmentRisk,
      setInvestmentRisk,
      compareRisk,
      setCompareRisk,
      riskLocation,
      setRiskLocation,
      compareMode,
      setCompareMode,
      region,
      setRegion,
      indexWeights,
      setIndexWeights,
      resetIndexWeights,
      savedAreas,
      saveCurrentArea,
      deleteSavedArea,
      flyToTarget,
      requestFlyTo,
      mapTransitioning,
      setMapTransitioning,
      mapView,
      setMapView,
      applyRegionDefaults,
      sidebarOpen,
      setSidebarOpen,
    }),
    [
      locale,
      setLocale,
      layers,
      toggleLayer,
      setLayerOpacity,
      disclaimerAccepted,
      teamNoteReady,
      acceptDisclaimer,
      coordinates,
      wellCount,
      isLayerVisible,
      getLayerOpacity,
      legendMode,
      selectedWellScore,
      scenario,
      customScenario,
      setCustomScenario,
      selectedWatershed,
      investmentRisk,
      compareRisk,
      riskLocation,
      compareMode,
      region,
      setRegion,
      indexWeights,
      setIndexWeights,
      resetIndexWeights,
      savedAreas,
      saveCurrentArea,
      deleteSavedArea,
      flyToTarget,
      requestFlyTo,
      mapTransitioning,
      mapView,
      setMapView,
      applyRegionDefaults,
      sidebarOpen,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
