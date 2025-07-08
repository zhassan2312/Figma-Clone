import { memo } from "react";
import { calculateLayerStrokeStyle } from "@/utils";
import { LineLayer } from "@/types";

const Line = memo(
  ({
    id,
    layer,
    onPointerDown,
  }: {
    id: string;
    layer: LineLayer;
    onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  }) => {
    const { x, y, x2, y2, strokes, opacity, rotation } = layer;

    // Calculate center point for rotation
    const centerX = (x + x2) / 2;
    const centerY = (y + y2) / 2;
    const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

    const strokeStyle = calculateLayerStrokeStyle(layer);

    return (
      <line
        key={id}
        className="pointer-events-auto"
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          opacity: layer.visible !== false ? opacity / 100 : 0,
          pointerEvents: layer.locked ? "none" : "auto",
        }}
        x1={x}
        y1={y}
        x2={x2}
        y2={y2}
        stroke={strokeStyle.stroke}
        strokeWidth={strokeStyle.strokeWidth}
        strokeDasharray={strokeStyle.strokeDasharray}
        strokeLinecap="round"
        transform={rotationTransform}
      />
    );
  }
);

Line.displayName = "Line";

export default Line;
