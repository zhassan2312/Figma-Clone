import { calculateFillStyle, calculateStrokeStyle, getLayerFills, getLayerStrokes } from "@/utils";
import { FrameLayer } from "@/types";
import { useStorage } from "@liveblocks/react";
import LayerComponent from "./LayerComponent";

export default function Frame({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: FrameLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, width, height, fills, strokes, opacity, cornerRadius = 0, name, children = [], rotation } = layer;
  const layers = useStorage((root) => root.layers);

  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

  const fillStyle = calculateFillStyle(getLayerFills(layer));
  const strokeStyle = calculateStrokeStyle(getLayerStrokes(layer));

  return (
    <g key={id}>
      {/* Clipping mask for frame contents */}
      <defs>
        <clipPath id={`frame-clip-${id}`}>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx={cornerRadius}
            ry={cornerRadius}
            transform={rotationTransform}
          />
        </clipPath>
      </defs>
      
      {/* Rotated frame content */}
      <g transform={rotationTransform}>
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
          fill={fillStyle}
          stroke={strokeStyle.stroke}
          strokeWidth={strokeStyle.strokeWidth}
          strokeDasharray={strokeStyle.strokeDasharray}
          opacity={layer.visible !== false ? opacity / 100 : 0}
          style={{
            pointerEvents: layer.locked ? "none" : "auto",
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
      
      {/* Frame children (clipped to frame bounds) */}
      <g clipPath={`url(#frame-clip-${id})`}>
        {children.filter((childId) => {
          const childLayer = layers?.get(childId);
          return childLayer?.visible ?? true; // Only render visible children
        }).map((childId) => (
          <LayerComponent
            key={childId}
            id={childId}
            onLayerPointerDown={onPointerDown}
          />
        ))}
      </g>
    </g>
  );
}
