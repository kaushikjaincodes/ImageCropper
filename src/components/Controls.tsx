import React from 'react';
import { Circle, Square, RectangleHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {cn} from "@/lib/utils";

export type CropShape = 'circle' | 'square' | 'rectangle';
export type DimensionPreset = '50x50' | '50x75' | '100x100' | '200x200' | 'custom';

interface CropperControlsProps {
  shape: CropShape;
  onShapeChange: (shape: CropShape) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  dimensionPreset: DimensionPreset;
  onDimensionPresetChange: (preset: DimensionPreset) => void;
  customWidth: number;
  customHeight: number;
  onCustomWidthChange: (width: number) => void;
  onCustomHeightChange: (height: number) => void;
  onReset: () => void;
  onApplyCrop: () => void;
  isCustom: boolean;
}


const Controls: React.FC<CropperControlsProps> = ({
  shape,
  onShapeChange,
  zoom,
  onZoomChange,
  dimensionPreset,
  onDimensionPresetChange,
  customWidth,
  customHeight,
  onCustomWidthChange,
  onCustomHeightChange,
  onReset,
  onApplyCrop,
  isCustom
}) => {
  const presets = [
    { id: '50x50', label: '50 × 50', width: 50, height: 50 },
    { id: '50x75', label: '50 × 75', width: 50, height: 75 },
    { id: '100x100', label: '100 × 100', width: 100, height: 100 },
    { id: '200x200', label: '200 × 200', width: 200, height: 200 },
    { id: 'custom', label: 'Custom', width: customWidth, height: customHeight }
  ];

  const handleZoomChange = (values: number[]) => {
    onZoomChange(values[0]);
  };

  const handlePresetChange = (preset: DimensionPreset) => {
    onDimensionPresetChange(preset);
    
    // Auto-select shape based on preset
    if (preset === '50x75') {
      onShapeChange('rectangle');
    } else if (preset !== 'custom') {
      onShapeChange('square');
    }
  };

  const handleCustomWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      onCustomWidthChange(value);
    }
  };

  const handleCustomHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      onCustomHeightChange(value);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2">
        <label className="text-sm font-medium">Shape</label>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={shape === 'circle' ? "default" : "outline"} 
            size="sm"
            onClick={() => onShapeChange('circle')}
            className="flex items-center gap-2"
          >
            <Circle size={16} />
            <span>Circle</span>
          </Button>
          <Button 
            variant={shape === 'square' ? "default" : "outline"} 
            size="sm"
            onClick={() => onShapeChange('square')}
            className="flex items-center gap-2"
          >
            <Square size={16} />
            <span>Square</span>
          </Button>
          <Button 
            variant={shape === 'rectangle' ? "default" : "outline"} 
            size="sm"
            onClick={() => onShapeChange('rectangle')}
            className="flex items-center gap-2"
          >
            <RectangleHorizontal size={16} />
            <span>Rectangle</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Zoom</label>
        <Slider
          value={[zoom]}
          min={1}
          max={3}
          step={0.1}
          onValueChange={handleZoomChange}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1×</span>
          <span>3×</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Output Size</label>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.id}
              variant={dimensionPreset === preset.id ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetChange(preset.id as DimensionPreset)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {isCustom && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="width" className="text-sm font-medium">Width (px)</label>
            <input
              id="width"
              type="number"
              min="1"
              value={customWidth}
              onChange={handleCustomWidthChange}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1",
                "text-sm shadow-sm transition-colors placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              )}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="height" className="text-sm font-medium">Height (px)</label>
            <input
              id="height"
              type="number"
              min="1"
              value={customHeight}
              onChange={handleCustomHeightChange}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1",
                "text-sm shadow-sm transition-colors placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              )}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Controls;
