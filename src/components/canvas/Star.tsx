import { memo } from "react";
import { colorToCss } from "@/utils";
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
    const { x, y, width, height, fill, stroke, opacity, vertices = 5, innerRadius = 0.5 } = layer;

    // Generate star path
    const generateStarPath = () => {
      const centerX = width / 2;
      const centerY = height / 2;
      const outerRadius = Math.min(width, height) / 2;
      const innerRadiusCalculated = outerRadius * innerRadius;
      
      let path = "";
      
      for (let i = 0; i < vertices * 2; i++) {
        const angle = (i * Math.PI) / vertices - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadiusCalculated;
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
      <path
        className="pointer-events-auto"
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          transform: `translate(${x}px, ${y}px)`,
          opacity: layer.visible !== false ? opacity / 100 : 0,
          pointerEvents: layer.locked ? "none" : "auto",
        }}
        d={generateStarPath()}
        fill={fill ? colorToCss(fill) : "transparent"}
        stroke={stroke ? colorToCss(stroke) : "#000"}
        strokeWidth="1"
      />
    );
  }
);

Star.displayName = "Star";

export default Star;
