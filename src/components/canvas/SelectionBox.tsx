import { useSelf, useStorage } from "@liveblocks/react";
import { memo, useEffect, useRef, useState } from "react";
import useSelectionBounds from "@/hooks/useSelectionBounds";
import { CanvasMode, LayerType, Side, XYWH } from "@/types";

const SelectionBox = memo(
  ({
    onResizeHandlePointerDown,
    onRotateHandlePointerDown,
    toolMode,
    camera,
  }: {
    onResizeHandlePointerDown: (corner: Side, initalBuild: XYWH) => void;
    onRotateHandlePointerDown: (initialBounds: XYWH, center: { x: number; y: number }, initialAngle: number) => void;
    toolMode?: CanvasMode;
    camera?: { x: number; y: number; zoom: number };
  }) => {
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null,
    );

    const isShowingHandles = useStorage(
      (root) =>
        soleLayerId && root.layers.get(soleLayerId)?.type !== LayerType.Path,
    );

    // Get rotation value from the selected layer
    const selectedLayerRotation = useStorage((root) => {
      if (!soleLayerId) return 0;
      const layer = root.layers.get(soleLayerId);
      return (layer as any)?.rotation || 0;
    });

    const bounds = useSelectionBounds();
    const textRef = useRef<SVGTextElement>(null);
    const [textWidth, setTextWidth] = useState(0);
    const padding = 16;

    // Adjust handle width based on zoom level
    const handleWidth = Math.max(6, Math.min(12, 8 / (camera?.zoom || 1)));
    const rotateHandleDistance = Math.max(12, 16 / (camera?.zoom || 1));

    // Calculate center point for rotation
    const centerX = bounds ? bounds.x + bounds.width / 2 : 0;
    const centerY = bounds ? bounds.y + bounds.height / 2 : 0;
    const rotationTransform = selectedLayerRotation ? `rotate(${selectedLayerRotation} ${centerX} ${centerY})` : '';

    useEffect(() => {
      if (textRef.current) {
        const bbox = textRef.current.getBBox();
        setTextWidth(bbox.width);
      }
    }, [bounds]);

    if (!bounds) return null;

    return (
      <>
        {/* Rotated selection box and handles */}
        <g transform={rotationTransform}>
          {/* Main selection rectangle */}
          <rect
            className="pointer-events-none fill-transparent stroke-[#0b99ff] stroke-[1px]"
            x={bounds.x}
            y={bounds.y}
            width={bounds.width}
            height={bounds.height}
          />
          
          {isShowingHandles && (
            <>
              {/* Resize handles */}
              <rect
                style={{
                  cursor: "nwse-resize",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                x={bounds.x - handleWidth / 2}
                y={bounds.y - handleWidth / 2}
                width={handleWidth}
                height={handleWidth}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onResizeHandlePointerDown(Side.Top + Side.Left, bounds);
                }}
              />
              <rect
                style={{
                  cursor: "ns-resize",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                x={bounds.x + bounds.width / 2 - handleWidth / 2}
                y={bounds.y - handleWidth / 2}
                width={handleWidth}
                height={handleWidth}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onResizeHandlePointerDown(Side.Top, bounds);
                }}
              />
              <rect
                style={{
                  cursor: "nesw-resize",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                x={bounds.x + bounds.width - handleWidth / 2}
                y={bounds.y - handleWidth / 2}
                width={handleWidth}
                height={handleWidth}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onResizeHandlePointerDown(Side.Top + Side.Right, bounds);
                }}
              />
              <rect
                style={{
                  cursor: "ew-resize",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                x={bounds.x - handleWidth / 2}
                y={bounds.y + bounds.height / 2 - handleWidth / 2}
                width={handleWidth}
                height={handleWidth}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onResizeHandlePointerDown(Side.Left, bounds);
                }}
              />
              <rect
                style={{
                  cursor: "ew-resize",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                x={bounds.x + bounds.width - handleWidth / 2}
                y={bounds.y + bounds.height / 2 - handleWidth / 2}
                width={handleWidth}
                height={handleWidth}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onResizeHandlePointerDown(Side.Right, bounds);
                }}
              />
              <rect
                style={{
                  cursor: "nesw-resize",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                x={bounds.x - handleWidth / 2}
                y={bounds.y + bounds.height - handleWidth / 2}
                width={handleWidth}
                height={handleWidth}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onResizeHandlePointerDown(Side.Bottom + Side.Left, bounds);
                }}
              />
              <rect
                style={{
                  cursor: "nwse-resize",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                x={bounds.x + bounds.width - handleWidth / 2}
                y={bounds.y + bounds.height - handleWidth / 2}
                width={handleWidth}
                height={handleWidth}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onResizeHandlePointerDown(Side.Bottom + Side.Right, bounds);
                }}
              />
              <rect
                style={{
                  cursor: "ns-resize",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                x={bounds.x + bounds.width / 2 - handleWidth / 2}
                y={bounds.y + bounds.height - handleWidth / 2}
                width={handleWidth}
                height={handleWidth}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onResizeHandlePointerDown(Side.Bottom, bounds);
                }}
              />
              
              {/* Rotation handles - circular handles at each corner with rotation cursor */}
              <circle
                style={{
                  cursor: "crosshair",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                cx={bounds.x - rotateHandleDistance + handleWidth / 2}
                cy={bounds.y - rotateHandleDistance + handleWidth / 2}
                r={handleWidth / 2}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
                  const initialAngle = Math.atan2(bounds.y - rotateHandleDistance - center.y, bounds.x - rotateHandleDistance - center.x);
                  onRotateHandlePointerDown(bounds, center, initialAngle);
                }}
              />
              <circle
                style={{
                  cursor: "crosshair",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                cx={bounds.x + bounds.width + rotateHandleDistance - handleWidth / 2}
                cy={bounds.y - rotateHandleDistance + handleWidth / 2}
                r={handleWidth / 2}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
                  const initialAngle = Math.atan2(bounds.y - rotateHandleDistance - center.y, bounds.x + bounds.width + rotateHandleDistance - handleWidth - center.x);
                  onRotateHandlePointerDown(bounds, center, initialAngle);
                }}
              />
              <circle
                style={{
                  cursor: "crosshair",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                cx={bounds.x - rotateHandleDistance + handleWidth / 2}
                cy={bounds.y + bounds.height + rotateHandleDistance - handleWidth / 2}
                r={handleWidth / 2}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
                  const initialAngle = Math.atan2(bounds.y + bounds.height + rotateHandleDistance - handleWidth - center.y, bounds.x - rotateHandleDistance - center.x);
                  onRotateHandlePointerDown(bounds, center, initialAngle);
                }}
              />
              <circle
                style={{
                  cursor: "crosshair",
                }}
                className="fill-white stroke-[#0b99ff] stroke-[1px]"
                cx={bounds.x + bounds.width + rotateHandleDistance - handleWidth / 2}
                cy={bounds.y + bounds.height + rotateHandleDistance - handleWidth / 2}
                r={handleWidth / 2}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
                  const initialAngle = Math.atan2(bounds.y + bounds.height + rotateHandleDistance - handleWidth - center.y, bounds.x + bounds.width + rotateHandleDistance - handleWidth - center.x);
                  onRotateHandlePointerDown(bounds, center, initialAngle);
                }}
              />
            </>
          )}
        </g>
        
        {/* Size display (not rotated, always horizontal) */}
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
      </>
    );
  },
);

SelectionBox.displayName = "SelectionBox";

export default SelectionBox;