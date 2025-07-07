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
  name?: string;
  children?: string[]; // Array of child layer IDs for nesting
  parentId?: string; // ID of parent frame if nested (frames can be nested in frames)
  visible?: boolean; // Layer visibility (default: true)
  locked?: boolean; // Layer lock state (default: false)
  expanded?: boolean; // Whether children are expanded in layers panel (default: true)
};

export type Layer = RectangleLayer | EllipseLayer | PathLayer | TextLayer | FrameLayer;

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
      layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Text | LayerType.Frame;
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
  Translating,
  SelectionNet,
  Pressing,
  RightClick,
}