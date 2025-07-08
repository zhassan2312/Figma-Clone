import { EllipseLayer } from "@/types";
import { calculateLayerFillStyle, calculateLayerStrokeStyle } from "@/utils";

export default function Ellipse({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, width, height, fills, strokes, opacity, rotation } = layer;

  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

  const fillStyle = calculateLayerFillStyle(layer);
  const strokeStyle = calculateLayerStrokeStyle(layer);

  return (
    <g className="group" transform={rotationTransform}>
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={width / 2}
        ry={height / 2}
        fill="none"
        stroke="#0b99ff"
        strokeWidth="4"
        className="pointer-events-none opacity-0 group-hover:opacity-100"
      />
      <ellipse
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ 
          opacity: layer.visible !== false ? opacity / 100 : 0,
          pointerEvents: layer.locked ? "none" : "auto",
        }}
        fill={fillStyle}
        stroke={strokeStyle.stroke}
        strokeWidth={strokeStyle.strokeWidth}
        strokeDasharray={strokeStyle.strokeDasharray}
        cx={centerX}
        cy={centerY}
        rx={width / 2}
        ry={height / 2}
      />
    </g>
  );
}