"use client";

import { useEffect, useState } from "react";
import { CanvasMode, LayerType } from "@/types";

interface ToolIndicatorProps {
  canvasState: { mode: CanvasMode; layerType?: LayerType };
  isVisible: boolean;
}

export default function ToolIndicator({ canvasState, isVisible }: ToolIndicatorProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => setShouldRender(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  const getToolName = () => {
    if (canvasState.mode === CanvasMode.None) return "Select";
    if (canvasState.mode === CanvasMode.Pencil) return "Pencil";
    if (canvasState.mode === CanvasMode.Dragging) return "Hand Tool";
    if (canvasState.mode === CanvasMode.Inserting) {
      switch (canvasState.layerType) {
        case LayerType.Rectangle: return "Rectangle";
        case LayerType.Ellipse: return "Ellipse";
        case LayerType.Text: return "Text";
        case LayerType.Frame: return "Frame";
        default: return "Insert";
      }
    }
    return "Tool";
  };

  return (
    <div className={`fixed top-16 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-lg transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {getToolName()}
    </div>
  );
}
