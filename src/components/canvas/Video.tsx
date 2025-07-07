import { memo } from "react";
import { VideoLayer } from "@/types";

const Video = memo(
  ({
    id,
    layer,
    onPointerDown,
  }: {
    id: string;
    layer: VideoLayer;
    onPointerDown: (e: React.PointerEvent, layerId: string) => void;
  }) => {
    const { x, y, width, height, opacity, src, poster, controls = true, autoplay = false, muted = true, rotation } = layer;

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
          <video
            src={src}
            poster={poster}
            controls={controls}
            autoPlay={autoplay}
            muted={muted}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Show placeholder on error
              const target = e.target as HTMLVideoElement;
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
                  Video not found
                </div>
              `;
            }}
          >
            Your browser does not support the video tag.
          </video>
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
            No video selected
          </div>
        )}
      </foreignObject>
    );
  }
);

Video.displayName = "Video";

export default Video;
