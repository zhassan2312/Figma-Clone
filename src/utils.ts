import {
  Camera,
  Color,
  Layer,
  LayerType,
  PathLayer,
  Point,
  Side,
  XYWH,
  Fill,
  Stroke,
} from "./types";

export function colorToCss(color: Color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

export function hexToRgb(hex: string): Color {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// Utility functions for fills and strokes
export function createDefaultFill(color: Color = { r: 217, g: 217, b: 217 }): Fill {
  return {
    id: crypto.randomUUID(),
    type: 'solid',
    color,
    opacity: 100,
    visible: true,
  };
}

export function createDefaultStroke(color: Color = { r: 217, g: 217, b: 217 }): Stroke {
  return {
    id: crypto.randomUUID(),
    color,
    width: 1,
    opacity: 100,
    visible: true,
    position: 'center',
  };
}

export function getVisibleFills(fills: Fill[]): Fill[] {
  if (!fills || !Array.isArray(fills)) return [];
  return fills.filter(fill => fill.visible);
}

export function getVisibleStrokes(strokes: Stroke[]): Stroke[] {
  if (!strokes || !Array.isArray(strokes)) return [];
  return strokes.filter(stroke => stroke.visible);
}

export function calculateFillStyle(fills: Fill[]): string {
  if (!fills || !Array.isArray(fills)) return 'transparent';
  const visibleFills = getVisibleFills(fills);
  if (visibleFills.length === 0) return 'transparent';
  
  if (visibleFills.length === 1) {
    // Single fill - simple case
    const fill = visibleFills[0];
    const color = fill.color;
    const alpha = fill.opacity / 100;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
  }
  
  // Multiple fills - blend colors from bottom to top
  // Start with the bottom fill and blend upwards
  let result = { r: 255, g: 255, b: 255, a: 0 }; // Start with transparent white
  
  // Process fills from bottom to top (reverse order)
  for (let i = visibleFills.length - 1; i >= 0; i--) {
    const fill = visibleFills[i];
    const color = fill.color;
    const alpha = fill.opacity / 100;
    
    // Alpha blending formula: result = source * alpha + destination * (1 - alpha)
    const srcAlpha = alpha;
    const dstAlpha = result.a;
    const outAlpha = srcAlpha + dstAlpha * (1 - srcAlpha);
    
    if (outAlpha > 0) {
      result.r = (color.r * srcAlpha + result.r * dstAlpha * (1 - srcAlpha)) / outAlpha;
      result.g = (color.g * srcAlpha + result.g * dstAlpha * (1 - srcAlpha)) / outAlpha;
      result.b = (color.b * srcAlpha + result.b * dstAlpha * (1 - srcAlpha)) / outAlpha;
      result.a = outAlpha;
    }
  }
  
  return `rgba(${Math.round(result.r)}, ${Math.round(result.g)}, ${Math.round(result.b)}, ${result.a})`;
}

export function calculateStrokeStyle(strokes: Stroke[]): { stroke: string; strokeWidth: number; strokeDasharray?: string } {
  if (!strokes || !Array.isArray(strokes)) {
    return { stroke: 'none', strokeWidth: 0 };
  }
  const visibleStrokes = getVisibleStrokes(strokes);
  if (visibleStrokes.length === 0) {
    return { stroke: 'none', strokeWidth: 0 };
  }
  
  if (visibleStrokes.length === 1) {
    // Single stroke - simple case
    const stroke = visibleStrokes[0];
    const color = stroke.color;
    const alpha = stroke.opacity / 100;
    
    return {
      stroke: `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`,
      strokeWidth: stroke.width,
      strokeDasharray: stroke.dashPattern?.join(' '),
    };
  }
  
  // Multiple strokes - blend colors and use the maximum width
  // Similar to fill blending but for strokes
  let result = { r: 255, g: 255, b: 255, a: 0 }; // Start with transparent white
  let maxWidth = 0;
  let dashPattern: string | undefined;
  
  // Process strokes from bottom to top (reverse order)
  for (let i = visibleStrokes.length - 1; i >= 0; i--) {
    const stroke = visibleStrokes[i];
    const color = stroke.color;
    const alpha = stroke.opacity / 100;
    maxWidth = Math.max(maxWidth, stroke.width);
    
    // Use dash pattern from the topmost stroke that has one
    if (i === 0 && stroke.dashPattern) {
      dashPattern = stroke.dashPattern.join(' ');
    }
    
    // Alpha blending formula
    const srcAlpha = alpha;
    const dstAlpha = result.a;
    const outAlpha = srcAlpha + dstAlpha * (1 - srcAlpha);
    
    if (outAlpha > 0) {
      result.r = (color.r * srcAlpha + result.r * dstAlpha * (1 - srcAlpha)) / outAlpha;
      result.g = (color.g * srcAlpha + result.g * dstAlpha * (1 - srcAlpha)) / outAlpha;
      result.b = (color.b * srcAlpha + result.b * dstAlpha * (1 - srcAlpha)) / outAlpha;
      result.a = outAlpha;
    }
  }
  
  return {
    stroke: `rgba(${Math.round(result.r)}, ${Math.round(result.g)}, ${Math.round(result.b)}, ${result.a})`,
    strokeWidth: maxWidth,
    strokeDasharray: dashPattern,
  };
}

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length]!;
}

export function resizeBounds(bounds: XYWH, corner: Side, point: Point): XYWH {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };

  if (corner === Side.Left || (corner & Side.Left) !== 0) {
    result.x = Math.min(point.x, bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }
  if (corner === Side.Right || (corner & Side.Right) !== 0) {
    result.x = Math.min(point.x, bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }
  if (corner === Side.Top || (corner & Side.Top) !== 0) {
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }
  if (corner === Side.Bottom || (corner & Side.Bottom) !== 0) {
    result.y = Math.min(point.y, bounds.y);
    result.height = Math.abs(point.y - bounds.y);
  }

  return result;
}

// Helper function to rotate a point around a center
function rotatePoint(point: Point, center: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos
  };
}

// Rotation-aware resizing function
export function resizeBoundsWithRotation(
  bounds: XYWH, 
  corner: Side, 
  point: Point, 
  rotation: number = 0
): XYWH {
  if (rotation === 0) {
    return resizeBounds(bounds, corner, point);
  }
  
  // Convert rotation from degrees to radians
  const angleRad = (rotation * Math.PI) / 180;
  
  // Calculate the center of the bounds
  const center = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2
  };
  
  // Transform the mouse point to the unrotated coordinate system
  const unrotatedPoint = rotatePoint(point, center, -angleRad);
  
  // Perform the resize calculation in the unrotated space
  const newBounds = resizeBounds(bounds, corner, unrotatedPoint);
  
  // The resized bounds are already in the correct coordinate system
  // because we only transform the mouse point, not the bounds themselves
  return newBounds;
}

export function penPointsToPathPayer(
  points: number[][],
  color: Color,
  name?: string,
  parentId?: string,
): PathLayer {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    const [x, y] = point;
    if (x === undefined || y === undefined) continue;

    if (left > x) {
      left = x;
    }
    if (top > y) {
      top = y;
    }
    if (right < x) {
      right = x;
    }
    if (bottom < y) {
      bottom = y;
    }
  }

  return {
    type: LayerType.Path,
    x: left,
    y: top,
    height: bottom - top,
    width: right - left,
    fills: [createDefaultFill(color)],
    strokes: [createDefaultStroke(color)],
    opacity: 100,
    points: points
      .filter(
        (point): point is [number, number, number] =>
          point[0] !== undefined &&
          point[1] !== undefined &&
          point[2] !== undefined,
      )
      .map(([x, y, pressure]) => [x - left, y - top, pressure]),
    name,
    parentId,
    visible: true,
    locked: false,
  };
}

export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const nextPoint = arr[(i + 1) % arr.length];

      if (!nextPoint) return acc;

      const [x1, y1] = nextPoint;
      acc.push(x0!, y0!, (x0! + x1!) / 2, (y0! + y1!) / 2);
      return acc;
    },
    ["M", ...(stroke[0] ?? []), "Q"],
  );

  d.push("Z");
  return d.join(" ");
}

export const pointerEventToCanvasPoint = (
  e: React.PointerEvent,
  camera: Camera,
): Point => {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  };
};

export function findIntersectionLayersWithRectangle(
  layerIds: readonly string[],
  layers: ReadonlyMap<string, Layer>,
  a: Point,
  b: Point,
) {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const ids = [];

  for (const layerId of layerIds) {
    const layer = layers.get(layerId);

    if (layer == null) continue;

    // Handle different layer types
    let layerBounds: { x: number; y: number; width: number; height: number };
    
    if (layer.type === LayerType.Line || layer.type === LayerType.Arrow) {
      const lineLayer = layer as any;
      layerBounds = {
        x: Math.min(lineLayer.x, lineLayer.x2),
        y: Math.min(lineLayer.y, lineLayer.y2),
        width: Math.abs(lineLayer.x2 - lineLayer.x),
        height: Math.abs(lineLayer.y2 - lineLayer.y),
      };
    } else {
      const rectLayer = layer as any;
      layerBounds = {
        x: rectLayer.x,
        y: rectLayer.y,
        width: rectLayer.width || 0,
        height: rectLayer.height || 0,
      };
    }

    const { x, y, height, width } = layerBounds;
    if (
      rect.x + rect.width > x &&
      rect.x < x + width &&
      rect.y + rect.height > y &&
      rect.y < y + height
    ) {
      ids.push(layerId);
    }
  }

  return ids;
}

// Backward compatibility helpers for layers that might have old fill/stroke properties
export function getLayerFills(layer: any): Fill[] {
  // If layer has new fills array, use it
  if (layer.fills && Array.isArray(layer.fills)) {
    return layer.fills;
  }
  
  // If layer has old fill property, convert to fills array
  if (layer.fill) {
    return [createDefaultFill(layer.fill)];
  }
  
  // Default empty fills
  return [];
}

export function getLayerStrokes(layer: any): Stroke[] {
  // If layer has new strokes array, use it
  if (layer.strokes && Array.isArray(layer.strokes)) {
    return layer.strokes;
  }
  
  // If layer has old stroke property, convert to strokes array
  if (layer.stroke) {
    return [createDefaultStroke(layer.stroke)];
  }
  
  // Return empty array if no strokes
  return [];
}