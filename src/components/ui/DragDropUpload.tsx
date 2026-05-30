import React, { useRef, useState } from 'react';
import { Upload, FileImage, FileText, AlertCircle } from 'lucide-react';

interface DragDropUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  className?: string;
}

export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFileSelect,
  accept = 'image/*',
  multiple = false,
  maxSizeMB = 10,
  label = 'Drag & drop your files here, or browse',
  helperText = 'Supports JPG, PNG, WEBP and PDF up to 10MB',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = (fileList: FileList): File[] => {
    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    setError(null);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.size > maxSizeBytes) {
        setError(`File ${file.name} is too large. Max size allowed is ${maxSizeMB}MB.`);
        continue;
      }
      validFiles.push(file);
    }
    return validFiles;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = validateFiles(e.dataTransfer.files);
      if (files.length > 0) {
        onFileSelect(multiple ? files : [files[0]]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = validateFiles(e.target.files);
      if (files.length > 0) {
        onFileSelect(multiple ? files : [files[0]]);
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center ${
          isDragActive
            ? 'border-brand-500 bg-brand-50/50 shadow-inner'
            : error
            ? 'border-red-300 bg-red-50/20 hover:bg-red-50/40'
            : 'border-navy-200 bg-navy-50/20 hover:border-navy-300 hover:bg-navy-50/40'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
        />
        
        <div className={`p-4 rounded-full mb-4 transition-transform duration-300 ${
          isDragActive ? 'scale-110 bg-brand-100 text-brand-600' : 'bg-navy-100 text-navy-500'
        }`}>
          {accept.includes('pdf') ? (
            <FileText className="h-8 w-8" />
          ) : (
            <FileImage className="h-8 w-8" />
          )}
        </div>

        <p className="text-sm font-semibold text-navy-800 mb-1">
          {label}
        </p>
        <p className="text-xs text-navy-500 mb-3">{helperText}</p>
        <span className="inline-flex items-center text-xs font-semibold text-brand-700 bg-brand-100/80 px-3 py-1 rounded-full hover:bg-brand-200 transition-colors">
          <Upload className="h-3 w-3 mr-1.5" />
          Browse Files
        </span>

        {error && (
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-center text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg p-2 gap-1.5 animate-fadeIn">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
