import { RectangleLayer } from "@/types";
import { colorToCss } from "@/utils";

export default function Rectangle({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: RectangleLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, width, height, fill, stroke, opacity, cornerRadius, rotation } = layer;

  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

  return (
    <g key={id} className="group">
      <rect
        style={{ transform: `translate(${x}px, ${y}px)` }}
        width={width}
        height={height}
        fill="none"
        stroke="#0b99ff"
        strokeWidth="4"
        className="pointer-events-none opacity-0 group-hover:opacity-100"
        transform={rotationTransform}
      />
      <rect
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ 
          transform: `translate(${x}px, ${y}px)`,
          opacity: layer.visible !== false ? opacity / 100 : 0,
          pointerEvents: layer.locked ? "none" : "auto",
        }}
        width={width}
        height={height}
        fill={fill ? colorToCss(fill) : "#CCC"}
        strokeWidth={1}
        stroke={stroke ? colorToCss(stroke) : "#CCC"}
        rx={cornerRadius ?? 0}
        ry={cornerRadius ?? 0}
        transform={rotationTransform}
      />
    </g>
  );
}