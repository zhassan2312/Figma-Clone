export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Camera = {
  x: number;
  y: number;
  zoom: number;
};

export enum LayerType {
  Rectangle,
  Ellipse,
  Path,
  Text,
  Frame,
  Group,
  Star,
  Line,
  Arrow,
  Polygon,
  Image,
  Video,
}

export type RectangleLayer = {
  type: LayerType.Rectangle;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
  rotation?: number; // Rotation in degrees (default: 0)
  name?: string;
  parentId?: string; // ID of parent frame if nested
  visible?: boolean; // Layer visibility (default: true)
  locked?: boolean; // Layer lock state (default: false)
};

export type EllipseLayer = {
  type: LayerType.Ellipse;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  rotation?: number; // Rotation in degrees (default: 0)
  name?: string;
  parentId?: string; // ID of parent frame if nested
  visible?: boolean; // Layer visibility (default: true)
  locked?: boolean; // Layer lock state (default: false)
};

export type PathLayer = {
  type: LayerType.Path;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  rotation?: number; // Rotation in degrees (default: 0)
  points: number[][];
  name?: string;
  parentId?: string; // ID of parent frame if nested
  visible?: boolean; // Layer visibility (default: true)
  locked?: boolean; // Layer lock state (default: false)
};

export type TextLayer = {
  type: LayerType.Text;
  x: number;
  y: number;
  height: number;
  width: number;
  text: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  fill: Color;
  stroke: Color;
  opacity: number;
  rotation?: number; // Rotation in degrees (default: 0)
  name?: string;
  parentId?: string; // ID of parent frame if nested
  visible?: boolean; // Layer visibility (default: true)
  locked?: boolean; // Layer lock state (default: false)
};

export type FrameLayer = {
  type: LayerType.Frame;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
  rotation?: number; // Rotation in degrees (default: 0)
  name?: string;
  children?: string[]; // Array of child layer IDs for nesting
  parentId?: string; // ID of parent frame if nested (frames can be nested in frames)
  visible?: boolean; // Layer visibility (default: true)
  locked?: boolean; // Layer lock state (default: false)
  expanded?: boolean; // Whether children are expanded in layers panel (default: true)
};

export type GroupLayer = {
  type: LayerType.Group;
  x: number;
  y: number;
  height: number;
  width: number;
  rotation?: number; // Rotation in degrees (default: 0)
  name?: string;
  children?: string[]; // Array of child layer IDs for grouping
  parentId?: string; // ID of parent frame/group if nested
  visible?: boolean; // Layer visibility (default: true)
  locked?: boolean; // Layer lock state (default: false)
  expanded?: boolean; // Whether children are expanded in layers panel (default: true)
};

export type StarLayer = {
  type: LayerType.Star;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  cornerRadius?: number;
  rotation?: number; // Rotation in degrees (default: 0)
  vertices: number; // Number of star vertices (default: 5)
  innerRadius: number; // Inner radius ratio (0-1, default: 0.5)
  name?: string;
  parentId?: string;
  visible?: boolean;
  locked?: boolean;
};

export type LineLayer = {
  type: LayerType.Line;
  x: number;
  y: number;
  x2: number;
  y2: number;
  stroke: Color;
  opacity: number;
  strokeWidth: number;
  isDashed: boolean;
  dashWidth?: number; // Dash width (default: 5)
  dashGap?: number; // Gap between dashes (default: 5)
  rotation?: number; // Rotation in degrees (default: 0)
  name?: string;
  parentId?: string;
  visible?: boolean;
  locked?: boolean;
};

export type ArrowLayer = {
  type: LayerType.Arrow;
  x: number;
  y: number;
  x2: number;
  y2: number;
  stroke: Color;
  opacity: number;
  strokeWidth: number;
  isDashed: boolean;
  dashWidth?: number; // Dash width (default: 5)
  dashGap?: number; // Gap between dashes (default: 5)
  arrowStart: boolean; // Arrow head at start
  arrowEnd: boolean; // Arrow head at end
  arrowSize: number; // Size of arrow heads
  rotation?: number; // Rotation in degrees (default: 0)
  name?: string;
  parentId?: string;
  visible?: boolean;
  locked?: boolean;
};

export type PolygonLayer = {
  type: LayerType.Polygon;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  stroke: Color;
  opacity: number;
  rotation?: number; // Rotation in degrees (default: 0)
  sides: number; // Number of polygon sides (default: 6)
  name?: string;
  parentId?: string;
  visible?: boolean;
  locked?: boolean;
};

export type ImageLayer = {
  type: LayerType.Image;
  x: number;
  y: number;
  height: number;
  width: number;
  opacity: number;
  rotation?: number; // Rotation in degrees (default: 0)
  src: string; // Image URL or data URI
  name?: string;
  parentId?: string;
  visible?: boolean;
  locked?: boolean;
};

export type VideoLayer = {
  type: LayerType.Video;
  x: number;
  y: number;
  height: number;
  width: number;
  opacity: number;
  rotation?: number; // Rotation in degrees (default: 0)
  src: string; // Video URL
  poster?: string; // Poster image URL
  controls: boolean;
  autoplay: boolean;
  muted: boolean;
  name?: string;
  parentId?: string;
  visible?: boolean;
  locked?: boolean;
};

export type Layer = RectangleLayer | EllipseLayer | PathLayer | TextLayer | FrameLayer | GroupLayer | StarLayer | LineLayer | ArrowLayer | PolygonLayer | ImageLayer | VideoLayer;

export type Point = {
  x: number;
  y: number;
};

export type XYWH = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
  TopLeft = 5,    // Top + Left
  TopRight = 9,   // Top + Right
  BottomLeft = 6, // Bottom + Left
  BottomRight = 10, // Bottom + Right
}

export type CanvasState =
  | {
      mode: CanvasMode.None;
    }
  | {
      mode: CanvasMode.RightClick;
    }
  | {
      mode: CanvasMode.SelectionNet;
      origin: Point;
      current?: Point;
      isShiftHeld?: boolean;
    }
  | {
      mode: CanvasMode.Dragging;
      origin: Point | null;
    }
  | {
      mode: CanvasMode.Inserting;
      layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Text | LayerType.Frame | LayerType.Star | LayerType.Line | LayerType.Arrow | LayerType.Polygon | LayerType.Image | LayerType.Video;
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      corner: Side;
    }
  | {
      mode: CanvasMode.Scaling;
      initialBounds: XYWH;
      corner: Side;
      initialScale: number;
    }
  | {
      mode: CanvasMode.Rotating;
      initialBounds: XYWH;
      center: Point;
      initialAngle: number;
      initialRotation: number;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
    }
  | {
      mode: CanvasMode.Pressing;
      origin: Point;
      isShiftHeld?: boolean;
    };

export enum CanvasMode {
  None,
  Dragging,
  Inserting,
  Pencil,
  Resizing,
  Scaling,
  Rotating,
  Translating,
  SelectionNet,
  Pressing,
  RightClick,
}