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
    const { x, y, x2, y2, stroke, opacity, strokeWidth = 2, isDashed = false } = layer;

    return (
      <line
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
        strokeDasharray={isDashed ? "5,5" : "none"}
        strokeLinecap="round"
      />
    );
  }
);

Line.displayName = "Line";

export default Line;
