import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Trash2, FileText, Loader2, Upload } from 'lucide-react';
import { QuotationFile } from '../schemas';
import { 
  useUploadQuotationFiles, 
  useDownloadQuotationFile, 
  useDeleteQuotationFile 
} from '../api/use-quotation-files';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface QuotationFileUploadManagerProps {
  quotationId: string;
  files: QuotationFile[];
  onFilesChange?: () => void;
}

export const QuotationFileUploadManager: React.FC<QuotationFileUploadManagerProps> = ({
  quotationId,
  files,
  onFilesChange,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const uploadFilesMutation = useUploadQuotationFiles();
  const downloadFileMutation = useDownloadQuotationFile();
  const deleteFileMutation = useDeleteQuotationFile();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select at least one file to upload.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedFiles(files);
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

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      await uploadFilesMutation.mutateAsync({
        quotationId,
        files: selectedFiles,
      });
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onFilesChange?.();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleFileDownload = async (file: QuotationFile) => {
    try {
      await downloadFileMutation.mutateAsync({
        quotationId,
        fileId: file.id,
        fileName: file.originalName,
      });
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleFileDelete = async (file: QuotationFile) => {
    try {
      await deleteFileMutation.mutateAsync({
        quotationId,
        fileId: file.id,
      });
      onFilesChange?.();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('image')) return '🖼️';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (mimetype.includes('sheet') || mimetype.includes('excel')) return '📊';
    if (mimetype.includes('text')) return '📄';
    return '📎';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">File Attachments</h3>
        
        {/* File Upload Section */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
            uploadFilesMutation.isPending && 'opacity-50 cursor-not-allowed'
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
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
              disabled={uploadFilesMutation.isPending}
              onChange={handleInputChange}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Support for PDF, DOC, DOCX, XLS, XLSX, images, TXT, CSV files up to 10MB
          </p>
          {uploadFilesMutation.isPending && (
            <Loader2 className="mx-auto h-6 w-6 text-blue-500 animate-spin mt-2" />
          )}
        </div>

        {/* Selected Files Preview */}
        {selectedFiles && selectedFiles.length > 0 && (
          <div className="space-y-2 mt-4">
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
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              onClick={handleFileUpload}
              disabled={uploadFilesMutation.isPending}
              className="w-full mt-3"
            >
              {uploadFilesMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Files'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {files && files.length > 0 && (
        <div>
          <h4 className="text-md font-medium mb-3">
            Uploaded Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-lg">{getFileIcon(file.mimetype)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(file.size)}
                      </Badge>
                      {file.uploadedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {file.description && (
                      <p className="text-xs text-gray-600 mt-1">
                        {file.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileDownload(file)}
                    disabled={downloadFileMutation.isPending}
                    className="flex items-center space-x-1"
                  >
                    {downloadFileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>Download</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileDelete(file)}
                    disabled={deleteFileMutation.isPending}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    {deleteFileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {files && files.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2">No files uploaded yet</p>
        </div>
      )}
    </div>
  );
};
