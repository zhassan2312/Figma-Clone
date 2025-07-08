import { memo } from "react";
import { calculateLayerFillStyle, calculateLayerStrokeStyle } from "@/utils";
import { StarLayer } from "@/types";

const Star = memo(
  ({
    id,
    layer,
    onPointerDown,
  }: {
    id: string;
    layer: StarLayer;
    onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  }) => {
    const { x, y, width, height, fills, strokes, opacity, vertices, innerRadius, rotation } = layer;

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadiusActual = outerRadius * innerRadius;
    const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

    const fillStyle = calculateLayerFillStyle(layer);
    const strokeStyle = calculateLayerStrokeStyle(layer);

    // Generate star path
    const generateStarPath = () => {
      let path = "";
      const angleStep = (Math.PI * 2) / vertices;
      
      for (let i = 0; i < vertices * 2; i++) {
        const angle = (i * angleStep / 2) - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadiusActual;
        const pointX = centerX + Math.cos(angle) * radius;
        const pointY = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
          path += `M ${pointX} ${pointY}`;
        } else {
          path += ` L ${pointX} ${pointY}`;
        }
      }
      path += " Z";
      return path;
    };

    return (
      <g
        key={id}
        className="pointer-events-auto"
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          opacity: layer.visible !== false ? opacity / 100 : 0,
          pointerEvents: layer.locked ? "none" : "auto",
        }}
      >
        <path
          d={generateStarPath()}
          fill={fillStyle}
          stroke={strokeStyle.stroke}
          strokeWidth={strokeStyle.strokeWidth}
          strokeDasharray={strokeStyle.strokeDasharray}
          transform={rotationTransform}
        />
      </g>
    );
  }
);

Star.displayName = "Star";

export default Star;
