"use client";

import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react";
import { ReactNode } from "react";
import { Layer } from "@/types";
import { LoadingSpinner } from "../common";

function RoomLoadingFallback() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/figma-logo.svg"
          alt="Figma logo"
          className="h-[50px] w-[50px] animate-bounce"
        />
        <div className="flex items-center gap-2">
          <LoadingSpinner size="small" />
          <h1 className="text-sm font-normal text-gray-600">Connecting to room...</h1>
        </div>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        Setting up collaborative workspace
      </div>
    </div>
  );
}

export function Room({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks">
      <RoomProvider
        id={roomId}
        initialPresence={{
          selection: [],
          cursor: null,
          penColor: null,
          pencilDraft: null,
        }}
        initialStorage={{
          roomColor: { r: 30, g: 30, b: 30 },
          layers: new LiveMap<string, LiveObject<Layer>>(),
          layerIds: new LiveList([]),
        }}
      >
        <ClientSideSuspense fallback={<RoomLoadingFallback />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}