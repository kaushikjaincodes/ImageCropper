
import React, { useState, useCallback } from 'react';
import { Download, RefreshCw, SunMoon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Uploader from '@/components/Uploader';
import Cropper from '@/components/Cropper';
import CropperControls, { CropShape, DimensionPreset } from '@/components/Controls';
import { formatFileSize, getFileSizeInKB } from '@/components/canvasUtils';
import { cn } from '@/lib/utils';

interface ImageCropperContainerProps {
  initialShape?: CropShape;
  initialWidth?: number;
  initialHeight?: number;
  maxSizeMB?: number;
  borderRadius?: number;
}

const ImageCropperContainer: React.FC<ImageCropperContainerProps> = ({
  initialShape = 'square',
  initialWidth = 200,
  initialHeight = 200,
  maxSizeMB = 2,
  borderRadius = 0
}) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    console.log("dark mode on")
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark;
  });
  
  const { toast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [cropComplete, setCropComplete] = useState(false);
  
  const [shape, setShape] = useState<CropShape>(initialShape);
  const [zoom, setZoom] = useState(1);
  const [dimensionPreset, setDimensionPreset] = useState<DimensionPreset>(
    initialWidth === 50 && initialHeight === 50 ? '50x50' : 
    initialWidth === 50 && initialHeight === 75 ? '50x75' : 
    initialWidth === 100 && initialHeight === 100 ? '100x100' : 
    initialWidth === 200 && initialHeight === 200 ? '200x200' : 
    'custom'
  );
  const [customWidth, setCustomWidth] = useState(initialWidth);
  const [customHeight, setCustomHeight] = useState(initialHeight);
  const [outputWidth, setOutputWidth] = useState(initialWidth);
  const [outputHeight, setOutputHeight] = useState(initialHeight);
  const [blobSize, setBlobSize] = useState<number | null>(null);
  

  const handleImageSelected = useCallback((file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setCroppedImage(null);
    setCropComplete(false);
  }, []);
  

  const handleCropComplete = useCallback((blob: Blob) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCroppedImage(reader.result as string);
      setCropComplete(true);
      

      const sizeInKB = getFileSizeInKB(blob);
      setBlobSize(sizeInKB);
      
      if (sizeInKB > maxSizeMB * 1024) {
        toast({
          title: "File size exceeded",
          description: `The cropped image is ${formatFileSize(sizeInKB)}, which exceeds the limit of ${maxSizeMB}MB.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Crop successful",
          description: `Your image has been cropped and is ready to download (${formatFileSize(sizeInKB)}).`
        });
      }
    };
    reader.readAsDataURL(blob);
  }, [maxSizeMB, toast]);
  

  const handleDimensionPresetChange = (preset: DimensionPreset) => {
    setDimensionPreset(preset);
    
    // Set output dimensions based on the preset
    if (preset === '50x50') {
      setOutputWidth(50);
      setOutputHeight(50);
    } else if (preset === '50x75') {
      setOutputWidth(50);
      setOutputHeight(75);
    } else if (preset === '100x100') {
      setOutputWidth(100);
      setOutputHeight(100);
    } else if (preset === '200x200') {
      setOutputWidth(200);
      setOutputHeight(200);
    } else if (preset === 'custom') {
      setOutputWidth(customWidth);
      setOutputHeight(customHeight);
    }
  };
  
  // Handle reset
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setImagePreview(null);
    setCroppedImage(null);
    setCropComplete(false);
    setZoom(1);
    setBlobSize(null);
  }, []);
  
  // Handle change to custom dimensions
  const handleCustomWidthChange = (width: number) => {
    setCustomWidth(width);
    if (dimensionPreset === 'custom') {
      setOutputWidth(width);
    }
  };
  
  const handleCustomHeightChange = (height: number) => {
    setCustomHeight(height);
    if (dimensionPreset === 'custom') {
      setOutputHeight(height);
    }
  };
  
  // Handle download
  const handleDownload = () => {
    if (!croppedImage) return;
    
    const link = document.createElement('a');
    link.href = croppedImage;
    link.download = `cropped-image-${outputWidth}x${outputHeight}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Image downloaded",
      description: "Your cropped image has been downloaded successfully."
    });
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };
  
  // Set dark mode class on document
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  return (
    <div className="min-h-screen w-full bg-background transition-colors">
      <div className="container max-w-6xl py-8 px-4 mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className={cn("text-3xl", "font-bold", isDarkMode? "text-white":"text-black")}>Image Cropper</h1>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <SunMoon className={cn(isDarkMode? "text-white": "text-black")} />
          </Button>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Image Editor</CardTitle>
                <CardDescription>
                  {!selectedFile 
                    ? "Upload an image to get started" 
                    : cropComplete 
                      ? "Your image has been cropped and is ready to download" 
                      : "Adjust the crop area and settings"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center min-h-[350px]">
                {!selectedFile && (
                  <Uploader 
                    onImageSelected={handleImageSelected} 
                    maxSizeMB={maxSizeMB}
                  />
                )}
                
                {selectedFile && imagePreview && !cropComplete && (
                  <Cropper 
                    image={imagePreview}
                    onCropComplete={handleCropComplete}
                    onCancel={handleReset}
                    shape={shape}
                    zoom={zoom}
                    outputWidth={outputWidth}
                    outputHeight={outputHeight}
                  />
                )}
                
                {cropComplete && croppedImage && (
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className={cn(
                      "border rounded overflow-hidden max-w-full",
                      shape === 'circle' && "rounded-full",
                    )}>
                      <img 
                        src={croppedImage} 
                        alt="Cropped preview" 
                        className="max-w-full h-auto"
                        style={{
                          borderRadius: shape === 'circle' ? '50%' : `${borderRadius}px`,
                        }}
                      />
                    </div>
                    
                    {blobSize !== null && (
                      <p className={cn(
                        "text-sm",
                        blobSize > maxSizeMB * 1024 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        Size: {formatFileSize(blobSize)} 
                        {blobSize > maxSizeMB * 1024 && ` (exceeds ${maxSizeMB}MB limit)`}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleReset}
                        className="flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Start Over</span>
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleDownload}
                        className="flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Crop Settings</CardTitle>
                <CardDescription>Adjust how your image will be cropped</CardDescription>
              </CardHeader>
              <CardContent>
                <CropperControls 
                  shape={shape}
                  onShapeChange={setShape}
                  zoom={zoom}
                  onZoomChange={setZoom}
                  dimensionPreset={dimensionPreset}
                  onDimensionPresetChange={handleDimensionPresetChange}
                  customWidth={customWidth}
                  customHeight={customHeight}
                  onCustomWidthChange={handleCustomWidthChange}
                  onCustomHeightChange={handleCustomHeightChange}
                  onReset={handleReset}
                  onApplyCrop={() => {}}
                  isCustom={dimensionPreset === 'custom'}
                />
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Output Information</CardTitle>
                <CardDescription>Details about your cropped image</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Shape</p>
                    <p className="text-sm text-muted-foreground capitalize">{shape}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Dimensions</p>
                    <p className="text-sm text-muted-foreground">{outputWidth} × {outputHeight}px</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Max File Size</p>
                    <p className="text-sm text-muted-foreground">{maxSizeMB}MB</p>
                  </div>
                  
                  {blobSize !== null && (
                    <div>
                      <p className="text-sm font-medium">Current File Size</p>
                      <p className={cn(
                        "text-sm",
                        blobSize > maxSizeMB * 1024 ? "text-destructive" : "text-muted-foreground"
                      )}>
                        {formatFileSize(blobSize)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperContainer;
