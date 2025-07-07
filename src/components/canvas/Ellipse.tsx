import { EllipseLayer, RectangleLayer } from "@/types";
import { colorToCss } from "@/utils";

export default function Ellipse({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: EllipseLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, width, height, fill, stroke, opacity, rotation } = layer;

  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

  return (
    <g className="group">
      <ellipse
        style={{ transform: `translate(${x}px, ${y}px)` }}
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        fill="none"
        stroke="#0b99ff"
        strokeWidth="4"
        className="pointer-events-none opacity-0 group-hover:opacity-100"
        transform={rotationTransform}
      />
      <ellipse
        onPointerDown={(e) => onPointerDown(e, id)}
        style={{ 
          transform: `translate(${x}px, ${y}px)`,
          opacity: layer.visible !== false ? opacity / 100 : 0,
          pointerEvents: layer.locked ? "none" : "auto",
        }}
        fill={fill ? colorToCss(fill) : "#CCC"}
        stroke={stroke ? colorToCss(stroke) : "#CCC"}
        cx={width / 2}
        cy={height / 2}
        rx={width / 2}
        ry={height / 2}
        strokeWidth="1"
        transform={rotationTransform}
      />
    </g>
  );
}