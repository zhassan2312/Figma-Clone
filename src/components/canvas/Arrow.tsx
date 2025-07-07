import { memo } from "react";
import { colorToCss } from "@/utils";
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
      stroke, 
      opacity, 
      strokeWidth = 2, 
      isDashed = false, 
      arrowStart = false, 
      arrowEnd = true, 
      arrowSize = 10 
    } = layer;

    // Calculate arrow head points
    const angle = Math.atan2(y2 - y, x2 - x);
    const arrowLength = arrowSize;
    const arrowAngle = Math.PI / 6; // 30 degrees

    const generateArrowHead = (atStart: boolean) => {
      const baseX = atStart ? x : x2;
      const baseY = atStart ? y : y2;
      const direction = atStart ? angle + Math.PI : angle;

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
      >
        {/* Main line */}
        <line
          x1={x}
          y1={y}
          x2={x2}
          y2={y2}
          stroke={stroke ? colorToCss(stroke) : "#000"}
          strokeWidth={strokeWidth}
          strokeDasharray={isDashed ? "5,5" : "none"}
          strokeLinecap="round"
        />
        
        {/* Arrow heads */}
        {arrowStart && (
          <path
            d={generateArrowHead(true)}
            stroke={stroke ? colorToCss(stroke) : "#000"}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
        )}
        {arrowEnd && (
          <path
            d={generateArrowHead(false)}
            stroke={stroke ? colorToCss(stroke) : "#000"}
            strokeWidth={strokeWidth}
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
