import type { SavedArea, MapRegion } from "./types";

const STORAGE_KEY = "drought-saved-areas";

export function loadSavedAreas(): SavedArea[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedArea[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedAreas(areas: SavedArea[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(areas));
}

export function createSavedArea(
  name: string,
  center: [number, number],
  zoom: number,
  region: MapRegion
): SavedArea {
  return {
    id: crypto.randomUUID(),
    name,
    center,
    zoom,
    region,
    createdAt: new Date().toISOString(),
  };
}

export function addSavedArea(area: SavedArea): SavedArea[] {
  const areas = loadSavedAreas();
  const updated = [area, ...areas].slice(0, 20);
  persistSavedAreas(updated);
  return updated;
}

export function removeSavedArea(id: string): SavedArea[] {
  const updated = loadSavedAreas().filter((a) => a.id !== id);
  persistSavedAreas(updated);
  return updated;
}
