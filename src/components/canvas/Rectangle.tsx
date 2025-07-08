import { RectangleLayer } from "@/types";
import { calculateFillStyle, calculateStrokeStyle, getLayerFills, getLayerStrokes } from "@/utils";

export default function Rectangle({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, width, height, opacity, cornerRadius, rotation } = layer;

  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

  const fillStyle = calculateFillStyle(getLayerFills(layer));
  const strokeStyle = calculateStrokeStyle(getLayerStrokes(layer));

  return (
    <g key={id} className="group" transform={rotationTransform}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke="#0b99ff"
        strokeWidth="4"
        className="pointer-events-none opacity-0 group-hover:opacity-100"
        rx={cornerRadius ?? 0}
        ry={cornerRadius ?? 0}
      />
      <rect
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ 
          opacity: layer.visible !== false ? opacity / 100 : 0,
          pointerEvents: layer.locked ? "none" : "auto",
        }}
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillStyle}
        stroke={strokeStyle.stroke}
        strokeWidth={strokeStyle.strokeWidth}
        strokeDasharray={strokeStyle.strokeDasharray}
        rx={cornerRadius ?? 0}
        ry={cornerRadius ?? 0}
      />
    </g>
  );
}