import { colorToCss } from "@/utils";
import { FrameLayer } from "@/types";

export default function Frame({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: FrameLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, width, height, fill, stroke, opacity, cornerRadius = 0, name } = layer;

  return (
    <g>
      {/* Frame background */}
      <rect
        className="pointer-events-auto"
        onPointerDown={(e) => onPointerDown(e, id)}
        x={x}
        y={y}
        width={width}
        height={height}
        rx={cornerRadius}
        ry={cornerRadius}
        fill={fill ? colorToCss(fill) : "transparent"}
        stroke={stroke ? colorToCss(stroke) : "#999"}
        strokeWidth="1"
        strokeDasharray="none"
        opacity={opacity}
        style={{
          transform: `translate(0px, 0px)`,
        }}
      />
      
      {/* Frame label (name) */}
      {name && (
        <text
          x={x}
          y={y - 5}
          fontSize="12"
          fill="#666"
          fontFamily="Inter, system-ui, sans-serif"
          className="pointer-events-none select-none"
        >
          {name}
        </text>
      )}
      
      {/* Corner indicators for frames */}
      <g className="pointer-events-none">
        {/* Top-left corner */}
        <rect
          x={x - 2}
          y={y - 2}
          width="8"
          height="2"
          fill="#007AFF"
          opacity="0.8"
        />
        <rect
          x={x - 2}
          y={y - 2}
          width="2"
          height="8"
          fill="#007AFF"
          opacity="0.8"
        />
        
        {/* Top-right corner */}
        <rect
          x={x + width - 6}
          y={y - 2}
          width="8"
          height="2"
          fill="#007AFF"
          opacity="0.8"
        />
        <rect
          x={x + width}
          y={y - 2}
          width="2"
          height="8"
          fill="#007AFF"
          opacity="0.8"
        />
        
        {/* Bottom-left corner */}
        <rect
          x={x - 2}
          y={y + height - 6}
          width="2"
          height="8"
          fill="#007AFF"
          opacity="0.8"
        />
        <rect
          x={x - 2}
          y={y + height}
          width="8"
          height="2"
          fill="#007AFF"
          opacity="0.8"
        />
        
        {/* Bottom-right corner */}
        <rect
          x={x + width}
          y={y + height - 6}
          width="2"
          height="8"
          fill="#007AFF"
          opacity="0.8"
        />
        <rect
          x={x + width - 6}
          y={y + height}
          width="8"
          height="2"
          fill="#007AFF"
          opacity="0.8"
        />
      </g>
    </g>
  );
}
