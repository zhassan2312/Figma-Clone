"use client";

import { useMutation } from "@liveblocks/react";
import { ReactNode, useState, useRef, useEffect } from "react";

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
}) => {
  const [isEditing, setIsEditing] = useState(externalIsEditing || false);
  const [editingName, setEditingName] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateSelection = useMutation(({ setMyPresence }, layerId: string) => {
    setMyPresence({ selection: [layerId] }, { addToHistory: true });
  }, []);

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
    <button
      className={`flex items-center gap-2 rounded px-1.5 py-1 text-left text-[11px] hover:bg-gray-100 transition-colors ${
        isSelected ? "bg-[#bce3ff]" : ""
      } ${isDragOver ? "border-t-2 border-blue-500" : ""}`}
      onClick={() => updateSelection(layerId)}
      onDoubleClick={handleDoubleClick}
      draggable={!isEditing}
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
        <span>{text}</span>
      )}
    </button>
  );
};

export default LayerButton;
