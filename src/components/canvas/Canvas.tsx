"use client";

import {
  useCanRedo,
  useCanUndo,
  useHistory,
  useMutation,
  useMyPresence,
  useSelf,
  useStorage,
} from "@liveblocks/react";
import {
  colorToCss,
  findIntersectionLayersWithRectangle,
  penPointsToPathPayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/utils";
import LayerComponent from "./LayerComponent";
import {
  Camera,
  CanvasMode,
  CanvasState,
  EllipseLayer,
  FrameLayer,
  Layer,
  LayerType,
  Point,
  RectangleLayer,
  Side,
  TextLayer,
  XYWH,
} from "@/types";
import { nanoid } from "nanoid";
import { LiveObject } from "@liveblocks/client";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import ToolsBar from "../toolsbar/ToolsBar";
import Path from "./Path";
import SelectionBox from "./SelectionBox";
import useDeleteLayers from "@/hooks/useDeleteLayers";
import useKeyboardShortcuts from "@/hooks/useKeyboardShortcuts";
import SelectionTools from "./SelectionTools";
import Sidebars from "../sidebars/Sidebars";
import MultiplayerGuides from "./MultiplayerGuides";
import ZoomIndicator from "./ZoomIndicator";
import ToolIndicator from "./ToolIndicator";
import { User } from "@prisma/client";

const MAX_LAYERS = 100;

export default function Canvas({
  roomName,
  roomId,
  othersWithAccessToRoom,
}: {
  roomName: string;
  roomId: string;
  othersWithAccessToRoom: User[];
}) {
  const [leftIsMinimized, setLeftIsMinimized] = useState(false);
  const roomColor = useStorage((root) => root.roomColor);
  const layerIds = useStorage((root) => root.layerIds);
  const layers = useStorage((root) => root.layers);
  const pencilDraft = useSelf((me) => me.presence.pencilDraft);
  const deleteLayers = useDeleteLayers();
  const [canvasState, setState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [camera, setCamera] = useState<Camera>({ x: 0, y: 0, zoom: 1 });
  const [isRenamingActive, setIsRenamingActive] = useState(false);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const [showToolIndicator, setShowToolIndicator] = useState(false);
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const selectAllLayers = useMutation(
    ({ setMyPresence }) => {
      if (layerIds) {
        setMyPresence({ selection: [...layerIds] }, { addToHistory: true });
      }
    },
    [layerIds],
  );

  // Initialize keyboard shortcuts
  const { copyLayers, cutLayers, pasteLayers, duplicateLayers } = useKeyboardShortcuts({
    history,
    selectAllLayers,
    camera,
    setCamera: (newCamera) => {
      setCamera(newCamera);
      setShowZoomIndicator(true);
      setTimeout(() => setShowZoomIndicator(false), 100);
    },
    setCanvasState: (newState) => {
      setState(newState);
      setShowToolIndicator(true);
      setTimeout(() => setShowToolIndicator(false), 100);
    },
    startRename: () => setIsRenamingActive(true),
  });

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence, storage }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      // Check if layer is locked
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(layerId);
      if (layer?.get("locked")) {
        return; // Don't allow interaction with locked layers
      }

      // Helper function to get all children of a frame recursively
      const getAllChildren = (frameId: string): string[] => {
        const frameLayer = liveLayers.get(frameId);
        if (!frameLayer || frameLayer.get("type") !== LayerType.Frame) {
          return [];
        }
        
        const frameTyped = frameLayer as LiveObject<FrameLayer>;
        const children = frameTyped.get("children") || [];
        let allChildren = [...children];
        
        // Recursively get children of child frames
        children.forEach(childId => {
          const childLayer = liveLayers.get(childId);
          if (childLayer?.get("type") === LayerType.Frame) {
            allChildren = allChildren.concat(getAllChildren(childId));
          }
        });
        
        return allChildren;
      };

      // Helper function to get all layers to select (including frame children)
      const getLayersToSelect = (targetLayerId: string): string[] => {
        const targetLayer = liveLayers.get(targetLayerId);
        let layersToSelect = [targetLayerId];
        
        // If it's a frame, include all its children
        if (targetLayer?.get("type") === LayerType.Frame) {
          const allChildren = getAllChildren(targetLayerId);
          layersToSelect = layersToSelect.concat(allChildren);
        }
        
        return layersToSelect;
      };

      history.pause();
      e.stopPropagation();
      
      const currentSelection = self.presence.selection;
      const isShiftHeld = e.shiftKey;
      
      if (isShiftHeld) {
        // Shift+click: Add/remove from selection
        const layersToToggle = getLayersToSelect(layerId);
        
        if (currentSelection.includes(layerId)) {
          // Remove the layer and its children from selection
          const newSelection = currentSelection.filter(id => !layersToToggle.includes(id));
          setMyPresence({ selection: newSelection }, { addToHistory: true });
        } else {
          // Add the layer and its children to selection
          const newSelection = [...currentSelection, ...layersToToggle];
          // Remove duplicates
          const uniqueSelection = [...new Set(newSelection)];
          setMyPresence({ selection: uniqueSelection }, { addToHistory: true });
        }
      } else {
        // Normal click: Select the layer and its children
        const layersToSelect = getLayersToSelect(layerId);
        setMyPresence({ selection: layersToSelect }, { addToHistory: true });
      }

      if (e.nativeEvent.button === 2) {
        setState({ mode: CanvasMode.RightClick });
      } else {
        const point = pointerEventToCanvasPoint(e, camera);
        setState({ mode: CanvasMode.Translating, current: point });
      }
    },
    [camera, canvasState.mode, history],
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history],
  );

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Frame,
      position: Point,
    ) => {
      const liveLayers = storage.get("layers");
      if (liveLayers.size >= MAX_LAYERS) {
        return;
      }

      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();
      let layer: LiveObject<Layer> | null = null;

      // Find if the position is inside a frame
      const findContainingFrame = (position: Point): string | null => {
        // Get all frame layers, check from top to bottom (reverse order)
        const frameIds = Array.from(liveLayerIds).reverse();
        for (const id of frameIds) {
          const layer = liveLayers.get(id);
          if (layer?.get("type") === LayerType.Frame) {
            const x = layer.get("x");
            const y = layer.get("y");
            const width = layer.get("width");
            const height = layer.get("height");
            
            // Check if position is inside this frame
            if (position.x >= x && position.x <= x + width &&
                position.y >= y && position.y <= y + height) {
              return id;
            }
          }
        }
        return null;
      };

      const parentFrameId = findContainingFrame(position);

      // Generate unique names by counting existing layers of the same type
      const getNextLayerName = (type: LayerType): string => {
        const existingLayers = Array.from(liveLayers.values()).filter(layer => layer.get("type") === type);
        const baseNames = {
          [LayerType.Rectangle]: "Rectangle",
          [LayerType.Ellipse]: "Ellipse", 
          [LayerType.Text]: "Text",
          [LayerType.Frame]: "Frame",
          [LayerType.Path]: "Drawing"
        };
        return `${baseNames[type]} ${existingLayers.length + 1}`;
      };

      if (layerType === LayerType.Rectangle) {
        layer = new LiveObject<RectangleLayer>({
          type: LayerType.Rectangle,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
          name: getNextLayerName(LayerType.Rectangle),
          parentId: parentFrameId || undefined,
          visible: true,
          locked: false,
        });
      } else if (layerType === LayerType.Ellipse) {
        layer = new LiveObject<EllipseLayer>({
          type: LayerType.Ellipse,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fill: { r: 217, g: 217, b: 217 },
          stroke: { r: 217, g: 217, b: 217 },
          opacity: 100,
          name: getNextLayerName(LayerType.Ellipse),
          parentId: parentFrameId || undefined,
          visible: true,
          locked: false,
        });
      } else if (layerType === LayerType.Text) {
        layer = new LiveObject<TextLayer>({
          type: LayerType.Text,
          x: position.x,
          y: position.y,
          height: 100,
          width: 100,
          fontSize: 16,
          text: "Text",
          fontWeight: 400,
          fontFamily: "Inter",
          stroke: { r: 217, g: 217, b: 217 },
          fill: { r: 217, g: 217, b: 217 },
          opacity: 100,
          name: getNextLayerName(LayerType.Text),
          parentId: parentFrameId || undefined,
          visible: true,
          locked: false,
        });
      } else if (layerType === LayerType.Frame) {
        layer = new LiveObject<FrameLayer>({
          type: LayerType.Frame,
          x: position.x,
          y: position.y,
          height: 200,
          width: 200,
          fill: { r: 255, g: 255, b: 255 },
          stroke: { r: 153, g: 153, b: 153 },
          opacity: 100,
          cornerRadius: 0,
          name: getNextLayerName(LayerType.Frame),
          children: [],
          parentId: parentFrameId || undefined,
          visible: true,
          locked: false,
          expanded: true,
        });
      }

      if (layer) {
        liveLayerIds.push(layerId);
        liveLayers.set(layerId, layer);

        // If the layer has a parent frame, add it to the parent's children
        if (parentFrameId) {
          const parentFrame = liveLayers.get(parentFrameId);
          if (parentFrame && parentFrame.get("type") === LayerType.Frame) {
            const currentChildren = (parentFrame as LiveObject<FrameLayer>).get("children") || [];
            (parentFrame as LiveObject<FrameLayer>).update({ children: [...currentChildren, layerId] });
          }
        }

        setMyPresence({ selection: [layerId] }, { addToHistory: true });
        setState({ mode: CanvasMode.None });
      }
    },
    [],
  );

  const insertPath = useMutation(({ storage, self, setMyPresence }) => {
    const liveLayers = storage.get("layers");
    const { pencilDraft } = self.presence;

    if (
      pencilDraft === null ||
      pencilDraft.length < 2 ||
      liveLayers.size >= MAX_LAYERS
    ) {
      setMyPresence({ pencilDraft: null });
      return;
    }

    // Generate unique name for the drawing
    const existingPaths = Array.from(liveLayers.values()).filter(layer => layer.get("type") === LayerType.Path);
    const drawingName = `Drawing ${existingPaths.length + 1}`;

    // Find if the drawing starts inside a frame
    const firstPoint = pencilDraft[0];
    const findContainingFrame = (position: Point): string | null => {
      const liveLayerIds = storage.get("layerIds");
      const frameIds = Array.from(liveLayerIds).reverse();
      for (const id of frameIds) {
        const layer = liveLayers.get(id);
        if (layer?.get("type") === LayerType.Frame) {
          const x = layer.get("x");
          const y = layer.get("y");
          const width = layer.get("width");
          const height = layer.get("height");
          
          if (position.x >= x && position.x <= x + width &&
              position.y >= y && position.y <= y + height) {
            return id;
          }
        }
      }
      return null;
    };

    const parentFrameId = firstPoint ? findContainingFrame({ x: firstPoint[0] || 0, y: firstPoint[1] || 0 }) : null;

    const id = nanoid();
    const pathLayer = penPointsToPathPayer(
      pencilDraft, 
      { r: 217, g: 217, b: 217 },
      drawingName,
      parentFrameId || undefined
    );
    
    liveLayers.set(id, new LiveObject(pathLayer));

    // If the path has a parent frame, add it to the parent's children
    if (parentFrameId) {
      const parentFrame = liveLayers.get(parentFrameId);
      if (parentFrame && parentFrame.get("type") === LayerType.Frame) {
        const currentChildren = (parentFrame as LiveObject<FrameLayer>).get("children") || [];
        (parentFrame as LiveObject<FrameLayer>).update({ children: [...currentChildren, id] });
      }
    }

    const liveLayerIds = storage.get("layerIds");
    liveLayerIds.push(id);
    setMyPresence({ pencilDraft: null });
    setState({ mode: CanvasMode.Pencil });
  }, []);

  const translateSelectedLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const liveLayers = storage.get("layers");
      
      // Move all selected layers (children will move naturally through selection)
      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);
        if (!layer || layer.get("locked")) continue; // Skip locked layers
        
        // Move the layer itself
        layer.update({
          x: layer.get("x") + offset.x,
          y: layer.get("y") + offset.y,
        });
      }

      setState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState],
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) {
        return;
      }

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point,
      );

      const liveLayers = storage.get("layers");

      if (self.presence.selection.length > 0) {
        const layer = liveLayers.get(self.presence.selection[0]!);
        if (layer) {
          layer.update(bounds);
        }
      }

      // Update layers to set the new width and height of the layer
    },
    [canvasState],
  );

  const unselectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        penColor: { r: 217, g: 217, b: 217 },
      });
    },
    [],
  );

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;

      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft === null
      ) {
        return;
      }

      setMyPresence({
        cursor: point,
        pencilDraft: [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode],
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if this is a pinch gesture (Ctrl key is held with wheel event on Windows/trackpad)
    const isZoomGesture = e.ctrlKey;

    if (isZoomGesture) {
      // Zoom functionality
      const zoomDelta = -e.deltaY * 0.001; // Negative because wheel up should zoom in
      const newZoom = Math.min(Math.max(camera.zoom + zoomDelta, 0.1), 5); // Clamp between 0.1x and 5x
      
      // Get mouse position for zoom centering
      const rect = (e.target as Element).getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate the point in canvas coordinates before zoom
      const canvasPointX = (mouseX - camera.x) / camera.zoom;
      const canvasPointY = (mouseY - camera.y) / camera.zoom;
      
      // Calculate new camera position to keep the point under the mouse
      const newCameraX = mouseX - canvasPointX * newZoom;
      const newCameraY = mouseY - canvasPointY * newZoom;
      
      setCamera({
        x: newCameraX,
        y: newCameraY,
        zoom: newZoom,
      });

      // Show zoom indicator
      setShowZoomIndicator(true);
      setTimeout(() => setShowZoomIndicator(false), 100);
    } else {
      // Pan functionality
      setCamera((camera) => ({
        x: camera.x - e.deltaX,
        y: camera.y - e.deltaY,
        zoom: camera.zoom,
      }));
    }
  }, [camera]);

  const onPointerDown = useMutation(
    ({}, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: point });
        return;
      }

      if (canvasState.mode === CanvasMode.Inserting) return;

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure);
        return;
      }

      setState({ 
        origin: point, 
        mode: CanvasMode.Pressing, 
        isShiftHeld: e.shiftKey 
      });
    },
    [camera, canvasState.mode, setState, startDrawing],
  );

  const startMultiSelection = useCallback((current: Point, origin: Point, isShiftHeld = false) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setState({ 
        mode: CanvasMode.SelectionNet, 
        origin, 
        current, 
        isShiftHeld 
      });
    }
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence, self }, current: Point, origin: Point, isShiftHeld = false) => {
      if (layerIds) {
        const layers = storage.get("layers").toImmutable();
        setState({
          mode: CanvasMode.SelectionNet,
          origin,
          current,
        });
        const ids = findIntersectionLayersWithRectangle(
          layerIds,
          layers,
          origin,
          current,
        );
        
        if (isShiftHeld) {
          // Add to existing selection
          const currentSelection = self.presence.selection;
          const newSelection = [...new Set([...currentSelection, ...ids])];
          setMyPresence({ selection: newSelection });
        } else {
          // Replace selection
          setMyPresence({ selection: ids });
        }
      }
    },
    [layerIds],
  );

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(point, canvasState.origin, canvasState.isShiftHeld);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(point, canvasState.origin, canvasState.isShiftHeld);
      } else if (
        canvasState.mode === CanvasMode.Dragging &&
        canvasState.origin !== null
      ) {
        const deltaX = e.movementX;
        const deltaY = e.movementY;

        setCamera((camera) => ({
          x: camera.x + deltaX,
          y: camera.y + deltaY,
          zoom: camera.zoom,
        }));
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(point);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(point, e);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(point);
      }
      setMyPresence({ cursor: point });
    },
    [
      camera,
      canvasState,
      translateSelectedLayers,
      continueDrawing,
      resizeSelectedLayer,
      updateSelectionNet,
      startMultiSelection,
    ],
  );

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  const onPointerUp = useMutation(
    ({}, e: React.PointerEvent) => {
      if (canvasState.mode === CanvasMode.RightClick) return;

      const point = pointerEventToCanvasPoint(e, camera);

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers();
        setState({ mode: CanvasMode.None });
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else if (canvasState.mode === CanvasMode.Dragging) {
        setState({ mode: CanvasMode.Dragging, origin: null });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else {
        setState({ mode: CanvasMode.None });
      }
      history.resume();
    },
    [canvasState, setState, insertLayer, unselectLayers, history],
  );

  // Check if storage is loaded before rendering canvas
  if (roomColor === null || layerIds === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <img
          src="/figma-logo.svg"
          alt="Figma logo"
          className="h-[50px] w-[50px] animate-bounce"
        />
        <h1 className="text-sm font-normal">Loading canvas...</h1>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full">
      <ZoomIndicator zoom={camera.zoom} isVisible={showZoomIndicator} />
      <ToolIndicator canvasState={canvasState} isVisible={showToolIndicator} />
      <main className="fixed left-0 right-0 h-screen overflow-y-auto">
        <div
          style={{
            backgroundColor: roomColor ? colorToCss(roomColor) : "#1e1e1e",
          }}
          className="h-full w-full touch-none"
        >
          <SelectionTools camera={camera} canvasMode={canvasState.mode} />
          <svg
            onWheel={onWheel}
            onPointerUp={onPointerUp}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className="h-full w-full"
            onContextMenu={(e) => e.preventDefault()}
          >
            <g
              style={{
                transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
              }}
            >
              {layerIds?.filter(layerId => {
                const layer = layers?.get(layerId);
                return !layer?.parentId && (layer?.visible ?? true); // Only render top-level visible layers
              }).map((layerId) => (
                <LayerComponent
                  key={layerId}
                  id={layerId}
                  onLayerPointerDown={onLayerPointerDown}
                />
              ))}
              <SelectionBox
                onResizeHandlePointerDown={onResizeHandlePointerDown}
              />
              {canvasState.mode === CanvasMode.SelectionNet &&
                canvasState.current != null && (
                  <rect
                    className="fill-blue-600/5 stroke-blue-600 stroke-[0.5]"
                    x={Math.min(canvasState.origin.x, canvasState.current.x)}
                    y={Math.min(canvasState.origin.y, canvasState.current.y)}
                    width={Math.abs(
                      canvasState.origin.x - canvasState.current.x,
                    )}
                    height={Math.abs(
                      canvasState.origin.y - canvasState.current.y,
                    )}
                  />
                )}
              <MultiplayerGuides />
              {pencilDraft !== null && pencilDraft.length > 0 && (
                <Path
                  x={0}
                  y={0}
                  opacity={100}
                  fill={colorToCss({ r: 217, g: 217, b: 217 })}
                  points={pencilDraft}
                />
              )}
            </g>
          </svg>
        </div>
      </main>

      <ToolsBar
        canvasState={canvasState}
        setCanvasState={(newState) => setState(newState)}
        zoomIn={() => {
          const newZoom = Math.min(camera.zoom * 1.1, 5);
          setCamera((camera) => ({ ...camera, zoom: newZoom }));
          setShowZoomIndicator(true);
          setTimeout(() => setShowZoomIndicator(false), 100);
        }}
        zoomOut={() => {
          const newZoom = Math.max(camera.zoom * 0.9, 0.1);
          setCamera((camera) => ({ ...camera, zoom: newZoom }));
          setShowZoomIndicator(true);
          setTimeout(() => setShowZoomIndicator(false), 100);
        }}
        canZoomIn={camera.zoom < 5}
        canZoomOut={camera.zoom > 0.1}
        redo={() => history.redo()}
        undo={() => history.undo()}
        canRedo={canRedo}
        canUndo={canUndo}
      />
      <Sidebars
        roomName={roomName}
        roomId={roomId}
        othersWithAccessToRoom={othersWithAccessToRoom}
        leftIsMinimized={leftIsMinimized}
        setLeftIsMinimized={setLeftIsMinimized}
        isRenamingActive={isRenamingActive}
        setIsRenamingActive={setIsRenamingActive}
      />
    </div>
  );
}