import { memo } from "react";
import { ImageLayer } from "@/types";

const Image = memo(
  ({
    id,
    layer,
    onPointerDown,
  }: {
    id: string;
    layer: ImageLayer;
    onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  }) => {
    const { x, y, width, height, opacity, src, rotation } = layer;

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const rotationTransform = rotation ? `rotate(${rotation} ${centerX} ${centerY})` : '';

    return (
      <foreignObject
      key={id}

        className="pointer-events-auto"
        onPointerDown={(e) => onPointerDown(e, id)}
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          opacity: layer.visible !== false ? opacity / 100 : 0,
          pointerEvents: layer.locked ? "none" : "auto",
        }}
        transform={rotationTransform}
      >
        {src ? (
          <img
            src={src}
            alt={layer.name || "Image"}
            className="h-full w-full object-cover"
            draggable={false}
            onError={(e) => {
              // Show placeholder on error
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.parentElement!.innerHTML = `
                <div style="
                  width: 100%; 
                  height: 100%; 
                  background: #f0f0f0; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  color: #666; 
                  font-size: 12px;
                  border: 1px dashed #ccc;
                ">
                  Image not found
                </div>
              `;
            }}
          />
        ) : (
          <div 
            style={{
              width: "100%", 
              height: "100%", 
              background: "#f8f9fa", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#6c757d", 
              fontSize: "12px",
              border: "2px dashed #dee2e6",
              borderRadius: "4px"
            }}
          >
            No image selected
          </div>
        )}
      </foreignObject>
    );
  }
);

Image.displayName = "Image";

export default Image;
