import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "@/utils";

export default function Path({
  x,
  y,
  stroke,
  fill,
  opacity,
  points,
  rotation,
  onPointerDown,
}: {
  x: number;
  y: number;
  stroke?: string;
  fill: string;
  opacity: number;
  points: number[][];
  rotation?: number;
  onPointerDown?: (e: React.PointerEvent) => void;
}) {
  const pathData = getSvgPathFromStroke(
    getStroke(points, {
      size: 16,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
    }),
  );

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
        onPointerDown={onPointerDown}
        d={pathData}
        fill={fill}
        stroke={stroke ?? "#CCC"}
        strokeWidth={1}
        opacity={`${opacity ?? 100}%`}
      />
    </g>
  );
}