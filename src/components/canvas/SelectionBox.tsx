import { useSelf, useStorage } from "@liveblocks/react";
import { memo, useEffect, useRef, useState } from "react";
import useSelectionBounds from "@/hooks/useSelectionBounds";
import { CanvasMode, LayerType, Side, XYWH, Point } from "@/types";
import { pointerEventToCanvasPoint, getLayerCenter, getRotationTransform } from "@/utils";
import { UI_CONSTANTS } from "@/constants";

const SelectionBox = memo(
  ({
    onResizeHandlePointerDown,
    onRotateHandlePointerDown,
    toolMode,
    camera,
  }: {
    onResizeHandlePointerDown: (corner: Side, initalBuild: XYWH, initialPoint?: Point) => void;
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

    // Get the selected layer for special handling
    const selectedLayer = useStorage((root) => {
      if (!soleLayerId) return null;
      return root.layers.get(soleLayerId);
    });

    // Get rotation value from the selected layer
    const selectedLayerRotation = useStorage((root) => {
      if (!soleLayerId) return 0;
      const layer = root.layers.get(soleLayerId);
      return (layer as any)?.rotation || 0;
    });

    const bounds = useSelectionBounds();
    const textRef = useRef<SVGTextElement>(null);
    const textSizeRef = useRef<SVGTextElement>(null);
    const [textWidth, setTextWidth] = useState(0);
    const [actualTextDimensions, setActualTextDimensions] = useState({ width: 0, height: 0 });
    const padding = 16;

    // Adjust handle width based on zoom level
    const handleWidth = Math.max(6, Math.min(12, UI_CONSTANTS.SELECTION.HANDLE_SIZE / (camera?.zoom || 1)));
    const rotateHandleDistance = Math.max(12, 16 / (camera?.zoom || 1));

    // Calculate center point for rotation
    const centerX = bounds ? bounds.x + bounds.width / 2 : 0;
    const centerY = bounds ? bounds.y + bounds.height / 2 : 0;
    const rotationTransform = selectedLayerRotation ? getRotationTransform(selectedLayerRotation, centerX, centerY) : '';

    // Calculate actual text dimensions for text layers
    useEffect(() => {
      if (textRef.current) {
        const bbox = textRef.current.getBBox();
        setTextWidth(bbox.width);
      }
      
      // Calculate actual text dimensions for text layers
      if (textSizeRef.current && selectedLayer?.type === LayerType.Text) {
        const bbox = textSizeRef.current.getBBox();
        setActualTextDimensions({ width: bbox.width, height: bbox.height });
      }
    }, [bounds, selectedLayer]);

    if (!bounds) return null;

    // Special handling for Line and Arrow layers
    const isLineOrArrow = selectedLayer?.type === LayerType.Line || selectedLayer?.type === LayerType.Arrow;
    
    // For text layers, use actual text dimensions if available
    const isTextLayer = selectedLayer?.type === LayerType.Text;
    const textBounds = isTextLayer && actualTextDimensions.width > 0 ? {
      x: bounds.x,
      y: bounds.y,
      width: actualTextDimensions.width,
      height: actualTextDimensions.height
    } : bounds;

    // For line/arrow layers, get the line coordinates
    const lineCoords = isLineOrArrow && selectedLayer ? {
      x1: (selectedLayer as any).x,
      y1: (selectedLayer as any).y,
      x2: (selectedLayer as any).x2,
      y2: (selectedLayer as any).y2,
    } : null;

    return (
      <>
        {/* Hidden text element for measuring actual text dimensions */}
        {isTextLayer && selectedLayer && (
          <text
            ref={textSizeRef}
            x={-10000}
            y={-10000}
            fontSize={(selectedLayer as any).fontSize}
            fontFamily={(selectedLayer as any).fontFamily}
            fontWeight={(selectedLayer as any).fontWeight}
            className="pointer-events-none opacity-0"
          >
            {(selectedLayer as any).text}
          </text>
        )}

        {/* Line/Arrow Selection: Show line with endpoints */}
        {isLineOrArrow && lineCoords ? (
          <g transform={rotationTransform}>
            {/* Selection line */}
            <line
              className="pointer-events-none"
              x1={lineCoords.x1}
              y1={lineCoords.y1}
              x2={lineCoords.x2}
              y2={lineCoords.y2}
              stroke={UI_CONSTANTS.SELECTION.STROKE}
              strokeWidth={UI_CONSTANTS.SELECTION.STROKE_WIDTH * 2}
              strokeDasharray="4,4"
            />
            
            {isShowingHandles && (
              <>
                {/* Start point handle */}
                <circle
                  style={{
                    cursor: "move",
                  }}
                  className="fill-white stroke-[#0b99ff] stroke-[1px]"
                  cx={lineCoords.x1}
                  cy={lineCoords.y1}
                  r={handleWidth / 2}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onResizeHandlePointerDown(Side.Left, bounds);
                  }}
                />
                
                {/* End point handle */}
                <circle
                  style={{
                    cursor: "move",
                  }}
                  className="fill-white stroke-[#0b99ff] stroke-[1px]"
                  cx={lineCoords.x2}
                  cy={lineCoords.y2}
                  r={handleWidth / 2}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    onResizeHandlePointerDown(Side.Right, bounds);
                  }}
                />
                
                {/* Middle handle for moving the entire line */}
                <circle
                  style={{
                    cursor: "move",
                  }}
                  className="fill-white stroke-[#0b99ff] stroke-[1px]"
                  cx={(lineCoords.x1 + lineCoords.x2) / 2}
                  cy={(lineCoords.y1 + lineCoords.y2) / 2}
                  r={handleWidth / 2}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const point = pointerEventToCanvasPoint(e, camera || { x: 0, y: 0, zoom: 1 });
                    onResizeHandlePointerDown(Side.Bottom, bounds, point);
                  }}
                />
              </>
            )}
          </g>
        ) : (
          /* Standard rectangular selection box */
          <g transform={rotationTransform}>
            {/* Main selection rectangle - use text bounds for text layers */}
            <rect
              className="pointer-events-none fill-transparent stroke-[#0b99ff] stroke-[1px]"
              x={isTextLayer ? textBounds.x : bounds.x}
              y={isTextLayer ? textBounds.y : bounds.y}
              width={isTextLayer ? textBounds.width : bounds.width}
              height={isTextLayer ? textBounds.height : bounds.height}
            />
            
            {isShowingHandles && (
              <>
                {/* Resize handles - use appropriate bounds */}
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
                
                {/* Rotation handles - only show for non-line/arrow layers */}
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
        )}
        
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