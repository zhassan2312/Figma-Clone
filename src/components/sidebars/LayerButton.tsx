"use client";

import { useMutation } from "@liveblocks/react";
import { ReactNode, useState, useRef, useEffect } from "react";
import { IoChevronDown, IoChevronForward, IoEye, IoEyeOff, IoLockClosed, IoLockOpen } from "react-icons/io5";

const LayerButton = ({
  layerId,
  text,
  icon,
  isSelected,
  onRename,
  isEditing: externalIsEditing,
  onEditingChange,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
  hasChildren = false,
  isExpanded = true,
  onToggleExpanded,
  visible = true,
  locked = false,
  onToggleVisible,
  onToggleLocked,
  depth = 0,
  onSelect, // Custom selection handler
}: {
  layerId: string;
  text: string;
  icon: ReactNode;
  isSelected: boolean;
  onRename?: (layerId: string, newName: string) => void;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  onDragStart?: (e: React.DragEvent, layerId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetLayerId: string) => void;
  isDragOver?: boolean;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: (layerId: string) => void;
  visible?: boolean;
  locked?: boolean;
  onToggleVisible?: (layerId: string, visible: boolean) => void;
  onToggleLocked?: (layerId: string, locked: boolean) => void;
  depth?: number;
  onSelect?: (layerId: string) => void; // Custom selection handler
}) => {
  const [isEditing, setIsEditing] = useState(externalIsEditing || false);
  const [editingName, setEditingName] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateSelection = useMutation(({ setMyPresence }, layerId: string) => {
    if (onSelect) {
      // Use custom selection handler if provided
      onSelect(layerId);
    } else {
      // Fallback to default selection
      setMyPresence({ selection: [layerId] }, { addToHistory: true });
    }
  }, [onSelect]);

  useEffect(() => {
    if (externalIsEditing !== undefined) {
      setIsEditing(externalIsEditing);
      if (externalIsEditing) {
        setEditingName(text);
      }
    }
  }, [externalIsEditing, text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingName(text);
    onEditingChange?.(true);
  };

  const handleSubmit = () => {
    if (editingName.trim() && editingName !== text && onRename) {
      onRename(layerId, editingName.trim());
    }
    setIsEditing(false);
    onEditingChange?.(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingName(text);
      onEditingChange?.(false);
    }
  };

  const handleBlur = () => {
    handleSubmit();
  };

  return (
    <div
      className={`flex items-center rounded px-1.5 py-1 text-left text-[11px] hover:bg-gray-100 transition-colors ${
        isSelected ? "bg-[#bce3ff]" : ""
      } ${isDragOver ? "border-t-2 border-blue-500" : ""} ${!visible ? "opacity-50" : ""}`}
      style={{ marginLeft: `${depth * 16}px` }}
    >
      {/* Expand/Collapse Button */}
      <button
        className="flex items-center justify-center w-4 h-4 hover:bg-gray-200 rounded"
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren && onToggleExpanded) {
            onToggleExpanded(layerId);
          }
        }}
      >
        {hasChildren ? (
          isExpanded ? (
            <IoChevronDown className="h-3 w-3 text-gray-600" />
          ) : (
            <IoChevronForward className="h-3 w-3 text-gray-600" />
          )
        ) : (
          <div className="w-3 h-3" />
        )}
      </button>

      {/* Main Layer Button */}
      <button
        className="flex-1 flex items-center gap-2 min-w-0"
        onClick={() => updateSelection(layerId)}
        onDoubleClick={handleDoubleClick}
        draggable={!isEditing && !locked}
        onDragStart={(e) => onDragStart?.(e, layerId)}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver?.(e);
        }}
        onDrop={(e) => {
          e.preventDefault();
          onDrop?.(e, layerId);
        }}
        onDragEnd={() => {
          // Clear any drag state when drag ends
        }}
      >
        {icon}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="bg-transparent border-none outline-none text-[11px] flex-1 min-w-0"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="truncate">{text}</span>
        )}
      </button>

      {/* Visibility Toggle */}
      <button
        className="flex items-center justify-center w-4 h-4 hover:bg-gray-200 rounded ml-1"
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleVisible) {
            onToggleVisible(layerId, !visible);
          }
        }}
        title={visible ? "Hide layer" : "Show layer"}
      >
        {visible ? (
          <IoEye className="h-3 w-3 text-gray-600" />
        ) : (
          <IoEyeOff className="h-3 w-3 text-gray-400" />
        )}
      </button>

      {/* Lock Toggle */}
      <button
        className="flex items-center justify-center w-4 h-4 hover:bg-gray-200 rounded ml-1"
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleLocked) {
            onToggleLocked(layerId, !locked);
          }
        }}
        title={locked ? "Unlock layer" : "Lock layer"}
      >
        {locked ? (
          <IoLockClosed className="h-3 w-3 text-gray-600" />
        ) : (
          <IoLockOpen className="h-3 w-3 text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default LayerButton;
