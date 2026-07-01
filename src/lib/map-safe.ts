import L from "leaflet";

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

export function safeRemoveLayer(map: L.Map, layer?: L.Layer | null) {
  if (!layer) return;
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
