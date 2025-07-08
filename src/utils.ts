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
  
  // Calculate the center of the current bounds
  const center = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2
  };
  
  // Get the opposite corner in local space (relative to bounds)
  const localOppositeCorner = getOppositeCorner(bounds, corner);
  
  // Transform the opposite corner to world space
  const worldOppositeCorner = rotatePoint(localOppositeCorner, center, angleRad);
  
  // Transform the mouse point to local space (as if the object wasn't rotated)
  const localMousePoint = rotatePoint(point, center, -angleRad);
  
  // Transform the world opposite corner to local space
  const localOppositeCornerTransformed = rotatePoint(worldOppositeCorner, center, -angleRad);
  
  // Calculate new bounds in local space
  const localBounds = {
    x: Math.min(localMousePoint.x, localOppositeCornerTransformed.x),
    y: Math.min(localMousePoint.y, localOppositeCornerTransformed.y),
    width: Math.abs(localMousePoint.x - localOppositeCornerTransformed.x),
    height: Math.abs(localMousePoint.y - localOppositeCornerTransformed.y)
  };
  
  return localBounds;
}

// Helper function to get the opposite corner point
function getOppositeCorner(bounds: XYWH, corner: Side): Point {
  let x = bounds.x;
  let y = bounds.y;
  
  // For corners that include Left, the opposite is Right
  if (corner & Side.Left) {
    x = bounds.x + bounds.width;
  }
  // For corners that include Right, the opposite is Left
  if (corner & Side.Right) {
    x = bounds.x;
  }
  // For corners that include Top, the opposite is Bottom
  if (corner & Side.Top) {
    y = bounds.y + bounds.height;
  }
  // For corners that include Bottom, the opposite is Top
  if (corner & Side.Bottom) {
    y = bounds.y;
  }
  
  // Handle pure side cases (not corners)
  if (corner === Side.Left || corner === Side.Right) {
    y = bounds.y + bounds.height / 2;
  }
  if (corner === Side.Top || corner === Side.Bottom) {
    x = bounds.x + bounds.width / 2;
  }
  
  return { x, y };
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

// Common utility functions for canvas components

// Calculate center point of a layer
export function getLayerCenter(layer: { x: number; y: number; width: number; height: number }): Point {
  return {
    x: layer.x + layer.width / 2,
    y: layer.y + layer.height / 2
  };
}

// Generate SVG rotation transform string
export function getRotationTransform(rotation: number, centerX: number, centerY: number): string {
  return rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';
}

// Generate SVG rotation transform string for a layer
export function getLayerRotationTransform(layer: { x: number; y: number; width: number; height: number; rotation?: number }): string {
  if (!layer.rotation) return '';
  const center = getLayerCenter(layer);
  return getRotationTransform(layer.rotation, center.x, center.y);
}

// Get common layer styles (fill and stroke)
export function getLayerStyles(layer: any): { fillStyle: string; strokeStyle: { stroke: string; strokeWidth: number; strokeDasharray?: string } } {
  const fillStyle = calculateFillStyle(getLayerFills(layer));
  const strokeStyle = calculateStrokeStyle(getLayerStrokes(layer));
  return { fillStyle, strokeStyle };
}

// Clamp a number between min and max values
export function clampNumber(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}

// Parse and validate a numeric input string
export function parseNumericInput(input: string, fallback: number, min?: number, max?: number): number {
  const parsed = parseFloat(input);
  if (isNaN(parsed)) return fallback;
  return clampNumber(parsed, min, max);
}

// Generate CSS transform string for positioning
export function getCSSTransform(x: number, y: number, additionalTransforms?: string): string {
  const baseTransform = `translate(${x}px, ${y}px)`;
  return additionalTransforms ? `${baseTransform} ${additionalTransforms}` : baseTransform;
}

// Get layer bounds with rotation consideration
export function getLayerBounds(layer: any): XYWH {
  if (layer.type === 'Line' || layer.type === 'Arrow') {
    return {
      x: Math.min(layer.x, layer.x2),
      y: Math.min(layer.y, layer.y2),
      width: Math.abs(layer.x2 - layer.x),
      height: Math.abs(layer.y2 - layer.y)
    };
  }
  
  return {
    x: layer.x,
    y: layer.y,
    width: layer.width || 0,
    height: layer.height || 0
  };
}

// Check if a point is inside a layer's bounds
export function isPointInLayer(point: Point, layer: any): boolean {
  const bounds = getLayerBounds(layer);
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

// Calculate distance between two points
export function getDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate angle between two points in degrees
export function getAngle(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

// Normalize angle to 0-360 range
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

// Round number to specified decimal places
export function roundToDecimal(num: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

// Generate unique ID
export function generateId(): string {
  return crypto.randomUUID();
}

// Check if a value is numeric
export function isNumeric(value: any): boolean {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

// Format number for display (remove trailing zeros)
export function formatNumber(num: number): string {
  return parseFloat(num.toFixed(2)).toString();
}

// Get contrasting color (black or white) for a given color
export function getContrastingColor(color: Color): Color {
  const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
  return luminance > 0.5 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
}

// Lerp between two numbers
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Lerp between two points
export function lerpPoint(p1: Point, p2: Point, t: number): Point {
  return {
    x: lerp(p1.x, p2.x, t),
    y: lerp(p1.y, p2.y, t)
  };
}

// Lerp between two colors
export function lerpColor(c1: Color, c2: Color, t: number): Color {
  return {
    r: Math.round(lerp(c1.r, c2.r, t)),
    g: Math.round(lerp(c1.g, c2.g, t)),
    b: Math.round(lerp(c1.b, c2.b, t))
  };
}

// Check if two rectangles intersect
export function rectanglesIntersect(rect1: XYWH, rect2: XYWH): boolean {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
}

// Get the intersection of two rectangles
export function getIntersection(rect1: XYWH, rect2: XYWH): XYWH | null {
  if (!rectanglesIntersect(rect1, rect2)) return null;
  
  const x = Math.max(rect1.x, rect2.x);
  const y = Math.max(rect1.y, rect2.y);
  const width = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - x;
  const height = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - y;
  
  return { x, y, width, height };
}