import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import apiService from "@/services/api";
import { QueryKeyString } from "@/lib/types";

// Get quotation files
export const useGetQuotationFiles = (quotationId: string) => {
  return useQuery({
    queryKey: [QueryKeyString.QUOTATIONS, quotationId, "files"] as const,
    queryFn: async () => {
      const result = await apiService.getQuotationFiles({ quotationId });
      return result;
    },
    enabled: !!quotationId && quotationId.trim() !== '', // Only run query if quotationId is provided and not empty
  });
};

// Upload quotation files
export const useUploadQuotationFiles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      quotationId, 
      files 
    }: { 
      quotationId: string; 
      files: FileList 
    }) => {
      const result = await apiService.uploadQuotationFiles({ quotationId, files });
      return result;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: data.message,
      });
      
      // Invalidate queries to refresh the quotation data and files
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.QUOTATIONS, variables.quotationId] as const,
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.QUOTATIONS, variables.quotationId, "files"] as const,
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.QUOTATIONS] as const,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload files",
        variant: "destructive",
      });
    },
  });
};

// Download quotation file
export const useDownloadQuotationFile = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      quotationId, 
      fileId, 
      fileName 
    }: { 
      quotationId: string; 
      fileId: string; 
      fileName: string 
    }) => {
      const blob = await apiService.downloadQuotationFile({ quotationId, fileId });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { success: true };
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to download file",
        variant: "destructive",
      });
    },
  });
};

// Delete quotation file
export const useDeleteQuotationFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      quotationId, 
      fileId 
    }: { 
      quotationId: string; 
      fileId: string 
    }) => {
      const result = await apiService.deleteQuotationFile({ quotationId, fileId });
      return result;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: data.message,
      });
      
      // Invalidate queries to refresh the quotation data and files
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.QUOTATIONS, variables.quotationId] as const,
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.QUOTATIONS, variables.quotationId, "files"] as const,
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.QUOTATIONS] as const,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete file",
        variant: "destructive",
      });
    },
  });
};
