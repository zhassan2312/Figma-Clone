"use client";

import { useMutation, useOthers, useSelf, useStorage } from "@liveblocks/react";
import { LiveObject } from "@liveblocks/client";
import { updateRoomTitle } from "@/app/actions/rooms";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AiOutlineFontSize } from "react-icons/ai";
import { IoEllipseOutline, IoSquareOutline } from "react-icons/io5";
import { PiPathLight, PiSidebarSimpleThin } from "react-icons/pi";
import { RiRectangleLine, RiRoundedCorner } from "react-icons/ri";
import { BsStarFill, BsImage, BsPlayCircle } from "react-icons/bs";
import { MdOutlineArrowForward, MdOutlineHexagon } from "react-icons/md";
import { FiMinus } from "react-icons/fi";
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

  // Handle room name editing
  const handleRoomNameSave = async () => {
    if (tempRoomName.trim() && tempRoomName !== roomName) {
      try {
        await updateRoomTitle(tempRoomName.trim(), roomId);
        setEditingRoomName(false);
      } catch (error) {
        console.error("Failed to update room name:", error);
        setTempRoomName(roomName); // Revert on error
        setEditingRoomName(false);
      }
    } else {
      setEditingRoomName(false);
      setTempRoomName(roomName); // Revert if no change
    }
  };

  const handleRoomNameCancel = () => {
    setTempRoomName(roomName);
    setEditingRoomName(false);
  };

  const handleRoomNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRoomNameSave();
    } else if (e.key === "Escape") {
      handleRoomNameCancel();
    }
  };
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
  const [editingRoomName, setEditingRoomName] = useState(false);
  const [tempRoomName, setTempRoomName] = useState(roomName);

  // Handle layer property updates
  const updateLayerProperty = useMutation(
    ({ storage }, layerId: string, property: string, value: any) => {
      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(layerId);
      if (layer) {
        layer.update({ [property]: value });
      }
    },
    []
  );

  // Toggle layer visibility
  const toggleLayerVisibility = (layerId: string, visible: boolean) => {
    updateLayerProperty(layerId, "visible", visible);
  };

  // Toggle layer lock state
  const toggleLayerLock = (layerId: string, locked: boolean) => {
    updateLayerProperty(layerId, "locked", locked);
  };

  // Custom selection handler that includes frame children
  const handleLayerSelection = useMutation(
    ({ storage, setMyPresence }, layerId: string) => {
      const liveLayers = storage.get("layers");
      
      // Helper function to get all children of a frame or group recursively
      const getAllChildren = (frameId: string): string[] => {
        const frameLayer = liveLayers.get(frameId);
        if (!frameLayer || (frameLayer.get("type") !== LayerType.Frame && frameLayer.get("type") !== LayerType.Group)) {
          return [];
        }
        
        const frameTyped = frameLayer as LiveObject<FrameLayer | any>; // Allow both Frame and Group
        const children = frameTyped.get("children") || [];
        let allChildren = [...children];
        
        // Recursively get children of child frames/groups
        children.forEach((childId: string) => {
          const childLayer = liveLayers.get(childId);
          if (childLayer?.get("type") === LayerType.Frame || childLayer?.get("type") === LayerType.Group) {
            allChildren = allChildren.concat(getAllChildren(childId));
          }
        });
        
        return allChildren;
      };

      // Get all layers to select (including frame children)
      const targetLayer = liveLayers.get(layerId);
      let layersToSelect = [layerId];
      
      // If it's a frame or group, include all its children
      if (targetLayer?.get("type") === LayerType.Frame || targetLayer?.get("type") === LayerType.Group) {
        const allChildren = getAllChildren(layerId);
        layersToSelect = layersToSelect.concat(allChildren);
      }
      
      setMyPresence({ selection: layersToSelect }, { addToHistory: true });
    },
    []
  );

  // Toggle frame expansion
  const toggleFrameExpansion = (layerId: string) => {
    const layer = layers?.get(layerId);
    if (layer?.type === LayerType.Frame || layer?.type === LayerType.Group) {
      const currentExpanded = (layer as any).expanded ?? true;
      updateLayerProperty(layerId, "expanded", !currentExpanded);
    }
  };

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

  // Handle nesting a layer into a frame or group
  const nestLayerInFrame = useMutation(
    ({ storage }, childLayerId: string, parentFrameId: string) => {
      const liveLayers = storage.get("layers");
      const childLayer = liveLayers.get(childLayerId);
      const parentFrame = liveLayers.get(parentFrameId);
      
      if (!childLayer || !parentFrame || 
          (parentFrame.get("type") !== LayerType.Frame && parentFrame.get("type") !== LayerType.Group)) {
        return;
      }

      // Remove from old parent if it exists
      const oldParentId = childLayer.get("parentId");
      if (oldParentId) {
        const oldParent = liveLayers.get(oldParentId);
        if (oldParent && (oldParent.get("type") === LayerType.Frame || oldParent.get("type") === LayerType.Group)) {
          const oldParentFrame = oldParent as LiveObject<FrameLayer | any>;
          const oldChildren = oldParentFrame.get("children") || [];
          const filteredChildren = oldChildren.filter((id: string) => id !== childLayerId);
          oldParentFrame.update({ children: filteredChildren });
        }
      }

      // Add to new parent
      const parentFrameTyped = parentFrame as LiveObject<FrameLayer | any>;
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
      
      // Check if we're dropping on a frame or group (for nesting) or on another layer (for reordering)
      if (targetLayer?.type === LayerType.Frame || targetLayer?.type === LayerType.Group) {
        // Nest the source layer into the target frame/group
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
              {editingRoomName ? (
                <input
                  type="text"
                  value={tempRoomName}
                  onChange={(e) => setTempRoomName(e.target.value)}
                  onBlur={handleRoomNameSave}
                  onKeyDown={handleRoomNameKeyDown}
                  className="w-full rounded border border-gray-300 px-1 py-0.5 text-[13px] font-medium"
                  autoFocus
                />
              ) : (
                <span
                  onClick={() => setEditingRoomName(true)}
                  className="cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5"
                  title="Click to edit room name"
                >
                  {roomName}
                </span>
              )}
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
                    <LayerButton
                      key={layerId}
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
                      hasChildren={false}
                      visible={layer.visible ?? true}
                      locked={layer.locked ?? false}
                      onToggleVisible={toggleLayerVisibility}
                      onToggleLocked={toggleLayerLock}
                      onSelect={handleLayerSelection}
                      depth={depth}
                    />
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
                  } else if (layer.type === LayerType.Star) {
                    layerElement = (
                      <LayerButtonWithIcon 
                        icon={<BsStarFill className="h-3 w-3 text-gray-500" />}
                        name="Star"
                      />
                    );
                  } else if (layer.type === LayerType.Line) {
                    layerElement = (
                      <LayerButtonWithIcon 
                        icon={<FiMinus className="h-3 w-3 text-gray-500" />}
                        name="Line"
                      />
                    );
                  } else if (layer.type === LayerType.Arrow) {
                    layerElement = (
                      <LayerButtonWithIcon 
                        icon={<MdOutlineArrowForward className="h-3 w-3 text-gray-500" />}
                        name="Arrow"
                      />
                    );
                  } else if (layer.type === LayerType.Polygon) {
                    layerElement = (
                      <LayerButtonWithIcon 
                        icon={<MdOutlineHexagon className="h-3 w-3 text-gray-500" />}
                        name="Polygon"
                      />
                    );
                  } else if (layer.type === LayerType.Image) {
                    layerElement = (
                      <LayerButtonWithIcon 
                        icon={<BsImage className="h-3 w-3 text-gray-500" />}
                        name="Image"
                      />
                    );
                  } else if (layer.type === LayerType.Video) {
                    layerElement = (
                      <LayerButtonWithIcon 
                        icon={<BsPlayCircle className="h-3 w-3 text-gray-500" />}
                        name="Video"
                      />
                    );
                  } else if (layer.type === LayerType.Frame) {
                    const frameLayer = layer as any; // Type assertion for frame
                    const children = frameLayer.children || [];
                    const isExpanded = frameLayer.expanded ?? true;
                    
                    layerElement = (
                      <div key={layerId}>
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
                          hasChildren={children.length > 0}
                          isExpanded={isExpanded}
                          onToggleExpanded={toggleFrameExpansion}
                          visible={layer.visible ?? true}
                          locked={layer.locked ?? false}
                          onToggleVisible={toggleLayerVisibility}
                          onToggleLocked={toggleLayerLock}
                          onSelect={handleLayerSelection}
                          depth={depth}
                        />
                        {/* Render children only if expanded */}
                        {isExpanded && children.map((childId: string) => renderLayerHierarchy(childId, depth + 1))}
                      </div>
                    );
                  } else if (layer.type === LayerType.Group) {
                    const groupLayer = layer as any; // Type assertion for group
                    const children = groupLayer.children || [];
                    const isExpanded = groupLayer.expanded ?? true;
                    
                    layerElement = (
                      <div key={layerId}>
                        <LayerButton
                          layerId={layerId}
                          text={layer.name || "Group"}
                          isSelected={isSelected ?? false}
                          icon={<RiRectangleLine className="h-3 w-3 text-gray-400" />}
                          onRename={handleLayerRename}
                          isEditing={editingLayerId === layerId}
                          onEditingChange={(editing) => {
                            if (!editing) setEditingLayerId(null);
                          }}
                          onDragStart={handleDragStart}
                          onDragOver={(e) => handleDragOver(e, layerId)}
                          onDrop={handleDrop}
                          isDragOver={dragOverLayerId === layerId}
                          hasChildren={children.length > 0}
                          isExpanded={isExpanded}
                          onToggleExpanded={toggleFrameExpansion}
                          visible={layer.visible ?? true}
                          locked={layer.locked ?? false}
                          onToggleVisible={toggleLayerVisibility}
                          onToggleLocked={toggleLayerLock}
                          onSelect={handleLayerSelection}
                          depth={depth}
                        />
                        {/* Render children only if expanded */}
                        {isExpanded && children.map((childId: string) => renderLayerHierarchy(childId, depth + 1))}
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
          <h2 className="scroll-m-20 text-[13px] font-medium">
            {editingRoomName ? (
              <input
                type="text"
                value={tempRoomName}
                onChange={(e) => setTempRoomName(e.target.value)}
                onBlur={handleRoomNameSave}
                onKeyDown={handleRoomNameKeyDown}
                className="w-full rounded border border-gray-300 px-1 py-0.5 text-[13px] font-medium"
                autoFocus
              />
            ) : (
              <span
                onClick={() => setEditingRoomName(true)}
                className="cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5"
                title="Click to edit room name"
              >
                {roomName}
              </span>
            )}
          </h2>
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
              {layer.type === LayerType.Group && (
                <>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Group</span>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-medium text-gray-500">
                        Name
                      </p>
                      <input
                        type="text"
                        value={layer.name || "Group"}
                        onChange={(e) => {
                          updateLayer({ name: e.target.value });
                        }}
                        className="rounded border border-gray-300 px-2 py-1 text-xs"
                        placeholder="Group name"
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

              {layer.type !== LayerType.Path && layer.type !== LayerType.Line && layer.type !== LayerType.Arrow && (
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
                          value={(layer as any).width}
                          onChange={(number) => {
                            updateLayer({ width: number });
                          }}
                          classNames="w-1/2"
                          icon={<p>W</p>}
                        />
                        <NumberInput
                          value={(layer as any).height}
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

              {(layer.type === LayerType.Line || layer.type === LayerType.Arrow) && (
                <>
                  <div className="border-b border-gray-200"></div>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Line Points</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex w-full gap-2">
                        <NumberInput
                          value={(layer as any).x}
                          onChange={(number) => {
                            updateLayer({ x: number });
                          }}
                          classNames="w-1/2"
                          icon={<p>X1</p>}
                        />
                        <NumberInput
                          value={(layer as any).y}
                          onChange={(number) => {
                            updateLayer({ y: number });
                          }}
                          classNames="w-1/2"
                          icon={<p>Y1</p>}
                        />
                      </div>
                      <div className="flex w-full gap-2">
                        <NumberInput
                          value={(layer as any).x2}
                          onChange={(number) => {
                            updateLayerProperty(selectedLayer!, "x2", number);
                          }}
                          classNames="w-1/2"
                          icon={<p>X2</p>}
                        />
                        <NumberInput
                          value={(layer as any).y2}
                          onChange={(number) => {
                            updateLayerProperty(selectedLayer!, "y2", number);
                          }}
                          classNames="w-1/2"
                          icon={<p>Y2</p>}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {layer.type !== LayerType.Group && (
                <>
                  <div className="border-b border-gray-200"></div>
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Appearance</span>
                <div className="flex w-full gap-2">
                  <div className="flex w-1/2 flex-col gap-1">
                    <p className="text-[9px] font-medium text-gray-500">
                      Opacity
                    </p>
                    <NumberInput
                      value={("opacity" in layer) ? layer.opacity : 100}
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
              
              {/* Fill section - only for layers that have fill property */}
              {(layer.type === LayerType.Rectangle || 
                layer.type === LayerType.Ellipse || 
                layer.type === LayerType.Frame || 
                layer.type === LayerType.Star || 
                layer.type === LayerType.Polygon || 
                layer.type === LayerType.Text) && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Fill</span>
                    <ColorPicker
                      value={("fill" in layer) ? colorToCss(layer.fill) : "#ffffff"}
                      onChange={(color) => {
                        updateLayer({ fill: color });
                      }}
                    />
                  </div>
                </>
              )}
              
              {/* Stroke section - for all shapes including frames */}
              {(layer.type === LayerType.Rectangle || 
                layer.type === LayerType.Ellipse || 
                layer.type === LayerType.Frame || 
                layer.type === LayerType.Star || 
                layer.type === LayerType.Line || 
                layer.type === LayerType.Arrow || 
                layer.type === LayerType.Polygon) && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Stroke</span>
                    <ColorPicker
                      value={("stroke" in layer) ? colorToCss(layer.stroke) : "#000000"}
                      onChange={(color) => {
                        updateLayer({ stroke: color });
                      }}
                    />
                  </div>
                </>
              )}
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
              {layer.type === LayerType.Star && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Star Properties</span>
                    <div className="flex w-full gap-2">
                      <div className="flex w-1/2 flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Vertices
                        </p>
                        <NumberInput
                          value={(layer as any).vertices || 5}
                          min={3}
                          max={20}
                          onChange={(number) => {
                            updateLayerProperty(selectedLayer!, "vertices", number);
                          }}
                          classNames="w-full"
                          icon={<p>V</p>}
                        />
                      </div>
                      <div className="flex w-1/2 flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Inner Radius
                        </p>
                        <NumberInput
                          value={Math.round(((layer as any).innerRadius || 0.5) * 100)}
                          min={10}
                          max={90}
                          onChange={(number) => {
                            updateLayerProperty(selectedLayer!, "innerRadius", number / 100);
                          }}
                          classNames="w-full"
                          icon={<p>%</p>}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {layer.type === LayerType.Line && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Line Properties</span>
                    <div className="flex w-full gap-2">
                      <div className="flex w-1/2 flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Stroke Width
                        </p>
                        <NumberInput
                          value={(layer as any).strokeWidth || 2}
                          min={1}
                          max={20}
                          onChange={(number) => {
                            updateLayerProperty(selectedLayer!, "strokeWidth", number);
                          }}
                          classNames="w-full"
                          icon={<p>W</p>}
                        />
                      </div>
                      <div className="flex w-1/2 flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Dashed
                        </p>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={(layer as any).isDashed || false}
                            onChange={(e) => {
                              updateLayerProperty(selectedLayer!, "isDashed", e.target.checked);
                            }}
                            className="rounded border border-gray-300"
                          />
                          <span className="text-xs">Dashed line</span>
                        </label>
                      </div>
                    </div>
                    {(layer as any).isDashed && (
                      <div className="flex w-full gap-2">
                        <div className="flex w-1/2 flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Dash Width
                          </p>
                          <NumberInput
                            value={(layer as any).dashWidth || 5}
                            min={1}
                            max={50}
                            onChange={(number) => {
                              updateLayerProperty(selectedLayer!, "dashWidth", number);
                            }}
                            classNames="w-full"
                            icon={<p>D</p>}
                          />
                        </div>
                        <div className="flex w-1/2 flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Dash Gap
                          </p>
                          <NumberInput
                            value={(layer as any).dashGap || 5}
                            min={1}
                            max={50}
                            onChange={(number) => {
                              updateLayerProperty(selectedLayer!, "dashGap", number);
                            }}
                            classNames="w-full"
                            icon={<p>G</p>}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {layer.type === LayerType.Arrow && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Arrow Properties</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex w-full gap-2">
                        <div className="flex w-1/2 flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Stroke Width
                          </p>
                          <NumberInput
                            value={(layer as any).strokeWidth || 2}
                            min={1}
                            max={20}
                            onChange={(number) => {
                              updateLayerProperty(selectedLayer!, "strokeWidth", number);
                            }}
                            classNames="w-full"
                            icon={<p>W</p>}
                          />
                        </div>
                        <div className="flex w-1/2 flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Arrow Size
                          </p>
                          <NumberInput
                            value={(layer as any).arrowSize || 10}
                            min={5}
                            max={30}
                            onChange={(number) => {
                              updateLayerProperty(selectedLayer!, "arrowSize", number);
                            }}
                            classNames="w-full"
                            icon={<p>S</p>}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Arrow Heads
                        </p>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(layer as any).arrowStart || false}
                              onChange={(e) => {
                                updateLayerProperty(selectedLayer!, "arrowStart", e.target.checked);
                              }}
                              className="rounded border border-gray-300"
                            />
                            <span className="text-xs">Start</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(layer as any).arrowEnd || false}
                              onChange={(e) => {
                                updateLayerProperty(selectedLayer!, "arrowEnd", e.target.checked);
                              }}
                              className="rounded border border-gray-300"
                            />
                            <span className="text-xs">End</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Dashed
                        </p>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={(layer as any).isDashed || false}
                            onChange={(e) => {
                              updateLayerProperty(selectedLayer!, "isDashed", e.target.checked);
                            }}
                            className="rounded border border-gray-300"
                          />
                          <span className="text-xs">Dashed line</span>
                        </label>
                      </div>
                    </div>
                    {(layer as any).isDashed && (
                      <div className="flex w-full gap-2">
                        <div className="flex w-1/2 flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Dash Width
                          </p>
                          <NumberInput
                            value={(layer as any).dashWidth || 5}
                            min={1}
                            max={50}
                            onChange={(number) => {
                              updateLayerProperty(selectedLayer!, "dashWidth", number);
                            }}
                            classNames="w-full"
                            icon={<p>D</p>}
                          />
                        </div>
                        <div className="flex w-1/2 flex-col gap-1">
                          <p className="text-[9px] font-medium text-gray-500">
                            Dash Gap
                          </p>
                          <NumberInput
                            value={(layer as any).dashGap || 5}
                            min={1}
                            max={50}
                            onChange={(number) => {
                              updateLayerProperty(selectedLayer!, "dashGap", number);
                            }}
                            classNames="w-full"
                            icon={<p>G</p>}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {layer.type === LayerType.Polygon && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Polygon Properties</span>
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] font-medium text-gray-500">
                        Sides
                      </p>
                      <NumberInput
                        value={(layer as any).sides || 6}
                        min={3}
                        max={20}
                        onChange={(number) => {
                          updateLayerProperty(selectedLayer!, "sides", number);
                        }}
                        classNames="w-full"
                        icon={<p>S</p>}
                      />
                    </div>
                  </div>
                </>
              )}
              {layer.type === LayerType.Image && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Image Properties</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Upload Image
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const result = event.target?.result as string;
                                updateLayerProperty(selectedLayer!, "src", result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Or enter URL
                        </p>
                        <input
                          type="text"
                          value={(layer as any).src || ""}
                          onChange={(e) => {
                            updateLayerProperty(selectedLayer!, "src", e.target.value);
                          }}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {layer.type === LayerType.Video && (
                <>
                  <div className="border-b border-gray-200" />
                  <div className="flex flex-col gap-2 p-4">
                    <span className="mb-2 text-[11px] font-medium">Video Properties</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Upload Video
                        </p>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const result = event.target?.result as string;
                                updateLayerProperty(selectedLayer!, "src", result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Or enter Video URL
                        </p>
                        <input
                          type="text"
                          value={(layer as any).src || ""}
                          onChange={(e) => {
                            updateLayerProperty(selectedLayer!, "src", e.target.value);
                          }}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                          placeholder="https://example.com/video.mp4"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Poster Image (Optional)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const result = event.target?.result as string;
                                updateLayerProperty(selectedLayer!, "poster", result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Or enter Poster URL
                        </p>
                        <input
                          type="text"
                          value={(layer as any).poster || ""}
                          onChange={(e) => {
                            updateLayerProperty(selectedLayer!, "poster", e.target.value);
                          }}
                          className="rounded border border-gray-300 px-2 py-1 text-xs"
                          placeholder="https://example.com/poster.jpg"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-medium text-gray-500">
                          Controls
                        </p>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(layer as any).controls !== false}
                              onChange={(e) => {
                                updateLayerProperty(selectedLayer!, "controls", e.target.checked);
                              }}
                              className="rounded border border-gray-300"
                            />
                            <span className="text-xs">Show controls</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(layer as any).autoplay || false}
                              onChange={(e) => {
                                updateLayerProperty(selectedLayer!, "autoplay", e.target.checked);
                              }}
                              className="rounded border border-gray-300"
                            />
                            <span className="text-xs">Autoplay</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(layer as any).muted !== false}
                              onChange={(e) => {
                                updateLayerProperty(selectedLayer!, "muted", e.target.checked);
                              }}
                              className="rounded border border-gray-300"
                            />
                            <span className="text-xs">Muted</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
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
