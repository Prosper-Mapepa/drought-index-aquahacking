import L from "leaflet";
import { useRef, type MutableRefObject } from "react";

/** Close any open popup and stop animations before DOM teardown */
export function safeMapCleanup(map: L.Map | null | undefined) {
  if (!map) return;
  try {
    map.closePopup();
    map.stop();
  } catch {
    /* map may already be destroyed */
  }
}

/** True when the Leaflet map container and overlay pane are attached and usable */
export function isMapUsable(map: L.Map | null | undefined): map is L.Map {
  if (!map) return false;
  try {
    const container = map.getContainer();
    if (!container?.isConnected) return false;
    const panes = (map as L.Map & { _panes?: Record<string, HTMLElement> })._panes;
    return Boolean(panes?.overlayPane?.parentNode);
  } catch {
    return false;
  }
}

/** Add a layer only when the map DOM is in a valid state */
export function safeAddToMap(map: L.Map, layer: L.Layer): boolean {
  if (!isMapUsable(map)) return false;
  try {
    layer.addTo(map);
    return true;
  } catch {
    return false;
  }
}

/** Keep ref in sync so effect cleanups see the latest transition flag */
export function useTransitioningRef(mapTransitioning: boolean) {
  const ref = useRef(mapTransitioning);
  ref.current = mapTransitioning;
  return ref;
}

/** Skip layer add/remove during region fly — avoids Leaflet/React removeChild races */
export function deferLayerMutation(mapTransitioning: boolean): boolean {
  return mapTransitioning;
}

export function safeRemoveLayer(map: L.Map, layer?: L.Layer | null) {
  if (!layer || !isMapUsable(map)) return;
  try {
    const withPopup = layer as L.Layer & {
      getPopup?: () => L.Popup | undefined;
      closePopup?: () => void;
      isPopupOpen?: () => boolean;
    };

    if (withPopup.isPopupOpen?.() || withPopup.getPopup?.()?.isOpen()) {
      safeMapCleanup(map);
    } else {
      withPopup.closePopup?.();
    }

    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  } catch {
    /* layer or map may be tearing down during region switch / HMR */
  }
}

export function safeSetPopupContent(
  layer: L.Layer,
  content: string | HTMLElement
): boolean {
  try {
    const withPopup = layer as L.Layer & {
      getPopup?: () => L.Popup | undefined;
      setPopupContent?: (c: string | HTMLElement) => L.Layer;
      isPopupOpen?: () => boolean;
    };
    if (!withPopup.getPopup?.()) return false;
    withPopup.setPopupContent?.(content);
    return true;
  } catch {
    return false;
  }
}

export function safeCloseLayerPopup(layer: L.Layer, map?: L.Map) {
  try {
    const withPopup = layer as L.Layer & {
      isPopupOpen?: () => boolean;
      closePopup?: () => void;
    };
    if (withPopup.isPopupOpen?.()) {
      withPopup.closePopup?.();
    } else if (map) {
      safeMapCleanup(map);
    }
  } catch {
    /* ignore */
  }
}

/** Invalidate in-flight async layer work (e.g. after region switch) */
export function bumpAsyncGeneration(ref: MutableRefObject<number>): number {
  ref.current += 1;
  return ref.current;
}

export function isAsyncGenerationStale(
  ref: MutableRefObject<number>,
  token: number
): boolean {
  return token !== ref.current;
}
