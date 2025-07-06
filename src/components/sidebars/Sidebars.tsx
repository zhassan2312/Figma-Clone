"use client";

import { useMutation, useOthers, useSelf, useStorage } from "@liveblocks/react";
import Link from "next/link";
import { AiOutlineFontSize } from "react-icons/ai";
import { IoEllipseOutline, IoSquareOutline } from "react-icons/io5";
import { PiPathLight, PiSidebarSimpleThin } from "react-icons/pi";
import { Color, LayerType } from "~/types";
import { colorToCss, connectionIdToColor, hexToRgb } from "~/utils";
import LayerButton from "./LayerButton";
import NumberInput from "./NumberInput";
import { BsCircleHalf } from "react-icons/bs";
import { RiRoundedCorner } from "react-icons/ri";
import ColorPicker from "./ColorPicker";
import Dropdown from "./Dropdown";
import UserAvatar from "./UserAvatar";
import { User } from "@prisma/client";
import ShareMenu from "./ShareMenu";

export default function Sidebars({
  roomName,
  roomId,
  othersWithAccessToRoom,
  leftIsMinimized,
  setLeftIsMinimized,
}: {
  roomName: string;
  roomId: string;
  othersWithAccessToRoom: User[];
  leftIsMinimized: boolean;
  setLeftIsMinimized: (value: boolean) => void;
}) {
  const me = useSelf();
  const others = useOthers();

  const selectedLayer = useSelf((me) => {
    const selection = me.presence.selection;
    return selection.length === 1 ? selection[0] : null;
  });

  const layer = useStorage((root) => {
    if (!selectedLayer) {
      return null;
    }
    return root.layers.get(selectedLayer);
  });

  const roomColor = useStorage((root) => root.roomColor);

  const layers = useStorage((root) => root.layers);
  const layerIds = useStorage((root) => root.layerIds);
  const reversedLayerIds = [...(layerIds ?? [])].reverse();

  const selection = useSelf((me) => me.presence.selection);

  const setRoomColor = useMutation(({ storage }, newColor: Color) => {
    storage.set("roomColor", newColor);
  }, []);

  const updateLayer = useMutation(
    (
      { storage },
      updates: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        opacity?: number;
        cornerRadius?: number;
        fill?: string;
        stroke?: string;
        fontSize?: number;
        fontWeight?: number;
        fontFamily?: string;
      },
    ) => {
      if (!selectedLayer) return;

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(selectedLayer);

      if (layer) {
        layer.update({
          ...(updates.x !== undefined && { x: updates.x }),
          ...(updates.y !== undefined && { y: updates.y }),
          ...(updates.width !== undefined && { width: updates.width }),
          ...(updates.height !== undefined && { height: updates.height }),
          ...(updates.opacity !== undefined && { opacity: updates.opacity }),
          ...(updates.cornerRadius !== undefined && {
            cornerRadius: updates.cornerRadius,
          }),
          ...(updates.fill !== undefined && { fill: hexToRgb(updates.fill) }),
          ...(updates.stroke !== undefined && {
            stroke: hexToRgb(updates.stroke),
          }),
          ...(updates.fontSize !== undefined && { fontSize: updates.fontSize }),
          ...(updates.fontWeight !== undefined && {
            fontWeight: updates.fontWeight,
          }),
          ...(updates.fontFamily !== undefined && {
            fontFamily: updates.fontFamily,
          }),
        });
      }
    },
    [selectedLayer],
  );

  return (
    <>
      {/* Left Sidebar */}
      {!leftIsMinimized ? (
        <div className="fixed left-0 flex h-screen w-[240px] flex-col border-r border-gray-200 bg-white">
          <div className="p-4">
            <div className="flex justify-between">
              <Link href="/dashboard">
                <img
                  src="/figma-logo.svg"
                  alt="Figma logo"
                  className="h-[18px w-[18px]"
                />
              </Link>
              <PiSidebarSimpleThin
                onClick={() => setLeftIsMinimized(true)}
                className="h-5 w-5 cursor-pointer"
              />
            </div>
            <h2 className="mt-2 scroll-m-20 text-[13px] font-medium">
              {roomName}
            </h2>
          </div>
          <div className="border-b border-gray-200" />
          <div className="flex flex-col gap-1 p-4">
            <span className="mb-2 text-[11px] font-medium">Layers</span>
            {layerIds &&
              reversedLayerIds.map((id) => {
                const layer = layers?.get(id);
                const isSelected = selection?.includes(id);
                if (layer?.type === LayerType.Rectangle) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Rectangle"
                      isSelected={isSelected ?? false}
                      icon={
                        <IoSquareOutline className="h-3 w-3 text-gray-500" />
                      }
                    />
                  );
                } else if (layer?.type === LayerType.Ellipse) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Ellipse"
                      isSelected={isSelected ?? false}
                      icon={
                        <IoEllipseOutline className="h-3 w-3 text-gray-500" />
                      }
                    />
                  );
                } else if (layer?.type === LayerType.Path) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Drawing"
                      isSelected={isSelected ?? false}
                      icon={<PiPathLight className="h-3 w-3 text-gray-500" />}
                    />
                  );
                } else if (layer?.type === LayerType.Text) {
                  return (
                    <LayerButton
                      key={id}
                      layerId={id}
                      text="Text"
                      isSelected={isSelected ?? false}
                      icon={
                        <AiOutlineFontSize className="h-3 w-3 text-gray-500" />
                      }
                    />
                  );
                }
              })}
          </div>
        </div>
      ) : (
        <div className="fixed left-3 top-3 flex h-[48px] w-[250px] items-center justify-between rounded-xl border bg-white p-4">
          <Link href="/dashboard">
            <img
              src="/figma-logo.svg"
              alt="Figma logo"
              className="h-[18px w-[18px]"
            />
          </Link>
          <h2 className="scroll-m-20 text-[13px] font-medium">{roomName}</h2>
          <PiSidebarSimpleThin
            onClick={() => setLeftIsMinimized(false)}
            className="h-5 w-5 cursor-pointer"
          />
        </div>
      )}

      {/* Right Sidebar */}
      {!leftIsMinimized || layer ? (
        <div
          className={`fixed ${leftIsMinimized && layer ? "bottom-3 right-3 top-3 rounded-xl" : ""} ${!leftIsMinimized && !layer ? "h-screen" : ""} ${!leftIsMinimized && layer ? "bottom-0 top-0 h-screen" : ""} right-0 flex w-[240px] flex-col border-l border-gray-200 bg-white`}
        >
          <div className="flex items-center justify-between pr-2">
            <div className="max-36 flex w-full gap-2 overflow-x-scroll p-3 text-xs">
              {me && (
                <UserAvatar
                  color={connectionIdToColor(me.connectionId)}
                  name={me.info.name}
                />
              )}
              {others.map((other) => (
                <UserAvatar
                  key={other.connectionId}
                  color={connectionIdToColor(other.connectionId)}
                  name={other.info.name}
                />
              ))}
            </div>
            <ShareMenu
              roomId={roomId}
              othersWithAccessToRoom={othersWithAccessToRoom}
            />
          </div>
          <div className="border-b border-gray-200"></div>
          {layer ? (
            <>
              <div className="flex flex-col gap-2 p-4">
                <span className="mb-2 text-[11px] font-medium">Position</span>
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] font-medium text-gray-500">
                    Position
                  </p>
                  <div className="flex w-full gap-2">
                    <NumberInput
                      value={layer.x}
                      onChange={(number) => {
                        updateLayer({ x: number });
                      }}
                      classNames="w-1/2"
                      icon={<p>X</p>}
                    />
                    <NumberInput
                      value={layer.y}
                      onChange={(number) => {
                        updateLayer({ y: number });
                      }}
                      classNames="w-1/2"
                      icon={<p>Y</p>}
                    />
                  </div>
                </div>
              </div>

              {layer.type !== LayerType.Path && (
                <>
                  <div className="border-b border-gray-200"></div>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Layout</span>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-medium text-gray-500">
                        Dimensions
                      </p>
                      <div className="flex w-full gap-2">
                        <NumberInput
                          value={layer.width}
                          onChange={(number) => {
                            updateLayer({ width: number });
                          }}
                          classNames="w-1/2"
                          icon={<p>W</p>}
                        />
                        <NumberInput
                          value={layer.height}
                          onChange={(number) => {
                            updateLayer({ height: number });
                          }}
                          classNames="w-1/2"
                          icon={<p>H</p>}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="border-b border-gray-200"></div>
              <div className="flex flex-col gap-2 p-4">
                <span className="mb-2 text-[11px] font-medium">Appearance</span>
                <div className="flex w-full gap-2">
                  <div className="flex w-1/2 flex-col gap-1">
                    <p className="text-[9px] font-medium text-gray-500">
                      Opacity
                    </p>
                    <NumberInput
                      value={layer.opacity}
                      min={0}
                      max={100}
                      onChange={(number) => {
                        updateLayer({ opacity: number });
                      }}
                      classNames="w-full"
                      icon={<BsCircleHalf />}
                    />
                  </div>
                  {layer.type === LayerType.Rectangle && (
                    <div className="flex w-1/2 flex-col gap-1">
                      <p className="text-[9px] font-medium text-gray-500">
                        Corner radius
                      </p>
                      <NumberInput
                        value={layer.cornerRadius ?? 0}
                        min={0}
                        max={100}
                        onChange={(number) => {
                          updateLayer({ cornerRadius: number });
                        }}
                        classNames="w-full"
                        icon={<RiRoundedCorner />}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="border-b border-gray-200" />
              <div className="flex flex-col gap-2 p-4">
                <span className="mb-2 text-[11px] font-medium">Fill</span>
                <ColorPicker
                  value={colorToCss(layer.fill)}
                  onChange={(color) => {
                    updateLayer({ fill: color, stroke: color });
                  }}
                />
              </div>
              <div className="border-b border-gray-200" />
              <div className="flex flex-col gap-2 p-4">
                <span className="mb-2 text-[11px] font-medium">Stroke</span>
                <ColorPicker
                  value={colorToCss(layer.stroke)}
                  onChange={(color) => {
                    updateLayer({ stroke: color });
                  }}
                />
              </div>
              {layer.type === LayerType.Text && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">
                      Typography
                    </span>
                    <div className="flex flex-col gap-2">
                      <Dropdown
                        value={layer.fontFamily}
                        onChange={(value) => {
                          updateLayer({ fontFamily: value });
                        }}
                        options={["Inter", "Arial", "Times New Roman"]}
                      />
                      <div className="flex w-full gap-2">
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Size
                          </p>
                          <NumberInput
                            value={layer.fontSize}
                            onChange={(number) => {
                              updateLayer({ fontSize: number });
                            }}
                            classNames="w-full"
                            icon={<p>W</p>}
                          />
                        </div>
                        <div className="flex w-full flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Weight
                          </p>
                          <Dropdown
                            value={layer.fontWeight.toString()}
                            onChange={(value) => {
                              updateLayer({ fontWeight: Number(value) });
                            }}
                            options={[
                              "100",
                              "200",
                              "300",
                              "400",
                              "500",
                              "600",
                              "700",
                              "800",
                              "900",
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2 p-4">
              <span className="mb-2 text-[11px] font-medium">Page</span>
              <ColorPicker
                onChange={(color) => {
                  const rgbColor = hexToRgb(color);
                  setRoomColor(rgbColor);
                }}
                value={roomColor ? colorToCss(roomColor) : "#1e1e1e"}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="fixed right-3 top-3 flex h-[48px] w-[250px] items-center justify-between rounded-xl border bg-white pr-2">
          <div className="max-36 flex w-full gap-2 overflow-x-scroll p-3 text-xs">
            {me && (
              <UserAvatar
                color={connectionIdToColor(me.connectionId)}
                name={me.info.name}
              />
            )}
            {others.map((other) => (
              <UserAvatar
                key={other.connectionId}
                color={connectionIdToColor(other.connectionId)}
                name={other.info.name}
              />
            ))}
          </div>
          <ShareMenu
            roomId={roomId}
            othersWithAccessToRoom={othersWithAccessToRoom}
          />
        </div>
      )}
    </>
  );
}
