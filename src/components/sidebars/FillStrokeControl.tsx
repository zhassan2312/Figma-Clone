import { Fill, Stroke, Layer } from "@/types";
import { colorToCss, hexToRgb, getLayerFills, getLayerStrokes } from "@/utils";
import { Eye, EyeOff, Plus, Minus } from "lucide-react";

export interface FillStrokeControlProps {
  layer: Layer;
  onChange: (updates: any) => void;
  strokeOnly?: boolean;
}

function FillStrokeControl({
  layer,
  onChange,
  strokeOnly = false,
}: FillStrokeControlProps) {
  // Use compatibility helpers to get fills and strokes
  const fills = getLayerFills(layer);
  const strokes = getLayerStrokes(layer);
  
  const onFillsChange = (newFills: Fill[]) => {
    onChange({ fills: newFills });
  };
  
  const onStrokesChange = (newStrokes: Stroke[]) => {
    onChange({ strokes: newStrokes });
  };

  const addFill = () => {
    const newFill: Fill = {
      id: crypto.randomUUID(),
      type: 'solid',
      color: { r: 217, g: 217, b: 217 }, // Default light gray
      opacity: 100,
      visible: true,
    };
    onFillsChange([...fills, newFill]);
  };

  const removeFill = (fillId: string) => {
    onFillsChange(fills.filter(f => f.id !== fillId));
  };

  const updateFill = (fillId: string, updates: Partial<Fill>) => {
    onFillsChange(fills.map(f => f.id === fillId ? { ...f, ...updates } : f));
  };

  const addStroke = () => {
    const newStroke: Stroke = {
      id: crypto.randomUUID(),
      color: { r: 0, g: 0, b: 0 },
      width: 1,
      opacity: 100,
      visible: true,
      position: 'center',
    };
    onStrokesChange([...strokes, newStroke]);
  };

  const removeStroke = (strokeId: string) => {
    onStrokesChange(strokes.filter(s => s.id !== strokeId));
  };

  const updateStroke = (strokeId: string, updates: Partial<Stroke>) => {
    onStrokesChange(strokes.map(s => s.id === strokeId ? { ...s, ...updates } : s));
  };

  return (
    <>
      {/* Fill Section */}
      {!strokeOnly && (
        <>
          <div className="border-b border-gray-200" />
          <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium">Fill</span>
              <button
                onClick={addFill}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                title="Add fill"
              >
                <Plus size={12} className="text-gray-600" />
              </button>
            </div>
            
            {fills.length === 0 ? (
              <div className="text-[9px] text-gray-400">No fills</div>
            ) : (
              <div className="space-y-2">
                {fills.map((fill, index) => (
                  <div key={fill.id} className="flex items-center gap-2">
                    {/* Visibility toggle */}
                    <button
                      onClick={() => updateFill(fill.id, { visible: !fill.visible })}
                      className={`p-0.5 rounded transition-colors ${
                        fill.visible 
                          ? 'text-gray-600 hover:text-gray-800' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {fill.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                    
                    {/* Color swatch */}
                    <div className="relative">
                      <input
                        type="color"
                        value={colorToCss(fill.color)}
                        onChange={(e) => {
                          const color = hexToRgb(e.target.value);
                          updateFill(fill.id, { color });
                        }}
                        className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                    
                    {/* Fill info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] text-gray-600">
                        {fill.type === 'gradient' || fill.type === 'image' 
                          ? (fill.type === 'gradient' ? 'Gradient' : 'Image')
                          : colorToCss(fill.color).toUpperCase()
                        }
                      </div>
                    </div>
                    
                    {/* Opacity */}
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(fill.opacity)}
                        onChange={(e) => updateFill(fill.id, { opacity: parseInt(e.target.value) || 0 })}
                        className="w-8 text-[9px] bg-white border border-gray-300 rounded px-1 py-0.5 text-gray-700 focus:border-blue-500 focus:outline-none text-right appearance-none"
                        style={{ MozAppearance: 'textfield' }}
                      />
                      <span className="text-[9px] text-gray-500">%</span>
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeFill(fill.id)}
                      className="p-0.5 rounded text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Stroke Section */}
      <div className="border-b border-gray-200" />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium">Stroke</span>
          <button
            onClick={addStroke}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title="Add stroke"
          >
            <Plus size={12} className="text-gray-600" />
          </button>
        </div>
        
        {strokes.length === 0 ? (
          <div className="text-[9px] text-gray-400">No strokes</div>
        ) : (
          <div className="space-y-3">
            {strokes.map((stroke, index) => (
              <div key={stroke.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  {/* Visibility toggle */}
                  <button
                    onClick={() => updateStroke(stroke.id, { visible: !stroke.visible })}
                    className={`p-0.5 rounded transition-colors ${
                      stroke.visible 
                        ? 'text-gray-600 hover:text-gray-800' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {stroke.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  
                  {/* Color swatch */}
                  <div className="relative">
                    <input
                      type="color"
                      value={colorToCss(stroke.color)}
                      onChange={(e) => {
                        const color = hexToRgb(e.target.value);
                        updateStroke(stroke.id, { color });
                      }}
                      className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
                    />
                  </div>
                  
                  {/* Stroke color info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] text-gray-600">
                      {colorToCss(stroke.color).toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Opacity */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round(stroke.opacity)}
                      onChange={(e) => updateStroke(stroke.id, { opacity: parseInt(e.target.value) || 0 })}
                      className="w-8 text-[9px] bg-white border border-gray-300 rounded px-1 py-0.5 text-gray-700 focus:border-blue-500 focus:outline-none text-right appearance-none"
                      style={{ MozAppearance: 'textfield' }}
                    />
                    <span className="text-[9px] text-gray-500">%</span>
                  </div>
                  
                  {/* Remove button */}
                  <button
                    onClick={() => removeStroke(stroke.id)}
                    className="p-0.5 rounded text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                </div>
                
                {/* Stroke properties row */}
                <div className="flex gap-2 ml-7">
                  {/* Position */}
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-medium text-gray-500">Position</p>
                    <select
                      value={stroke.position}
                      onChange={(e) => updateStroke(stroke.id, { position: e.target.value as 'inside' | 'center' | 'outside' })}
                      className="text-[9px] bg-white border border-gray-300 rounded px-2 py-1 text-gray-700 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="inside">Inside</option>
                      <option value="center">Center</option>
                      <option value="outside">Outside</option>
                    </select>
                  </div>
                  
                  {/* Width */}
                  <div className="flex flex-col gap-1">
                    <p className="text-[9px] font-medium text-gray-500">Width</p>
                    <div className="flex items-center gap-1 bg-white border border-gray-300 rounded px-2 py-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={stroke.width}
                        onChange={(e) => updateStroke(stroke.id, { width: parseFloat(e.target.value) || 0 })}
                        className="text-[9px] bg-transparent w-8 text-gray-700 focus:outline-none"
                      />
                      <span className="text-[9px] text-gray-400">px</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default FillStrokeControl;
export { FillStrokeControl };
