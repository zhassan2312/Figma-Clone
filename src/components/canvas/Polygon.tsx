import { memo } from "react";
import { calculateFillStyle, calculateStrokeStyle, getLayerFills, getLayerStrokes } from "@/utils";
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
    const { x, y, width, height, fills, strokes, opacity, sides = 6, rotation } = layer;

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

    const fillStyle = calculateFillStyle(getLayerFills(layer));
    const strokeStyle = calculateStrokeStyle(getLayerStrokes(layer));

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
      <g key={id} transform={`translate(${x}, ${y}) ${rotationTransform}`}>
        <polygon
          className="pointer-events-auto"
          onPointerDown={(e) => onPointerDown(e, id)}
          style={{
            opacity: layer.visible !== false ? opacity / 100 : 0,
            pointerEvents: layer.locked ? "none" : "auto",
          }}
          points={generatePolygonPoints()}
          fill={fillStyle}
          stroke={strokeStyle.stroke}
          strokeWidth={strokeStyle.strokeWidth}
          strokeDasharray={strokeStyle.strokeDasharray}
        />
      </g>
    );
  }
);

Polygon.displayName = "Polygon";

export default Polygon;
