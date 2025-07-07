"use client";

import { useMutation, useOthers, useSelf, useStorage } from "@liveblocks/react";
import { LiveObject } from "@liveblocks/client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AiOutlineFontSize } from "react-icons/ai";
import { IoEllipseOutline, IoSquareOutline } from "react-icons/io5";
import { PiPathLight, PiSidebarSimpleThin } from "react-icons/pi";
import { RiRectangleLine, RiRoundedCorner } from "react-icons/ri";
import { Color, LayerType, FrameLayer } from "~/types";
import { colorToCss, connectionIdToColor, hexToRgb } from "~/utils";
import LayerButton from "./LayerButton";
import NumberInput from "./NumberInput";
import { BsCircleHalf } from "react-icons/bs";
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
  isRenamingActive,
  setIsRenamingActive,
}: {
  roomName: string;
  roomId: string;
  othersWithAccessToRoom: User[];
  leftIsMinimized: boolean;
  setLeftIsMinimized: (value: boolean) => void;
  isRenamingActive?: boolean;
  setIsRenamingActive?: (value: boolean) => void;
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
        name?: string;
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
          ...(updates.name !== undefined && { name: updates.name }),
        });
      }
    },
    [selectedLayer],
  );

  // Handle layer renaming
  const handleLayerRename = useMutation(
    ({ storage }, layerId: string, newName: string) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(layerId);
      if (layer) {
        layer.update({ name: newName });
      }
    },
    []
  );

  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);

  // Effect to handle F2 rename activation
  useEffect(() => {
    if (isRenamingActive && selectedLayer && setIsRenamingActive) {
      setEditingLayerId(selectedLayer);
      setIsRenamingActive(false);
    }
  }, [isRenamingActive, selectedLayer, setIsRenamingActive]);

  // Handle layer reordering and nesting
  const reorderLayers = useMutation(
    ({ storage }, sourceLayerId: string, targetLayerId: string) => {
      const liveLayerIds = storage.get("layerIds");
      const liveLayers = storage.get("layers");
      const currentIds = [...liveLayerIds];
      
      const sourceIndex = currentIds.indexOf(sourceLayerId);
      const targetIndex = currentIds.indexOf(targetLayerId);
      
      if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
        return;
      }
      
      // Remove source layer from its current position
      const [sourceId] = currentIds.splice(sourceIndex, 1);
      
      // Insert it at the target position
      currentIds.splice(targetIndex, 0, sourceId);
      
      // Update the layer IDs in storage
      liveLayerIds.clear();
      currentIds.forEach(id => liveLayerIds.push(id));
    },
    []
  );

  // Handle nesting a layer into a frame
  const nestLayerInFrame = useMutation(
    ({ storage }, childLayerId: string, parentFrameId: string) => {
      const liveLayers = storage.get("layers");
      const childLayer = liveLayers.get(childLayerId);
      const parentFrame = liveLayers.get(parentFrameId);
      
      if (!childLayer || !parentFrame || parentFrame.get("type") !== LayerType.Frame) {
        return;
      }

      // Remove from old parent if it exists
      const oldParentId = childLayer.get("parentId");
      if (oldParentId) {
        const oldParent = liveLayers.get(oldParentId);
        if (oldParent && oldParent.get("type") === LayerType.Frame) {
          const oldParentFrame = oldParent as LiveObject<FrameLayer>;
          const oldChildren = oldParentFrame.get("children") || [];
          const filteredChildren = oldChildren.filter((id: string) => id !== childLayerId);
          oldParentFrame.update({ children: filteredChildren });
        }
      }

      // Add to new parent
      const parentFrameTyped = parentFrame as LiveObject<FrameLayer>;
      const currentChildren = parentFrameTyped.get("children") || [];
      parentFrameTyped.update({ children: [...currentChildren, childLayerId] });
      
      // Update child's parentId
      childLayer.update({ parentId: parentFrameId });
    },
    []
  );

  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    setDraggedLayerId(layerId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', layerId);
  };

  const handleDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    if (draggedLayerId && draggedLayerId !== layerId) {
      setDragOverLayerId(layerId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    const sourceLayerId = e.dataTransfer.getData('text/plain') || draggedLayerId;
    
    if (sourceLayerId && sourceLayerId !== targetLayerId) {
      const targetLayer = layers?.get(targetLayerId);
      
      // Check if we're dropping on a frame (for nesting) or on another layer (for reordering)
      if (targetLayer?.type === LayerType.Frame) {
        // Nest the source layer into the target frame
        nestLayerInFrame(sourceLayerId, targetLayerId);
      } else {
        // Regular reordering
        reorderLayers(sourceLayerId, targetLayerId);
      }
    }
    
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

  const handleDragEnd = () => {
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

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
              (() => {
                // Function to render layers hierarchically
                const renderLayerHierarchy = (layerId: string, depth: number = 0): React.ReactNode => {
                  const layer = layers?.get(layerId);
                  const isSelected = selection?.includes(layerId);
                  
                  if (!layer) return null;

                  const LayerButtonWithIcon = ({ icon, name }: { icon: React.ReactNode, name: string }) => (
                    <div key={layerId} style={{ marginLeft: `${depth * 16}px` }}>
                      <LayerButton
                        layerId={layerId}
                        text={layer.name || name}
                        isSelected={isSelected ?? false}
                        icon={icon}
                        onRename={handleLayerRename}
                        isEditing={editingLayerId === layerId}
                        onEditingChange={(editing) => {
                          if (!editing) setEditingLayerId(null);
                        }}
                        onDragStart={handleDragStart}
                        onDragOver={(e) => handleDragOver(e, layerId)}
                        onDrop={handleDrop}
                        isDragOver={dragOverLayerId === layerId}
                      />
                    </div>
                  );

                  let layerElement: React.ReactNode = null;

                  if (layer.type === LayerType.Rectangle) {
                    layerElement = (
                      <LayerButtonWithIcon 
                        icon={<IoSquareOutline className="h-3 w-3 text-gray-500" />}
                        name="Rectangle"
                      />
                    );
                  } else if (layer.type === LayerType.Ellipse) {
                    layerElement = (
                      <LayerButtonWithIcon 
                        icon={<IoEllipseOutline className="h-3 w-3 text-gray-500" />}
                        name="Ellipse"
                      />
                    );
                  } else if (layer.type === LayerType.Path) {
                    layerElement = (
                      <LayerButtonWithIcon 
                        icon={<PiPathLight className="h-3 w-3 text-gray-500" />}
                        name="Drawing"
                      />
                    );
                  } else if (layer.type === LayerType.Text) {
                    layerElement = (
                      <LayerButtonWithIcon 
                        icon={<AiOutlineFontSize className="h-3 w-3 text-gray-500" />}
                        name="Text"
                      />
                    );
                  } else if (layer.type === LayerType.Frame) {
                    const frameLayer = layer as any; // Type assertion for frame
                    const children = frameLayer.children || [];
                    
                    layerElement = (
                      <div key={layerId}>
                        <div style={{ marginLeft: `${depth * 16}px` }}>
                          <LayerButton
                            layerId={layerId}
                            text={layer.name || "Frame"}
                            isSelected={isSelected ?? false}
                            icon={<RiRectangleLine className="h-3 w-3 text-gray-500" />}
                            onRename={handleLayerRename}
                            isEditing={editingLayerId === layerId}
                            onEditingChange={(editing) => {
                              if (!editing) setEditingLayerId(null);
                            }}
                            onDragStart={handleDragStart}
                            onDragOver={(e) => handleDragOver(e, layerId)}
                            onDrop={handleDrop}
                            isDragOver={dragOverLayerId === layerId}
                          />
                        </div>
                        {/* Render children */}
                        {children.map((childId: string) => renderLayerHierarchy(childId, depth + 1))}
                      </div>
                    );
                  }

                  return layerElement;
                };

                // Get top-level layers (layers without parentId) in reverse order
                const topLevelLayers = reversedLayerIds.filter(id => {
                  const layer = layers?.get(id);
                  return !layer?.parentId;
                });

                return topLevelLayers.map(id => renderLayerHierarchy(id));
              })()
            }
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
              {layer.type === LayerType.Frame && (
                <>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Frame</span>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-medium text-gray-500">
                        Name
                      </p>
                      <input
                        type="text"
                        value={layer.name || "Frame"}
                        onChange={(e) => {
                          updateLayer({ name: e.target.value });
                        }}
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                        placeholder="Frame name"
                      />
                    </div>
                  </div>
                  <div className="border-b border-gray-200"></div>
                </>
              )}
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
                  {(layer.type === LayerType.Rectangle || layer.type === LayerType.Frame) && (
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
