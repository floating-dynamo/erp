'use client';

import {
  Building2,
  Package,
  ScrollText,
  Building,
  ArrowLeftIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PenIcon,
  DownloadIcon,
  FileIcon,
  Download,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { use, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGetQuotationDetails } from '@/features/quotations/api/use-get-quotation-details';
import { useDownloadQuotationFile, useDeleteQuotationFile } from '@/features/quotations/api/use-quotation-files';
import { QuotationFile } from '@/features/quotations/schemas';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import apiService from '@/services/api';
import Loader from '@/components/loader';
import { formatDate, generateCsv } from '@/lib/utils';
import { redirect } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import QuotationDetailsPDFExport from '@/features/quotations/components/quotation-details-pdf-export';

interface QuotationDetailsPageProps {
  params: Promise<{ quotationId: string }>;
}

const FileAttachmentsCard = ({
  quotationId,
  files,
}: {
  quotationId: string;
  files: QuotationFile[];
}) => {
  const { toast } = useToast();
  const downloadFile = useDownloadQuotationFile();
  const deleteFile = useDeleteQuotationFile();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<QuotationFile | null>(null);
  const [quotationFiles, setQuotationFiles] = useState<QuotationFile[]>(files);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  // Fetch quotation files
  useEffect(() => {
    const fetchFiles = async () => {
      if (!quotationId) return;

      try {
        setIsLoadingFiles(true);
        const result = await apiService.getQuotationFiles({ quotationId });
        setQuotationFiles(result.files || []);
      } catch (error) {
        console.error('Error fetching quotation files:', error);
        toast({
          title: 'Error',
          description: 'Failed to load quotation files',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingFiles(false);
      }
    };

    fetchFiles();
  }, [quotationId, toast]);

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

  const handleDownload = (file: QuotationFile) => {
    if (!quotationId) return;
    downloadFile.mutate({
      quotationId,
      fileId: file.id,
      fileName: file.originalName,
    });
  };

  const handleDelete = (file: QuotationFile) => {
    setFileToDelete(file);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!fileToDelete || !quotationId) return;
    
    deleteFile.mutate(
      {
        quotationId,
        fileId: fileToDelete.id,
      },
      {
        onSuccess: () => {
          // Refresh files after deletion
          const fetchFiles = async () => {
            try {
              const result = await apiService.getQuotationFiles({
                quotationId,
              });
              setQuotationFiles(result.files || []);
            } catch (error) {
              console.error('Error refreshing files:', error);
            }
          };
          fetchFiles();
        },
      }
    );
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileIcon className="h-5 w-5" />
              <span className="text-xl font-bold">File Attachments</span>
            </div>
            <Badge variant="secondary">
              {quotationFiles.length} {quotationFiles.length === 1 ? 'file' : 'files'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingFiles ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2 text-muted-foreground">
                Loading files...
              </span>
            </div>
          ) : quotationFiles.length === 0 ? (
            <div className="text-center py-8">
              <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No files attached to this quotation
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Files can be uploaded when editing the quotation
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {quotationFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">
                      {getFileIcon(file.mimetype)}
                    </span>
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
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      disabled={downloadFile.isPending}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      disabled={deleteFile.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete File"
        description={`Are you sure you want to delete "${fileToDelete?.originalName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
      />
    </>
  );
};

function QuotationDetails({ params }: QuotationDetailsPageProps) {
  const { quotationId } = use(params);
  const { data: quotation, isFetching } = useGetQuotationDetails({
    id: quotationId,
  });
  const { toast } = useToast();
  const quotationDetailsElementId = `quotation-details-${quotationId}`;

  if (isFetching) {
    return <Loader text="Loading quotation details" />;
  }

  if (!quotation) return <p>Quotation not found.</p>;

  function backToQuotationsPage() {
    redirect('/quotations');
  }

  function copyQuotationId() {
    navigator.clipboard.writeText(quotation?.id || '');
    toast({
      title: 'Quotation ID Copied',
      description: quotation?.id,
    });
  }

  function handleEditQuotation() {
    redirect(`/quotations/edit/${quotationId}`);
  }

  return (
    <div className="w-full lg:max-w-4xl" id={quotationDetailsElementId}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            type="button"
            size="icon"
            onClick={backToQuotationsPage}
            disabled={false}
            data-html2canvas-ignore
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex gap-4 items-center flex-wrap">
              <h1 className="text-xl sm:text-3xl font-bold">
                {quotation.quoteNumber}
              </h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild data-html2canvas-ignore>
                    <CopyIcon
                      onClick={copyQuotationId}
                      className="size-4 text-muted-foreground cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Quotation ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Created on: {formatDate(new Date(quotation?.quotationDate || ''))}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild data-html2canvas-ignore>
            <Button variant="outline" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={handleEditQuotation}
              className="cursor-pointer text-xs sm:text-sm"
            >
              <PenIcon className="size-4" /> Edit Quotation
            </DropdownMenuItem>
            <Separator className="my-2" />
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            <QuotationDetailsPDFExport quotation={quotation}>
              <DropdownMenuItem className="cursor-pointer text-xs sm:text-sm">
                <DownloadIcon className="size-3" /> Save (.pdf)
              </DropdownMenuItem>
            </QuotationDetailsPDFExport>
            <DropdownMenuItem
              className="cursor-pointer text-xs sm:text-sm"
              onClick={() =>
                generateCsv({ data: quotation, type: 'Quotation' })
              }
            >
              <DownloadIcon className="size-3" /> Save (.csv)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Customer Name</p>
              <div className="flex items-center gap-3">
                <p className="font-medium">{quotation.customerName}</p>
              </div>
            </div>
            <div data-html2canvas-ignore>
              <Button
                size={'sm'}
                variant={'ghost'}
                onClick={() => redirect(`/customers/${quotation.customerId}`)}
              >
                View Customer
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enquiry Number</p>
              <p className="font-semibold">{quotation.enquiryNumber}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotation.myCompanyName && (
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-medium">{quotation.myCompanyName}</p>
              </div>
            )}
            {quotation.myCompanyGSTIN && (
              <div>
                <p className="text-sm text-muted-foreground">GSTIN</p>
                <p className="font-medium">{quotation.myCompanyGSTIN}</p>
              </div>
            )}
            {quotation.myCompanyPAN && (
              <div>
                <p className="text-sm text-muted-foreground">PAN</p>
                <p className="font-medium">{quotation.myCompanyPAN}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Item Code</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-left py-3 px-4">Material</th>
                    <th className="text-right py-3 px-4">Quantity</th>
                    <th className="text-left py-3 px-4">UOM</th>
                    <th className="text-right py-3 px-4">Rate</th>
                    <th className="text-left py-3 px-4">Currency</th>
                    <th className="text-right py-3 px-4">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.itemCode}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p>{item.itemDescription}</p>
                          {item.remarks && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.remarks}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {item.materialConsideration}
                      </td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                      <td className="py-3 px-4">{item.uom}</td>
                      <td className="py-3 px-4 text-right">{item.rate}</td>
                      <td className="py-3 px-4">{item.currency}</td>
                      <td className="py-3 px-4 text-right">{item.amount}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td colSpan={7} className="py-3 px-4 text-right">
                      Total Amount:
                    </td>
                    <td className="py-3 px-4 text-right">
                      {quotation.totalAmount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {quotation.termsAndConditions && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {quotation.termsAndConditions}
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Attachments Section */}
        <FileAttachmentsCard
          quotationId={quotationId}
          files={quotation.attachments || []}
        />
      </div>
    </div>
  );
}

export default QuotationDetails;
