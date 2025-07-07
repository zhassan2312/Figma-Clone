import { shallow, useSelf, useStorage } from "@liveblocks/react";
import { Layer, XYWH, LayerType } from "@/types";

function boundingBox(layers: Layer[]): XYWH | null {
  const first = layers[0];
  if (!first) return null;

  // Helper function to get bounds for any layer type
  const getLayerBounds = (layer: Layer) => {
    if (layer.type === LayerType.Line || layer.type === LayerType.Arrow) {
      const lineLayer = layer as any;
      return {
        left: Math.min(lineLayer.x, lineLayer.x2),
        right: Math.max(lineLayer.x, lineLayer.x2),
        top: Math.min(lineLayer.y, lineLayer.y2),
        bottom: Math.max(lineLayer.y, lineLayer.y2),
      };
    } else {
      const rectLayer = layer as any;
      return {
        left: rectLayer.x,
        right: rectLayer.x + (rectLayer.width || 0),
        top: rectLayer.y,
        bottom: rectLayer.y + (rectLayer.height || 0),
      };
    }
  };

  const firstBounds = getLayerBounds(first);
  let left = firstBounds.left;
  let right = firstBounds.right;
  let top = firstBounds.top;
  let bottom = firstBounds.bottom;

  for (let i = 1; i < layers.length; i++) {
    const layer = layers[i]!;
    const bounds = getLayerBounds(layer);
    
    if (left > bounds.left) {
      left = bounds.left;
    }
    if (right < bounds.right) {
      right = bounds.right;
    }
    if (top > bounds.top) {
      top = bounds.top;
    }
    if (bottom < bounds.bottom) {
      bottom = bounds.bottom;
    }
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}

export default function useSelectionBounds() {
  const selection = useSelf((me) => me.presence.selection);
  return useStorage((root) => {
    const seletedLayers = selection
      ?.map((layerId) => root.layers.get(layerId)!)
      .filter(Boolean);

    return boundingBox(seletedLayers ?? []);
  }, shallow);
}