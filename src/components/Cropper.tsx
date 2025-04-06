import React, { useState, useCallback, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CropShape } from '@/components/Controls';
import { canvasPreview } from '@/components/canvasUtils';

interface CropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  shape: CropShape;
  zoom: number;
  outputWidth: number;
  outputHeight: number;
}

const Cropper: React.FC<CropperProps> = ({
  image,
  onCropComplete,
  onCancel,
  shape,
  zoom,
  outputWidth,
  outputHeight
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  // @ts-ignore
  const [imgWidth, setImgWidth] = useState(0);
  // @ts-ignore
  const [imgHeight, setImgHeight] = useState(0);
  
  const getAspectRatio = useCallback(() => {
    if(shape=== 'rectangle'){
      return undefined
    }
    if (shape === 'circle' || shape === 'square') {
      return 1;
    }
    return outputWidth / outputHeight;
  }, [shape, outputWidth, outputHeight]);
  
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setImgWidth(width);
    setImgHeight(height);
    
    const aspect = getAspectRatio();
    
    // Center crop with the right aspect ratio
    const initialCrop = centerCrop(
      makeAspectCrop(
        { unit: 'px', width: (width * 0.9) },
        aspect || 1,
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(initialCrop);
  }, [getAspectRatio]);
  
  const handleApplyCrop = useCallback(async () => {
    if (!imgRef.current || !previewCanvasRef.current || !completedCrop) {
      return;
    }
    
    // Draw crop to canvas
    await canvasPreview(
      imgRef.current,
      previewCanvasRef.current,
      completedCrop,
      zoom,
      outputWidth,
      outputHeight,
      shape === 'circle'
    );
    
    previewCanvasRef.current.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      onCropComplete(blob);
    }, 'image/png');
  }, [completedCrop, zoom, onCropComplete, shape, outputWidth, outputHeight]);
  
  const getCropStyles = useCallback(() => {
    if (shape === 'circle') {
      return { 
        borderRadius: '50%',
      };
    }
    return {};
  }, [shape]);
  
  return (
    <div className="flex flex-col gap-4">
      <div className={cn(
        "relative overflow-hidden rounded-md border border-gar-300",
        "min-h-[300px] flex items-center justify-center"
      )}>
        <ReactCrop
          crop={crop}
          onChange={(percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={getAspectRatio()}
          circularCrop={shape === 'circle'}
          style={{
            ...getCropStyles(),
            transform: `scale(${zoom})`,
          }}
          ruleOfThirds
          className={cn(
            "max-h-[60vh] w-auto object-contain",
            "transform transition-transform",
            { "scale-100": zoom === 1 }
          )}
        >
          <img
            ref={imgRef}
            src={image}
            alt="Crop preview"
            className="max-w-full h-auto object-contain"
            onLoad={onImageLoad}
            style={{ transform: `scale(${zoom})` }}
          />
        </ReactCrop>
      </div>
      
      {/* Hidden canvas used for final crop output */}
      <canvas
        ref={previewCanvasRef}
        className="hidden"
        width={outputWidth}
        height={outputHeight}
      />
      
      <div className="flex justify-between gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleApplyCrop}>Apply Crop</Button>
      </div>
    </div>
  );
};

export default Cropper;
