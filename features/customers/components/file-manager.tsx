import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';
import { formatBytes } from '@/lib/utils';
import { CustomerFile } from '@/features/customers/schemas';

interface FileManagerProps {
  customerId: string;
}

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

// Helper function to convert CustomerFile to FileItem
const mapCustomerFileToFileItem = (customerFile: CustomerFile): FileItem => ({
  id: customerFile.id,
  name: customerFile.originalName,
  size: customerFile.size,
  type: customerFile.mimetype,
  uploadedAt: customerFile.uploadedAt ? customerFile.uploadedAt.toISOString() : new Date().toISOString(),
});

export function FileManager({ customerId }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await apiService.getCustomerFiles({ customerId });
      const mappedFiles = (result?.files || []).map(mapCustomerFileToFileItem);
      setFiles(mappedFiles);
    } catch (error) {
      console.error('Fetch files error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch files',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [customerId, toast]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      const result = await apiService.uploadCustomerFiles({
        customerId,
        files: selectedFiles,
      });

      if (result.success) {
        toast({ title: 'Success', description: result.message });
        await fetchFiles();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const blob = await apiService.downloadCustomerFile({
        customerId,
        fileId: file.id,
        filename: file.name,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (file: FileItem) => {
    try {
      const result = await apiService.deleteCustomerFile({
        customerId,
        fileId: file.id,
      });

      if (result.success) {
        toast({ title: 'Success', description: result.message });
        await fetchFiles();
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>File Manager</h1>
      <input
        type='file'
        multiple
        onChange={(e) => handleFileUpload(e.target.files)}
      />
      <div>
        {files.map((file) => (
          <div key={file.id}>
            <span>{file.name}</span>
            <span>{formatBytes(file.size)}</span>
            <span>{file.type}</span>
            <span>{new Date(file.uploadedAt).toLocaleString()}</span>
            <button onClick={() => handleDownload(file)}>Download</button>
            <button onClick={() => handleDelete(file)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
