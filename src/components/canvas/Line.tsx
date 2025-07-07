import { memo } from "react";
import { colorToCss } from "@/utils";
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
    const { x, y, x2, y2, stroke, opacity, strokeWidth = 2, isDashed = false, dashWidth = 5, dashGap = 5, rotation } = layer;

    // Calculate center point for rotation
    const centerX = (x + x2) / 2;
    const centerY = (y + y2) / 2;
    const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

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
        stroke={stroke ? colorToCss(stroke) : "#000"}
        strokeWidth={strokeWidth}
        strokeDasharray={isDashed ? `${dashWidth},${dashGap}` : "none"}
        strokeLinecap="round"
        transform={rotationTransform}
      />
    );
  }
);

Line.displayName = "Line";

export default Line;
