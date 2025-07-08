import { useMutation } from "@liveblocks/react";
import { useEffect, useRef, useState } from "react";
import { TextLayer } from "@/types";
import { calculateFillStyle, calculateStrokeStyle, getLayerFills, getLayerStrokes, createDefaultFill, createDefaultStroke } from "@/utils";

export default function Text({
  id,
  layer,
  onPointerDown,
}: {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, layerId: string) => void;
}) {
  const {
    x,
    y,
    width,
    height,
    text,
    fontSize,
    fills,
    strokes,
    opacity,
    fontFamily,
    fontWeight,
    rotation,
    textAlign = 'left',
    textDecoration = 'none',
    letterSpacing = 0,
    lineHeight = 1.2,
  } = layer;

  // Backward compatibility: handle layers that might still have old fill/stroke properties
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(text);
  const [actualTextBounds, setActualTextBounds] = useState({ width: width, height: height });
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  const fillStyle = calculateFillStyle(getLayerFills(layer));
  const strokeStyle = calculateStrokeStyle(getLayerStrokes(layer));

  // Calculate actual text dimensions
  useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      const padding = 4; // Small padding around text
      setActualTextBounds({
        width: Math.max(bbox.width + padding * 2, 20), // Minimum width of 20
        height: Math.max(bbox.height + padding * 2, fontSize + padding * 2)
      });
    }
  }, [text, fontSize, fontFamily, fontWeight, letterSpacing]);

  const centerX = x + actualTextBounds.width / 2;
  const centerY = y + actualTextBounds.height / 2;
  const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

  const updateText = useMutation(
    ({ storage }, newText: string) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(id);
      if (layer) {
        layer.update({ text: newText });
        // Update the input value to reflect the change
        setInputValue(newText);
      }
    },
    [id],
  );

  const updateTextAndDimensions = useMutation(
    ({ storage }, newText: string, newWidth?: number, newHeight?: number) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(id);
      if (layer) {
        const updates: any = { text: newText };
        if (newWidth !== undefined) updates.width = newWidth;
        if (newHeight !== undefined) updates.height = newHeight;
        layer.update(updates);
      }
    },
    [id],
  );

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    updateTextAndDimensions(inputValue, actualTextBounds.width, actualTextBounds.height);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      updateTextAndDimensions(inputValue, actualTextBounds.width, actualTextBounds.height);
    }
  };

  return (
    <g key={id} className="group" onDoubleClick={handleDoubleClick} transform={rotationTransform}>
      {isEditing ? (
        <foreignObject x={x} y={y} width={actualTextBounds.width} height={actualTextBounds.height}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              fontWeight: fontWeight,
              textAlign: textAlign,
              textDecoration: textDecoration,
              letterSpacing: `${letterSpacing}px`,
              lineHeight: lineHeight,
              color: fillStyle,
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
            }}
          />
        </foreignObject>
      ) : (
        <>
          <rect
            x={x}
            y={y}
            width={actualTextBounds.width}
            height={actualTextBounds.height}
            fill="none"
            stroke="#0b99ff"
            strokeWidth="2"
            className="pointer-events-none opacity-0 group-hover:opacity-100"
          />
          <text
            ref={textRef}
            onPointerDown={(e) => onPointerDown(e, id)}
            x={textAlign === 'center' ? x + actualTextBounds.width / 2 : textAlign === 'right' ? x + actualTextBounds.width : x + 2}
            y={y + fontSize + 2}
            fontSize={fontSize}
            fill={fillStyle}
            stroke={strokeStyle.stroke}
            strokeWidth={strokeStyle.strokeWidth}
            strokeDasharray={strokeStyle.strokeDasharray}
            opacity={layer.visible !== false ? opacity / 100 : 0}
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            textAnchor={textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start'}
            style={{
              pointerEvents: layer.locked ? "none" : "auto",
              textDecoration: textDecoration,
              letterSpacing: `${letterSpacing}px`,
            }}
          >
            {text}
          </text>
        </>
      )}
    </g>
  );
}