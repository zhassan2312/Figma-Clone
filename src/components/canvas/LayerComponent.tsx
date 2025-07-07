import { useStorage } from "@liveblocks/react";
import { memo } from "react";
import { LayerType } from "@/types";
import Rectangle from "./Rectangle";
import Ellipse from "./Ellipse";
import Text from "./Text";
import Path from "./Path";
import Frame from "./Frame";
import Group from "./Group";
import Star from "./Star";
import Line from "./Line";
import Arrow from "./Arrow";
import Polygon from "./Polygon";
import Image from "./Image";
import Video from "./Video";
import { colorToCss } from "@/utils";

const LayerComponent = memo(
  ({
    id,
    onLayerPointerDown,
  }: {
    id: string;
    onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  }) => {
    const layer = useStorage((root) => root.layers.get(id));
    if (!layer) {
      return null;
    }

    switch (layer.type) {
      case LayerType.Path:
        return (
          <Path
            onPointerDown={(e: React.PointerEvent) => onLayerPointerDown(e, id)}
            points={layer.points}
            x={layer.x}
            y={layer.y}
            fill={layer.fill ? colorToCss(layer.fill) : "#CCC"}
            stroke={layer.stroke ? colorToCss(layer.stroke) : "#CCC"}
            opacity={layer.opacity}
          />
        );
      case LayerType.Rectangle:
        return (
          <Rectangle onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Ellipse:
        return (
          <Ellipse onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Text:
        return (
          <Text onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Frame:
        return (
          <Frame onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Group:
        return (
          <Group onLayerPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Star:
        return (
          <Star onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Line:
        return (
          <Line onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Arrow:
        return (
          <Arrow onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Polygon:
        return (
          <Polygon onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Image:
        return (
          <Image onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      case LayerType.Video:
        return (
          <Video onPointerDown={onLayerPointerDown} id={id} layer={layer} />
        );
      default:
        return null;
    }
  },
);

LayerComponent.displayName = "LayerComponent";

export default LayerComponent;