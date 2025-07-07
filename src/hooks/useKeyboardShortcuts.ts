"use client";

import { useCallback, useEffect } from "react";
import { useMutation, useSelf, useStorage } from "@liveblocks/react";
import { LiveObject } from "@liveblocks/client";
import { nanoid } from "nanoid";
import { Layer, LayerType, CanvasMode } from "@/types";
import useDeleteLayers from "./useDeleteLayers";

export default function useKeyboardShortcuts({
  history,
  selectAllLayers,
  camera,
  setCamera,
  setCanvasState,
  startRename,
}: {
  history: any;
  selectAllLayers: () => void;
  camera: { x: number; y: number; zoom: number };
  setCamera?: (camera: { x: number; y: number; zoom: number }) => void;
  setCanvasState?: (state: any) => void;
  startRename?: () => void;
}) {
  const selection = useSelf((me) => me.presence.selection);
  const layers = useStorage((root) => root.layers);
  const deleteLayers = useDeleteLayers();

  // Copy selected layers to clipboard
  const copyLayers = useMutation(
    ({ storage }) => {
      if (!selection || selection.length === 0) return;
      
      const liveLayers = storage.get("layers");
      const layersToCopy = selection.map(id => {
        const layer = liveLayers.get(id);
        return layer ? layer.toObject() : null;
      }).filter(Boolean);
      
      // Store in sessionStorage (acts as clipboard)
      sessionStorage.setItem("figma-clipboard", JSON.stringify(layersToCopy));
      console.log("Copied", layersToCopy.length, "layers to clipboard");
    },
    [selection]
  );

  // Cut selected layers (copy + delete)
  const cutLayers = useMutation(
    ({ storage, setMyPresence }) => {
      if (!selection || selection.length === 0) return;
      
      const liveLayers = storage.get("layers");
      const layersToCopy = selection.map(id => {
        const layer = liveLayers.get(id);
        return layer ? layer.toObject() : null;
      }).filter(Boolean);
      
      // Store in sessionStorage
      sessionStorage.setItem("figma-clipboard", JSON.stringify(layersToCopy));
      
      // Delete the selected layers
      deleteLayers();
      
      console.log("Cut", layersToCopy.length, "layers to clipboard");
    },
    [selection, deleteLayers]
  );

  // Paste layers from clipboard
  const pasteLayers = useMutation(
    ({ storage, setMyPresence }) => {
      const clipboardData = sessionStorage.getItem("figma-clipboard");
      if (!clipboardData) return;
      
      try {
        const layersToPaste = JSON.parse(clipboardData) as Layer[];
        if (!layersToPaste || layersToPaste.length === 0) return;
        
        const liveLayers = storage.get("layers");
        const liveLayerIds = storage.get("layerIds");
        const newSelection: string[] = [];
        
        // Offset for pasted layers
        const offset = 20;
        
        layersToPaste.forEach((layer) => {
          const newId = nanoid();
          const newLayer = {
            ...layer,
            x: layer.x + offset,
            y: layer.y + offset,
          };
          
          liveLayers.set(newId, new LiveObject(newLayer));
          liveLayerIds.push(newId);
          newSelection.push(newId);
        });
        
        // Select the pasted layers
        setMyPresence({ selection: newSelection }, { addToHistory: true });
        
        console.log("Pasted", layersToPaste.length, "layers");
      } catch (error) {
        console.error("Failed to paste layers:", error);
      }
    },
    []
  );

  // Duplicate selected layers
  const duplicateLayers = useMutation(
    ({ storage, setMyPresence }) => {
      if (!selection || selection.length === 0) return;
      
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      const newSelection: string[] = [];
      
      // Offset for duplicated layers
      const offset = 20;
      
      selection.forEach((id) => {
        const layer = liveLayers.get(id);
        if (layer) {
          const newId = nanoid();
          const layerData = layer.toObject();
          const newLayer = {
            ...layerData,
            x: layerData.x + offset,
            y: layerData.y + offset,
          };
          
          liveLayers.set(newId, new LiveObject(newLayer));
          liveLayerIds.push(newId);
          newSelection.push(newId);
        }
      });
      
      // Select the duplicated layers
      setMyPresence({ selection: newSelection }, { addToHistory: true });
      
      console.log("Duplicated", selection.length, "layers");
    },
    [selection]
  );

  // Clear selection
  const clearSelection = useMutation(
    ({ setMyPresence }) => {
      setMyPresence({ selection: [] }, { addToHistory: true });
    },
    []
  );

  // Group selected layers (simple grouping)
  const groupLayers = useMutation(
    ({ storage, setMyPresence }) => {
      if (!selection || selection.length < 2) return;
      
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      
      // Get all selected layers
      const selectedLayers = selection.map(id => {
        const layer = liveLayers.get(id);
        return layer ? { id, data: layer.toObject() } : null;
      }).filter((item): item is { id: string; data: Layer } => item !== null);
      
      if (selectedLayers.length < 2) return;
      
      // Calculate bounding box for all selected layers
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      selectedLayers.forEach(({ data }) => {
        const layerMinX = data.x;
        const layerMinY = data.y;
        let layerMaxX, layerMaxY;
        
        if (data.type === LayerType.Path) {
          // For paths, use the bounding box
          const bounds = (data as any).points.reduce(
            (acc: { minX: number; minY: number; maxX: number; maxY: number }, point: [number, number]) => ({
              minX: Math.min(acc.minX, point[0]),
              minY: Math.min(acc.minY, point[1]),
              maxX: Math.max(acc.maxX, point[0]),
              maxY: Math.max(acc.maxY, point[1]),
            }),
            { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
          );
          layerMaxX = data.x + bounds.maxX - bounds.minX;
          layerMaxY = data.y + bounds.maxY - bounds.minY;
        } else if (data.type === LayerType.Group) {
          // For groups, use their bounds
          layerMaxX = data.x + (data as any).width;
          layerMaxY = data.y + (data as any).height;
        } else {
          layerMaxX = data.x + (data as any).width;
          layerMaxY = data.y + (data as any).height;
        }
        
        minX = Math.min(minX, layerMinX);
        minY = Math.min(minY, layerMinY);
        maxX = Math.max(maxX, layerMaxX);
        maxY = Math.max(maxY, layerMaxY);
      });
      
      // Create a new group
      const groupId = nanoid();
      const groupLayer = {
        type: LayerType.Group,
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        name: `Group ${liveLayerIds.length + 1}`,
        children: selectedLayers.map(({ id }) => id),
        parentId: undefined,
        visible: true,
        locked: false,
        expanded: true,
      };
      
      // Update selected layers to have the group as parent
      // Keep their absolute positions - don't make them relative to the group
      selectedLayers.forEach(({ id, data }) => {
        const updatedLayer = {
          ...data,
          parentId: groupId,
          // Keep absolute positions
        };
        liveLayers.set(id, new LiveObject(updatedLayer));
      });
      
      // Add the group to layers
      liveLayers.set(groupId, new LiveObject(groupLayer as any));
      liveLayerIds.push(groupId);
      
      // Select the new group
      setMyPresence({ selection: [groupId] }, { addToHistory: true });
      
      console.log("Grouped", selectedLayers.length, "layers into group", groupId);
    },
    [selection]
  );

  // Wrap selected layers in a frame
  const wrapInFrame = useMutation(
    ({ storage, setMyPresence }) => {
      if (!selection || selection.length === 0) return;
      
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      
      // Get all selected layers
      const selectedLayers = selection.map(id => {
        const layer = liveLayers.get(id);
        return layer ? { id, data: layer.toObject() } : null;
      }).filter((item): item is { id: string; data: Layer } => item !== null);
      
      if (selectedLayers.length === 0) return;
      
      // Calculate bounding box for all selected layers
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      selectedLayers.forEach(({ data }) => {
        const layerMinX = data.x;
        const layerMinY = data.y;
        let layerMaxX, layerMaxY;
        
        if (data.type === LayerType.Path) {
          // For paths, use the bounding box
          const bounds = (data as any).points.reduce(
            (acc: { minX: number; minY: number; maxX: number; maxY: number }, point: [number, number]) => ({
              minX: Math.min(acc.minX, point[0]),
              minY: Math.min(acc.minY, point[1]),
              maxX: Math.max(acc.maxX, point[0]),
              maxY: Math.max(acc.maxY, point[1]),
            }),
            { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
          );
          layerMaxX = data.x + bounds.maxX - bounds.minX;
          layerMaxY = data.y + bounds.maxY - bounds.minY;
        } else if (data.type === LayerType.Group) {
          // For groups, use their bounds
          layerMaxX = data.x + (data as any).width;
          layerMaxY = data.y + (data as any).height;
        } else {
          layerMaxX = data.x + (data as any).width;
          layerMaxY = data.y + (data as any).height;
        }
        
        minX = Math.min(minX, layerMinX);
        minY = Math.min(minY, layerMinY);
        maxX = Math.max(maxX, layerMaxX);
        maxY = Math.max(maxY, layerMaxY);
      });
      
      // Add some padding for frame
      const padding = 20;
      const frameX = minX - padding;
      const frameY = minY - padding;
      const frameWidth = maxX - minX + padding * 2;
      const frameHeight = maxY - minY + padding * 2;
      
      // Create a new frame
      const frameId = nanoid();
      const frameLayer = {
        type: LayerType.Frame,
        x: frameX,
        y: frameY,
        width: frameWidth,
        height: frameHeight,
        fill: { r: 255, g: 255, b: 255, a: 0.1 },
        stroke: { r: 0, g: 0, b: 0 },
        opacity: 1,
        name: `Frame ${liveLayerIds.length + 1}`,
        children: selectedLayers.map(({ id }) => id),
        parentId: undefined,
        visible: true,
        locked: false,
        expanded: true,
      };
      
      // Update selected layers to have the frame as parent
      selectedLayers.forEach(({ id, data }) => {
        const updatedLayer = {
          ...data,
          parentId: frameId,
        };
        liveLayers.set(id, new LiveObject(updatedLayer));
      });
      
      // Add the frame to layers
      liveLayers.set(frameId, new LiveObject(frameLayer as any));
      liveLayerIds.push(frameId);
      
      // Select the new frame
      setMyPresence({ selection: [frameId] }, { addToHistory: true });
      
      console.log("Wrapped", selectedLayers.length, "layers in frame", frameId);
    },
    [selection]
  );

  // Ungroup selected group(s) or frame(s)
  const ungroupLayers = useMutation(
    ({ storage, setMyPresence }) => {
      if (!selection || selection.length === 0) return;
      
      const liveLayers = storage.get("layers");
      const liveLayerIds = storage.get("layerIds");
      const newSelection: string[] = [];
      
      selection.forEach(id => {
        const layer = liveLayers.get(id);
        if (!layer) return;
        
        const layerData = layer.toObject();
        
        // Ungroup both Groups and Frames that have children
        if ((layerData.type === LayerType.Group || layerData.type === LayerType.Frame) && 
            layerData.children && layerData.children.length > 0) {
          // Update all children to remove parent relationship
          layerData.children.forEach(childId => {
            const childLayer = liveLayers.get(childId);
            if (childLayer) {
              const childData = childLayer.toObject();
              const updatedChild = {
                ...childData,
                parentId: layerData.parentId, // Inherit grandparent if any
              };
              liveLayers.set(childId, new LiveObject(updatedChild));
              newSelection.push(childId);
            }
          });
          
          // Remove the group/frame layer
          liveLayers.delete(id);
          const layerIndex = liveLayerIds.indexOf(id);
          if (layerIndex > -1) {
            liveLayerIds.delete(layerIndex);
          }
          
          console.log("Ungrouped", layerData.type === LayerType.Group ? "group" : "frame", id, "with", layerData.children.length, "children");
        } else {
          // If it's not a group/frame with children, keep it selected
          newSelection.push(id);
        }
      });
      
      // Select the ungrouped layers
      setMyPresence({ selection: newSelection }, { addToHistory: true });
    },
    [selection]
  );

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if user is typing in an input field
    const activeElement = document.activeElement;
    const isInputField = activeElement && (
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA" ||
      (activeElement as HTMLElement).contentEditable === "true"
    );

    if (isInputField) return;

    const isCtrlOrCmd = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;

    // Prevent default for handled shortcuts
    const shouldPreventDefault = () => {
      if (isCtrlOrCmd) {
        return ["a", "c", "x", "v", "z", "y", "r", "d", "g", "u", "=", "+", "-", "0"].includes(e.key.toLowerCase());
      }
      return ["Delete", "Backspace", "Escape", "f", "F2", "r", "e", "t", "p", "v", "h"].includes(e.key);
    };

    if (shouldPreventDefault()) {
      e.preventDefault();
    }

    // Handle keyboard shortcuts
    switch (e.key.toLowerCase()) {
      case "a":
        if (isCtrlOrCmd) {
          selectAllLayers();
        }
        break;

      case "c":
        if (isCtrlOrCmd) {
          copyLayers();
        }
        break;

      case "x":
        if (isCtrlOrCmd) {
          cutLayers();
        }
        break;

      case "v":
        if (isCtrlOrCmd && !isShift) {
          pasteLayers();
        } else if (!isCtrlOrCmd && setCanvasState) {
          // V key for selection tool
          setCanvasState({ mode: CanvasMode.None });
        }
        break;

      case "d":
        if (isCtrlOrCmd) {
          duplicateLayers();
        }
        break;

      case "z":
        if (isCtrlOrCmd) {
          if (isShift) {
            history.redo();
          } else {
            history.undo();
          }
        }
        break;

      case "y":
        if (isCtrlOrCmd) {
          history.redo();
        }
        break;

      case "r":
        if (isCtrlOrCmd) {
          history.redo();
        } else if (setCanvasState) {
          // R key for rectangle tool
          setCanvasState({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Rectangle,
          });
        }
        break;

      case "e":
        if (setCanvasState) {
          // E key for ellipse tool
          setCanvasState({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Ellipse,
          });
        }
        break;

      case "t":
        if (setCanvasState) {
          // T key for text tool
          setCanvasState({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Text,
          });
        }
        break;

      case "p":
        if (setCanvasState) {
          // P key for pencil/path tool
          setCanvasState({
            mode: CanvasMode.Pencil,
          });
        }
        break;

      case "f":
        if (setCanvasState) {
          // F key for frame tool
          setCanvasState({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Frame,
          });
        }
        break;

      case "h":
        if (setCanvasState) {
          // H key for hand tool
          setCanvasState({
            mode: CanvasMode.Dragging,
            origin: null,
          });
        }
        break;

      case "=":
      case "+":
        if (isCtrlOrCmd && setCamera) {
          // Ctrl/Cmd + Plus for zoom in
          const newZoom = Math.min(camera.zoom * 1.1, 5);
          setCamera({ ...camera, zoom: newZoom });
        }
        break;

      case "-":
        if (isCtrlOrCmd && setCamera) {
          // Ctrl/Cmd + Minus for zoom out
          const newZoom = Math.max(camera.zoom * 0.9, 0.1);
          setCamera({ ...camera, zoom: newZoom });
        }
        break;

      case "0":
        if (isCtrlOrCmd && setCamera) {
          // Ctrl/Cmd + 0 for reset zoom to 100%
          setCamera({ ...camera, zoom: 1 });
        }
        break;

      case "delete":
      case "backspace":
        deleteLayers();
        break;

      case "escape":
        clearSelection();
        break;

      case "F2":
        if (startRename) {
          startRename();
        }
        break;

      case "g":
        if (isCtrlOrCmd) {
          if (isShift) {
            wrapInFrame(); // Ctrl+Shift+G: Wrap in frame
          } else {
            groupLayers(); // Ctrl+G: Group layers
          }
        }
        break;

      case "u":
        if (isCtrlOrCmd && isShift) {
          ungroupLayers(); // Ctrl+Shift+U: Ungroup
        }
        break;
    }
  }, [
    selectAllLayers,
    copyLayers,
    cutLayers,
    pasteLayers,
    duplicateLayers,
    deleteLayers,
    clearSelection,
    groupLayers,
    wrapInFrame,
    ungroupLayers,
    history,
    selection,
    setCanvasState,
    setCamera,
    camera
  ]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    copyLayers,
    cutLayers,
    pasteLayers,
    duplicateLayers,
    clearSelection,
    groupLayers,
    wrapInFrame,
    ungroupLayers,
  };
}
