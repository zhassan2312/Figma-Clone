"use client";

import { useEffect, useRef, useState } from "react";
import { CanvasMode } from "~/types";
import IconButton from "./IconButton";
import { BiPointer } from "react-icons/bi";
import { RiHand } from "react-icons/ri";
import { MdOpenInFull } from "react-icons/md";

export default function SelectionButton({
  isActive,
  canvasMode,
  onClick,
}: {
  isActive: boolean;
  canvasMode: CanvasMode;
  onClick: (canvasMode: CanvasMode.None | CanvasMode.Dragging | CanvasMode.Scaling) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (canvasMode: CanvasMode.None | CanvasMode.Dragging | CanvasMode.Scaling) => {
    onClick(canvasMode);
    setIsOpen(false);
  };

  return (
    <div className="relative flex" ref={menuRef}>
      <IconButton isActive={isActive} onClick={() => onClick(CanvasMode.None)} title="Move (V)">
        {canvasMode !== CanvasMode.None &&
          canvasMode !== CanvasMode.Dragging && 
          canvasMode !== CanvasMode.Scaling && (
            <BiPointer className="h-5 w-5" />
          )}
        {canvasMode === CanvasMode.None && <BiPointer className="h-5 w-5" />}
        {canvasMode === CanvasMode.Dragging && <RiHand className="h-5 w-5" />}
        {canvasMode === CanvasMode.Scaling && <MdOpenInFull className="h-5 w-5" />}
      </IconButton>
      <button onClick={() => setIsOpen(!isOpen)} className="ml-1 rotate-180">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path
            d="M3.646 6.354l-3-3 .708-.708L4 5.293l2.646-2.647.708.708-3 3L4 6.707l-.354-.353z"
            fill="currentColor"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 min-w-[150px] rounded-xl bg-[#1e1e1e] p-2 shadow-xl border border-gray-700" style={{ zIndex: 99999 }}>
          <button
            className={`flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500 ${canvasMode === CanvasMode.None ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(CanvasMode.None)}
          >
            <div className="flex items-center">
              <span className="w-5 text-xs">
                {canvasMode === CanvasMode.None && "✓"}
              </span>
              <BiPointer className="mr-2 h-4 w-4" />
              <span className="text-xs">Move</span>
            </div>
            <span className="text-xs text-gray-400">V</span>
          </button>
          <button
            className={`flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500 ${canvasMode === CanvasMode.Scaling ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(CanvasMode.Scaling)}
          >
            <div className="flex items-center">
              <span className="w-5 text-xs">
                {canvasMode === CanvasMode.Scaling && "✓"}
              </span>
              <MdOpenInFull className="mr-2 h-4 w-4" />
              <span className="text-xs">Scale</span>
            </div>
            <span className="text-xs text-gray-400">K</span>
          </button>
          <button
            className={`flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500 ${canvasMode === CanvasMode.Dragging ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(CanvasMode.Dragging)}
          >
            <div className="flex items-center">
              <span className="w-5 text-xs">
                {canvasMode === CanvasMode.Dragging && "✓"}
              </span>
              <RiHand className="mr-2 h-4 w-4" />
              <span className="text-xs">Hand tool</span>
            </div>
            <span className="text-xs text-gray-400">H</span>
          </button>
        </div>
      )}
    </div>
  );
}
