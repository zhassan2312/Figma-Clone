import { memo } from "react";
import { calculateStrokeStyle, getLayerStrokes } from "@/utils";
import { ArrowLayer } from "@/types";

const Arrow = memo(
  ({
    id,
    layer,
    onPointerDown,
  }: {
    id: string;
    layer: ArrowLayer;
    onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  }) => {
    const { 
      x, 
      y, 
      x2, 
      y2, 
      strokes, 
      opacity, 
      arrowStart = false, 
      arrowEnd = true, 
      arrowSize = 10,
      rotation
    } = layer;

    // Calculate center point for rotation
    const centerX = (x + x2) / 2;
    const centerY = (y + y2) / 2;
    const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

    const strokeStyle = calculateStrokeStyle(getLayerStrokes(layer));

    // Calculate arrow head points
    const angle = Math.atan2(y2 - y, x2 - x);
    const arrowLength = arrowSize;
    const arrowAngle = Math.PI / 6; // 30 degrees

    const generateArrowHead = (atStart: boolean) => {
      const baseX = atStart ? x : x2;
      const baseY = atStart ? y : y2;
      // For start arrow, point in opposite direction; for end arrow, point in line direction
      const direction = atStart ? angle : angle + Math.PI;

      const point1X = baseX + Math.cos(direction - arrowAngle) * arrowLength;
      const point1Y = baseY + Math.sin(direction - arrowAngle) * arrowLength;
      const point2X = baseX + Math.cos(direction + arrowAngle) * arrowLength;
      const point2Y = baseY + Math.sin(direction + arrowAngle) * arrowLength;

      return `M ${baseX} ${baseY} L ${point1X} ${point1Y} M ${baseX} ${baseY} L ${point2X} ${point2Y}`;
    };

    return (
      <g
        className="pointer-events-auto"
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{
          opacity: layer.visible !== false ? opacity / 100 : 0,
          pointerEvents: layer.locked ? "none" : "auto",
        }}
        transform={rotationTransform}
      >
        {/* Main line */}
        <line
          x1={x}
          y1={y}
          x2={x2}
          y2={y2}
          stroke={strokeStyle.stroke}
          strokeWidth={strokeStyle.strokeWidth}
          strokeDasharray={strokeStyle.strokeDasharray}
          strokeLinecap="round"
        />
        
        {/* Arrow heads */}
        {arrowStart && (
          <path
            d={generateArrowHead(true)}
            stroke={strokeStyle.stroke}
            strokeWidth={strokeStyle.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        )}
        {arrowEnd && (
          <path
            d={generateArrowHead(false)}
            stroke={strokeStyle.stroke}
            strokeWidth={strokeStyle.strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        )}
      </g>
    );
  }
);

Arrow.displayName = "Arrow";

export default Arrow;
