import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
  isUploading?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = "image/*",
  maxSize = 2 * 1024 * 1024, // 2MB default
  className,
  isUploading = false,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [accept]: [],
    },
    maxSize,
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "file-upload-area rounded-lg p-6 text-center cursor-pointer transition-all duration-300",
        isDragActive && "border-primary-500 bg-primary-50",
        isUploading && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input {...getInputProps()} disabled={isUploading} />
      
      {isUploading ? (
        <div className="flex flex-col items-center">
          <i className="fas fa-spinner fa-spin text-3xl text-primary-500 mb-3"></i>
          <p className="text-sm text-gray-600 mb-2">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-3"></i>
          <p className="text-sm text-gray-600 mb-2">
            {isDragActive ? "Drop the file here" : "Click to upload or drag and drop"}
          </p>
          <p className="text-xs text-gray-400">
            {accept === "image/*" ? "PNG, JPG up to" : "Files up to"} {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      )}
      
      {!isUploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={(e) => e.stopPropagation()}
        >
          Choose File
        </Button>
      )}
    </div>
  );
}
