
import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploaderProps {
  onImageSelected: (file: File) => void;
  acceptedFileTypes?: string[];
  maxSizeMB?: number;
}

const Uploader: React.FC<UploaderProps> = ({
  onImageSelected,
  acceptedFileTypes = ['image/jpeg', 'image/png'],
  maxSizeMB = 5
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const validateFile = useCallback((file: File): boolean => {
    setError(null);
    
    if (!acceptedFileTypes.includes(file.type)) {
      setError(`File type not supported. Please upload ${acceptedFileTypes.join(' or ')}`);
      return false;
    }
    
    if (file.size > maxSizeBytes) {
      setError(`File is too large. Maximum size is ${maxSizeMB}MB`);
      return false;
    }
    
    return true;
  }, [acceptedFileTypes, maxSizeBytes, maxSizeMB]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        onImageSelected(file);
      }
    }
  }, [onImageSelected, validateFile]);
  
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        onImageSelected(file);
      }
    }
  }, [onImageSelected, validateFile]);

  return (
    <div className="w-full">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-4 transition-all",
          "hover:border-primary/50 cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          {isDragging ? (
            <Upload size={28} className="text-primary animate-pulse" />
          ) : (
            <ImageIcon size={28} className="text-primary" />
          )}
        </div>
        
        <div className="text-center space-y-1">
          <p className="text-lg font-medium">
            {isDragging ? 'Drop your image here' : 'Upload an image'}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG or PNG, up to {maxSizeMB}MB
          </p>
        </div>
        
        <label className="inline-block">
          <input 
            type="file" 
            className="sr-only" 
            onChange={handleFileChange} 
            accept={acceptedFileTypes.join(',')} 
          />
          <div className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Select File
          </div>
        </label>
      </div>
      
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <X size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default Uploader;
