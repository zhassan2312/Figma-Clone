import { memo } from "react";
import { colorToCss } from "@/utils";
import { PolygonLayer } from "@/types";

const Polygon = memo(
  ({
    id,
    layer,
    onPointerDown,
  }: {
    id: string;
    layer: PolygonLayer;
    onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  }) => {
    const { x, y, width, height, fill, stroke, opacity, sides = 6 } = layer;

    // Generate polygon points
    const generatePolygonPoints = () => {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2;
      
      const points = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2; // Start from top
        const pointX = centerX + Math.cos(angle) * radius;
        const pointY = centerY + Math.sin(angle) * radius;
        points.push(`${pointX},${pointY}`);
      }
      
      return points.join(" ");
    };

    return (
      <polygon
        className="pointer-events-auto"
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          transform: `translate(${x}px, ${y}px)`,
          opacity: layer.visible !== false ? opacity / 100 : 0,
          pointerEvents: layer.locked ? "none" : "auto",
        }}
        points={generatePolygonPoints()}
        fill={fill ? colorToCss(fill) : "transparent"}
        stroke={stroke ? colorToCss(stroke) : "#000"}
        strokeWidth="1"
      />
    );
  }
);

Polygon.displayName = "Polygon";

export default Polygon;
