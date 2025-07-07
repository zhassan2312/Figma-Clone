import { useState, useRef, useEffect } from "react";
import { CanvasMode, CanvasState, LayerType } from "~/types";
import IconButton from "./IconButton";
import { 
  IoEllipseOutline, 
  IoSquareOutline, 
  IoStarOutline,
  IoRemoveOutline,
  IoArrowForwardOutline,
  IoStopOutline,
  IoImageOutline,
  IoVideocamOutline
} from "react-icons/io5";
import { BiPolygon } from "react-icons/bi";

type ShapeLayerType = LayerType.Rectangle | LayerType.Ellipse | LayerType.Star | LayerType.Line | LayerType.Arrow | LayerType.Polygon | LayerType.Image | LayerType.Video;

export default function ShapesSelectionButton({
  isActive,
  canvasState,
  onClick,
}: {
  isActive: boolean;
  canvasState: CanvasState;
  onClick: (layerType: ShapeLayerType) => void;
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

  const handleClick = (layerType: ShapeLayerType) => {
    onClick(layerType);
    setIsOpen(false);
  };

  const getCurrentIcon = () => {
    if (canvasState.mode === CanvasMode.Inserting) {
      switch (canvasState.layerType) {
        case LayerType.Ellipse:
          return <IoEllipseOutline className="h-5 w-5" />;
        case LayerType.Rectangle:
          return <IoSquareOutline className="h-5 w-5" />;
        case LayerType.Star:
          return <IoStarOutline className="h-5 w-5" />;
        case LayerType.Line:
          return <IoRemoveOutline className="h-5 w-5" />;
        case LayerType.Arrow:
          return <IoArrowForwardOutline className="h-5 w-5" />;
        case LayerType.Polygon:
          return <BiPolygon className="h-5 w-5" />;
        case LayerType.Image:
          return <IoImageOutline className="h-5 w-5" />;
        case LayerType.Video:
          return <IoVideocamOutline className="h-5 w-5" />;
      }
    }
    // Default to rectangle icon when not in inserting mode or when inserting something else
    return <IoSquareOutline className="h-5 w-5" />;
  };

  const getTooltip = () => {
    if (canvasState.mode === CanvasMode.Inserting) {
      switch (canvasState.layerType) {
        case LayerType.Ellipse:
          return "Ellipse (E)";
        case LayerType.Rectangle:
          return "Rectangle (R)";
        case LayerType.Star:
          return "Star (S)";
        case LayerType.Line:
          return "Line (L)";
        case LayerType.Arrow:
          return "Arrow (A)";
        case LayerType.Polygon:
          return "Polygon (P)";
        case LayerType.Image:
          return "Image (I)";
        case LayerType.Video:
          return "Video (V)";
      }
    }
    return "Rectangle (R)";
  };

  return (
    <div className="relative flex" ref={menuRef}>
      <IconButton
        isActive={isActive}
        onClick={() => onClick(LayerType.Rectangle)}
        title={getTooltip()}
      >
        {getCurrentIcon()}
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
        <div className="absolute top-full mt-2 left-0 min-w-[150px] rounded-xl bg-[#1e1e1e] p-2 shadow-xl border border-gray-700"
          style={{ zIndex: 99999 }}
        >
          <button
            className={`flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Rectangle)}
          >
            <div className="flex items-center">
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Rectangle &&
                  "✓"}
              </span>
              <IoSquareOutline className="mr-2 h-4 w-4" />
              <span className="text-xs">Rectangle</span>
            </div>
            <span className="text-xs text-gray-400">R</span>
          </button>
          <button
            className={`flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Ellipse ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Ellipse)}
          >
            <div className="flex items-center">
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Ellipse &&
                  "✓"}
              </span>
              <IoEllipseOutline className="mr-2 h-4 w-4" />
              <span className="text-xs">Ellipse</span>
            </div>
            <span className="text-xs text-gray-400">E</span>
          </button>
          <button
            className={`flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Star ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Star)}
          >
            <div className="flex items-center">
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Star &&
                  "✓"}
              </span>
              <IoStarOutline className="mr-2 h-4 w-4" />
              <span className="text-xs">Star</span>
            </div>
            <span className="text-xs text-gray-400">S</span>
          </button>
          <button
            className={`flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Line ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Line)}
          >
            <div className="flex items-center">
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Line &&
                  "✓"}
              </span>
              <IoRemoveOutline className="mr-2 h-4 w-4" />
              <span className="text-xs">Line</span>
            </div>
            <span className="text-xs text-gray-400">L</span>
          </button>
          <button
            className={`flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Arrow ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Arrow)}
          >
            <div className="flex items-center">
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Arrow &&
                  "✓"}
              </span>
              <IoArrowForwardOutline className="mr-2 h-4 w-4" />
              <span className="text-xs">Arrow</span>
            </div>
            <span className="text-xs text-gray-400">A</span>
          </button>
          <button
            className={`flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Polygon ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Polygon)}
          >
            <div className="flex items-center">
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Polygon &&
                  "✓"}
              </span>
              <BiPolygon className="mr-2 h-4 w-4" />
              <span className="text-xs">Polygon</span>
            </div>
            <span className="text-xs text-gray-400">P</span>
          </button>
          <button
            className={`flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Image ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Image)}
          >
            <div className="flex items-center">
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Image &&
                  "✓"}
              </span>
              <IoImageOutline className="mr-2 h-4 w-4" />
              <span className="text-xs">Image</span>
            </div>
            <span className="text-xs text-gray-400">I</span>
          </button>
          <button
            className={`flex w-full items-center justify-between rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Video ? "bg-blue-500" : ""}`}
            onClick={() => handleClick(LayerType.Video)}
          >
            <div className="flex items-center">
              <span className="w-5 text-xs">
                {canvasState.mode === CanvasMode.Inserting &&
                  canvasState.layerType === LayerType.Video &&
                  "✓"}
              </span>
              <IoVideocamOutline className="mr-2 h-4 w-4" />
              <span className="text-xs">Video</span>
            </div>
            <span className="text-xs text-gray-400">V</span>
          </button>
        </div>
      )}
    </div>
  );
}
