import { memo } from "react";
import { useStorage } from "@liveblocks/react";
import { GroupLayer } from "@/types";
import LayerComponent from "./LayerComponent";

const Group = memo(
  ({
    id,
    layer,
    onLayerPointerDown,
  }: {
    id: string;
    layer: GroupLayer;
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  }) => {
    const children = layer.children || [];

    return (
      <g
        onPointerDown={(e: React.PointerEvent) => onLayerPointerDown(e, id)}
        style={{
          opacity: layer.visible !== false ? 1 : 0,
          pointerEvents: layer.locked ? "none" : "auto",
        }}
      >
        {/* Invisible bounding rectangle for the group */}
        <rect
          x={layer.x}
          y={layer.y}
          width={layer.width}
          height={layer.height}
          fill="transparent"
          stroke="none"
          style={{ pointerEvents: "all" }}
        />
        
        {/* Render all child layers - they maintain their absolute positions */}
        {children.map((childId) => (
          <LayerComponent
            key={childId}
            id={childId}
            onLayerPointerDown={onLayerPointerDown}
          />
        ))}
      </g>
    );
  }
);

Group.displayName = "Group";

export default Group;
