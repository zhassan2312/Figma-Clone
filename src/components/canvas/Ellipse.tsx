import { EllipseLayer } from "@/types";
import { getLayerCenter, getLayerRotationTransform, getLayerStyles } from "@/utils";

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

  const center = getLayerCenter(layer);
  const rotationTransform = getLayerRotationTransform(layer);
  const { fillStyle, strokeStyle } = getLayerStyles(layer);

  return (
    <g className="group" transform={rotationTransform}>
      <ellipse
        cx={center.x}
        cy={center.y}
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
        cx={center.x}
        cy={center.y}
        rx={width / 2}
        ry={height / 2}
      />
    </g>
  );
}