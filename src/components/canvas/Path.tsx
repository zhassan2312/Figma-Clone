import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke, calculateFillStyle, calculateStrokeStyle, getLayerFills, getLayerStrokes } from "@/utils";
import { PathLayer } from "@/types";

export default function Path({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: PathLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const { x, y, fills, strokes, opacity, points, rotation } = layer;
  const pathData = getSvgPathFromStroke(
    getStroke(points, {
      size: 16,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    }),
  );

  const fillStyle = calculateFillStyle(getLayerFills(layer));
  const strokeStyle = calculateStrokeStyle(getLayerStrokes(layer));

  // For rotation, we need to calculate the center of the path's bounding box
  // But since paths are complex, we'll use the x,y position as the origin
  const rotationTransform = rotation ? `rotate(${rotation} ${x} ${y})` : '';

  return (
    <g className="group" transform={`translate(${x}, ${y}) ${rotationTransform}`}>
      <path
        className="pointer-events-none opacity-0 group-hover:opacity-100"
        d={pathData}
        fill="none"
        stroke="#0b99ff"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        onPointerDown={(e) => onPointerDown(e, id)}
        d={pathData}
        fill={fillStyle}
        stroke={strokeStyle.stroke}
        strokeWidth={strokeStyle.strokeWidth}
        strokeDasharray={strokeStyle.strokeDasharray}
        opacity={`${opacity ?? 100}%`}
      />
    </g>
  );
}