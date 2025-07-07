import { useSelf, useStorage } from "@liveblocks/react";
import { memo, useEffect, useRef, useState } from "react";
import useSelectionBounds from "@/hooks/useSelectionBounds";
import { LayerType, Side, XYWH } from "@/types";

const handleWidth = 8;

const SelectionBox = memo(
  ({
    onResizeHandlePointerDown,
    onRotateHandlePointerDown,
  }: {
    onResizeHandlePointerDown: (corner: Side, initalBuild: XYWH) => void;
    onRotateHandlePointerDown: (initialBounds: XYWH, center: { x: number; y: number }, initialAngle: number) => void;
  }) => {
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null,
    );

    const isShowingHandles = useStorage(
      (root) =>
        soleLayerId && root.layers.get(soleLayerId)?.type !== LayerType.Path,
    );

    const bounds = useSelectionBounds();
    const textRef = useRef<SVGTextElement>(null);
    const [textWidth, setTextWidth] = useState(0);
    const padding = 16;

    useEffect(() => {
      if (textRef.current) {
        const bbox = textRef.current.getBBox();
        setTextWidth(bbox.width);
      }
    }, [bounds]);

    if (!bounds) return null;

    return (
      <>
        <rect
          style={{ transform: `translate(${bounds.x}px, ${bounds.y}px)` }}
          className="pointer-events-none fill-transparent stroke-[#0b99ff] stroke-[1px]"
          width={bounds.width}
          height={bounds.height}
        />
        <rect
          className="fill-[#ob99ff]"
          x={bounds.x + bounds.width / 2 - (textWidth + padding) / 2}
          y={bounds.y + bounds.height + 10}
          width={textWidth + padding}
          height={20}
          rx={4}
        />
        <text
          ref={textRef}
          style={{
            transform: `translate(${bounds.x + bounds.width / 2}px, ${bounds?.y + bounds.height + 25}px)`,
          }}
          textAnchor="middle"
          className="pointer-events-none select-none fill-white text-[11px]"
        >
          {Math.round(bounds.width)} x {Math.round(bounds.height)}
        </text>
        {isShowingHandles && (
          <>
            {/* Resize handles */}
            <rect
              style={{
                cursor: "nwse-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x - handleWidth / 2}px, ${bounds.y - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Left, bounds);
              }}
            />
            <rect
              style={{
                cursor: "ns-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x + bounds.width / 2 - handleWidth / 2}px, ${bounds.y - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top, bounds);
              }}
            />
            <rect
              style={{
                cursor: "nesw-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x + bounds.width - handleWidth / 2}px, ${bounds.y - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Top + Side.Right, bounds);
              }}
            />
            <rect
              style={{
                cursor: "ew-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x - handleWidth / 2}px, ${bounds.y + bounds.height / 2 - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Left, bounds);
              }}
            />
            <rect
              style={{
                cursor: "nesw-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x - handleWidth / 2}px, ${bounds.y + bounds.height - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Left, bounds);
              }}
            />
            <rect
              style={{
                cursor: "ew-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x + bounds.width - handleWidth / 2}px, ${bounds.y + bounds.height / 2 - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Right, bounds);
              }}
            />
            <rect
              style={{
                cursor: "nwse-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x + bounds.width - handleWidth / 2}px, ${bounds.y + bounds.height - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom + Side.Right, bounds);
              }}
            />
            <rect
              style={{
                cursor: "ns-resize",
                width: `${handleWidth}px`,
                height: `${handleWidth}px`,
                transform: `translate(${bounds.x + bounds.width / 2 - handleWidth / 2}px, ${bounds.y + bounds.height - handleWidth / 2}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlePointerDown(Side.Bottom, bounds);
              }}
            />
            
            {/* Rotation handles - circular handles at each corner with rotation icon */}
            <circle
              style={{
                cursor: "grab",
                transform: `translate(${bounds.x - 16}px, ${bounds.y - 16}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              cx={handleWidth / 2}
              cy={handleWidth / 2}
              r={handleWidth / 2}
              onPointerDown={(e) => {
                e.stopPropagation();
                const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
                const initialAngle = Math.atan2(bounds.y - 16 - center.y, bounds.x - 16 - center.x);
                onRotateHandlePointerDown(bounds, center, initialAngle);
              }}
            />
            <circle
              style={{
                cursor: "grab",
                transform: `translate(${bounds.x + bounds.width + 8}px, ${bounds.y - 16}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              cx={handleWidth / 2}
              cy={handleWidth / 2}
              r={handleWidth / 2}
              onPointerDown={(e) => {
                e.stopPropagation();
                const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
                const initialAngle = Math.atan2(bounds.y - 16 - center.y, bounds.x + bounds.width + 8 - center.x);
                onRotateHandlePointerDown(bounds, center, initialAngle);
              }}
            />
            <circle
              style={{
                cursor: "grab",
                transform: `translate(${bounds.x - 16}px, ${bounds.y + bounds.height + 8}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              cx={handleWidth / 2}
              cy={handleWidth / 2}
              r={handleWidth / 2}
              onPointerDown={(e) => {
                e.stopPropagation();
                const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
                const initialAngle = Math.atan2(bounds.y + bounds.height + 8 - center.y, bounds.x - 16 - center.x);
                onRotateHandlePointerDown(bounds, center, initialAngle);
              }}
            />
            <circle
              style={{
                cursor: "grab",
                transform: `translate(${bounds.x + bounds.width + 8}px, ${bounds.y + bounds.height + 8}px)`,
              }}
              className="fill-white stroke-[#0b99ff] stroke-[1px]"
              cx={handleWidth / 2}
              cy={handleWidth / 2}
              r={handleWidth / 2}
              onPointerDown={(e) => {
                e.stopPropagation();
                const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
                const initialAngle = Math.atan2(bounds.y + bounds.height + 8 - center.y, bounds.x + bounds.width + 8 - center.x);
                onRotateHandlePointerDown(bounds, center, initialAngle);
              }}
            />
          </>
        )}
      </>
    );
  },
);

SelectionBox.displayName = "SelectionBox";

export default SelectionBox;