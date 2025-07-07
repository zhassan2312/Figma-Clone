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
        return ["a", "c", "x", "v", "z", "y", "r", "d", "=", "+", "-", "0"].includes(e.key.toLowerCase());
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
    }
  }, [
    selectAllLayers,
    copyLayers,
    cutLayers,
    pasteLayers,
    duplicateLayers,
    deleteLayers,
    clearSelection,
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
  };
}
