import {
  DEFAULT_CUSTOM_SCENARIO,
  type CustomScenarioConfig,
} from "./scenarios";

const STORAGE_KEY = "drought-custom-scenario";

export function loadCustomScenario(): CustomScenarioConfig {
  if (typeof window === "undefined") return DEFAULT_CUSTOM_SCENARIO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CUSTOM_SCENARIO;
    const parsed = JSON.parse(raw) as CustomScenarioConfig;
    return { ...DEFAULT_CUSTOM_SCENARIO, ...parsed };
  } catch {
    return DEFAULT_CUSTOM_SCENARIO;
  }
}

export function persistCustomScenario(config: CustomScenarioConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
