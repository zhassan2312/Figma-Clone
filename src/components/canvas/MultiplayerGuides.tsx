import {
  shallow,
  useOthersConnectionIds,
  useOthersMapped,
} from "@liveblocks/react";
import { connection } from "next/server";
import { memo } from "react";
import Cursor from "./Cursor";
import Path from "./Path";
import { createDefaultFill, createDefaultStroke } from "@/utils";
import { LayerType } from "@/types";

function Cursors() {
  const ids = useOthersConnectionIds();
  return (
    <>
      {ids.map((connectionId) => (
        <Cursor key={connectionId} connectionId={connectionId} />
      ))}
    </>
  );
}

function Drafts() {
  const others = useOthersMapped(
    (other) => ({
      pencilDraft: other.presence.pencilDraft,
      penColor: other.presence.penColor,
    }),
    shallow,
  );

  return (
    <>
      {others.map(([key, other]) => {
        if (other.pencilDraft) {
          return (
            <Path
              key={key}
              id={`multiplayer-path-${key}`}
              layer={{
                type: LayerType.Path,
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                fills: [createDefaultFill(other.penColor || { r: 217, g: 217, b: 217 })],
                strokes: [createDefaultStroke(other.penColor || { r: 217, g: 217, b: 217 })],
                opacity: 100,
                points: other.pencilDraft,
                visible: true,
                locked: false,
              }}
              onPointerDown={() => {}}
            />
          );
        }
        return null;
      })}
    </>
  );
}

export default memo(function MultiplayerGuides() {
  return (
    <>
      <Cursors />
      <Drafts />
    </>
  );
});