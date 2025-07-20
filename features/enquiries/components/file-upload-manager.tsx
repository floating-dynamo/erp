import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText, Download, Trash2, AlertCircle } from 'lucide-react';
import { useUploadEnquiryFiles, useDownloadEnquiryFile, useDeleteEnquiryFile } from '../api/use-enquiry-files';
import { EnquiryFile } from '../schemas';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadManagerProps {
  enquiryId?: string;
  attachments?: EnquiryFile[];
  onFilesChange?: (files: FileList | null) => void;
  disabled?: boolean;
  showUploadButton?: boolean;
}

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  enquiryId,
  attachments = [],
  onFilesChange,
  disabled = false,
  showUploadButton = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadFiles = useUploadEnquiryFiles();
  const downloadFile = useDownloadEnquiryFile();
  const deleteFile = useDeleteEnquiryFile();

  const handleFileSelect = (files: FileList | null) => {
    setSelectedFiles(files);
    onFilesChange?.(files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleUpload = async () => {
    if (!enquiryId || !selectedFiles || selectedFiles.length === 0) return;

    try {
      await uploadFiles.mutateAsync({ enquiryId, files: selectedFiles });
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDownload = (file: EnquiryFile) => {
    if (!enquiryId) return;
    downloadFile.mutate({
      enquiryId,
      fileId: file.id,
      filename: file.originalName,
    });
  };

  const handleDelete = (file: EnquiryFile) => {
    if (!enquiryId) return;
    deleteFile.mutate({
      enquiryId,
      fileId: file.id,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return '🖼️';
    } else if (mimetype.includes('pdf')) {
      return '📄';
    } else if (mimetype.includes('word') || mimetype.includes('document')) {
      return '📝';
    } else if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) {
      return '📊';
    }
    return '📄';
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            File Attachments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Zone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                  Click to upload
                </span>{' '}
                or drag and drop
              </Label>
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                multiple
                disabled={disabled}
                onChange={handleInputChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              PDF, DOC, DOCX, XLS, XLSX, Images, TXT, CSV (Max 10MB each)
            </p>
          </div>

          {/* Selected Files Preview */}
          {selectedFiles && selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Files:</Label>
              <div className="space-y-2">
                {Array.from(selectedFiles).map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const dt = new DataTransfer();
                        Array.from(selectedFiles)
                          .filter((_, i) => i !== index)
                          .forEach((f) => dt.items.add(f));
                        handleFileSelect(dt.files);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Upload Button */}
              {showUploadButton && enquiryId && (
                <Button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploadFiles.isPending || disabled}
                  className="w-full"
                >
                  {uploadFiles.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </div>
                  ) : (
                    <>Upload {selectedFiles.length} file(s)</>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Validation Warning for New Enquiry */}
          {!enquiryId && selectedFiles && selectedFiles.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Files will be uploaded after the enquiry is created.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Existing Attachments */}
      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Uploaded Files ({attachments.length})</span>
              <Badge variant="secondary">{attachments.length} files</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{getFileIcon(file.mimetype)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.originalName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>
                          {file.uploadedAt
                            ? new Date(file.uploadedAt).toLocaleDateString()
                            : 'Unknown date'}
                        </span>
                        {file.uploadedBy && (
                          <>
                            <span>•</span>
                            <span>by {file.uploadedBy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      disabled={downloadFile.isPending}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {enquiryId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file)}
                        disabled={deleteFile.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
