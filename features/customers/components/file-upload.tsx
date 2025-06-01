'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, File } from 'lucide-react';
import { CustomerFile } from '../schemas';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  files: CustomerFile[];
  onFilesChange: (files: CustomerFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
}

export const FileUpload = ({
  files,
  onFilesChange,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt']
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size must be less than ${formatFileSize(maxFileSize)}`;
    }
    
    if (files.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }

    return null;
  };

  const handleFileSelect = async (selectedFiles: FileList) => {
    const newFiles: CustomerFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        toast({
          title: 'File Upload Error',
          description: `${file.name}: ${validationError}`,
          variant: 'destructive',
        });
        continue;
      }

      // Create a unique ID for the file
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const customerFile: CustomerFile = {
        id: fileId,
        originalName: file.name,
        filename: fileId + '_' + file.name, // Unique filename
        mimetype: file.type,
        size: file.size,
        uploadedAt: new Date(),
      };

      newFiles.push(customerFile);
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
      toast({
        title: 'Files Added',
        description: `${newFiles.length} file(s) added successfully`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    onFilesChange(updatedFiles);
    toast({
      title: 'File Removed',
      description: 'File has been removed from the list',
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">File Attachments</Label>
      
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className="h-10 w-10 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Click to upload</span> or drag and drop files here
          </p>
          <p className="text-xs text-gray-500">
            Max file size: {formatFileSize(maxFileSize)} • Max files: {maxFiles}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported: Images, PDF, DOC, DOCX, TXT
          </p>
        </CardContent>
      </Card>

      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => {
          if (e.target.files) {
            handleFileSelect(e.target.files);
          }
        }}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Uploaded Files ({files.length})</Label>
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <File className="h-5 w-5 text-gray-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.originalName}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(file.size)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {file.mimetype}
                        </Badge>
                        {file.uploadedAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {file.description && (
                  <p className="text-xs text-gray-600 mt-2 ml-8">
                    {file.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};