'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { Card, CardContent } from './card';
import { X, Upload, File, FileText, FileImage, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData: string; // base64 encoded file data
  uploadedAt: Date;
}

interface FileUploadProps {
  value?: FileAttachment[];
  onChange: (files: FileAttachment[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  disabled?: boolean;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return FileImage;
  if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
  if (fileType.includes('code') || fileType.includes('text')) return FileCode;
  return File;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  value = [],
  onChange,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = [
    'image/*',
    'application/pdf',
    '.doc',
    '.docx',
    '.txt',
    '.csv',
    '.xlsx',
    '.xls'
  ],
  disabled = false,
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return;

      const newFiles: FileAttachment[] = [];

      acceptedFiles.forEach((file) => {
        if (value.length + newFiles.length >= maxFiles) return;

        if (file.size > maxSize) {
          // You might want to show a toast here
          console.error(`File ${file.name} is too large`);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const fileAttachment: FileAttachment = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileData: reader.result as string,
            uploadedAt: new Date(),
          };
          
          newFiles.push(fileAttachment);
          
          if (newFiles.length === acceptedFiles.length) {
            onChange([...value, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [value, onChange, maxFiles, maxSize, disabled]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    maxFiles: maxFiles - value.length,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const removeFile = (fileId: string) => {
    if (disabled) return;
    onChange(value.filter((file) => file.id !== fileId));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed cursor-pointer transition-colors duration-200',
          isDragActive || dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4">
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-muted-foreground mb-4" />
          <div className="text-center">
            <p className="text-sm font-medium">
              {isDragActive || dragActive
                ? 'Drop files here'
                : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max {maxFiles} files, up to {formatFileSize(maxSize)} each
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: PDF, DOC, DOCX, Images, TXT, CSV, XLS, XLSX
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({value.length})</h4>
          <div className="space-y-2">
            {value.map((file) => {
              const FileIcon = getFileIcon(file.fileType);
              return (
                <Card key={file.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.fileSize)} • {file.fileType}
                        </p>
                      </div>
                    </div>
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};