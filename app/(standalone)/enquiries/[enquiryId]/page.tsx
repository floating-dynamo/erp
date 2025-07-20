'use client';
import Loader from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useGetEnquiryDetails } from '@/features/enquiries/api/use-get-enquiry-details';
import { useToast } from '@/hooks/use-toast';
import { formatDate, generateCsv } from '@/lib/utils';
import {
  ArrowLeftIcon,
  Building2,
  Calendar,
  CirclePlusIcon,
  Copy,
  DownloadIcon,
  MoreHorizontalIcon,
  Package,
  PenIcon,
  ScrollText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { redirect } from 'next/navigation';
import React, { use, useState } from 'react';
import EnquiryDetailsPDFExport from '@/features/enquiries/components/enquiry-details-pdf-export';
import { EnquiryNotFound } from '@/features/enquiries/components/enquiry-not-found';
import { EnquiryFile } from '@/features/enquiries/schemas';
import { useDownloadEnquiryFile, useDeleteEnquiryFile } from '@/features/enquiries/api/use-enquiry-files';
import { Badge } from '@/components/ui/badge';
import { FileIcon, Download, Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface EnquiryDetailsPageProps {
  params: Promise<{ enquiryId: string }>;
}

const FileAttachmentsCard = ({
  enquiryId,
  files,
}: {
  enquiryId: string;
  files: EnquiryFile[];
}) => {
  const { toast } = useToast();
  const downloadFile = useDownloadEnquiryFile();
  const deleteFile = useDeleteEnquiryFile();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<EnquiryFile | null>(null);

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
    } else if (mimetype.includes('text')) {
      return '📄';
    }
    return '📎';
  };

  const handleDownload = (file: EnquiryFile) => {
    downloadFile.mutate({
      enquiryId,
      fileId: file.id,
      filename: file.originalName,
    });
  };

  const handleDeleteClick = (file: EnquiryFile) => {
    setFileToDelete(file);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!fileToDelete) return;

    deleteFile.mutate(
      {
        enquiryId,
        fileId: fileToDelete.id,
      },
      {
        onSuccess: () => {
          toast({
            title: 'File Deleted',
            description: 'The file has been deleted successfully.',
          });
          setFileToDelete(null);
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to delete the file.',
            variant: 'destructive',
          });
          setFileToDelete(null);
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
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No files attached to this enquiry
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Files can be uploaded when editing the enquiry
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
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
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      disabled={downloadFile.isPending}
                      className="flex items-center gap-1"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(file)}
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
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) {
            setFileToDelete(null);
          }
        }}
        title="Delete File"
        description={`Are you sure you want to delete "${fileToDelete?.originalName}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </>
  );
};

const EnquiryDetailsPage = ({ params }: EnquiryDetailsPageProps) => {
  const { enquiryId } = use(params);
  const { data: enquiry, isFetching } = useGetEnquiryDetails({
    id: enquiryId,
  });
  const { toast } = useToast();
  const enquiryDetailsElementId = `enquiry-details-${enquiryId}`;
  // const exportPdfFileName =
  //   (enquiry?.customerName || 'NA').split(' ').join('_') +
  //   '_Enquiry_' +
  //   enquiry?.enquiryNumber;

  if (isFetching) {
    return <Loader text="Loading enquiry details" />;
  }

  if (!enquiry) {
    return <EnquiryNotFound />;
  }

  function backToEnquiriesPage() {
    redirect('/enquiries');
  }

  function copyEnquiryId() {
    navigator.clipboard.writeText(enquiry?.id || '');
    toast({
      title: 'Enquiry ID Copied',
      description: enquiry?.id,
    });
  }

  function copyCustomerId() {
    navigator.clipboard.writeText(enquiry?.customerId || '');
    toast({
      title: 'Customer ID Copied',
      description: enquiry?.customerId,
    });
  }

  function navigateToEditEnquiry() {
    redirect(`/enquiries/edit/${enquiryId}`);
  }

  return (
    <div className="w-full lg:max-w-4xl" id={enquiryDetailsElementId}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            type="button"
            size="icon"
            onClick={backToEnquiriesPage}
            disabled={false}
            data-html2canvas-ignore
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex gap-4 items-center flex-wrap">
              <h1 className="text-xl sm:text-3xl font-bold">
                {enquiry.enquiryNumber || 'NA'}
              </h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild data-html2canvas-ignore>
                    <Copy
                      onClick={copyEnquiryId}
                      className="size-4 text-muted-foreground cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Enquiry ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Due:{' '}
              <span className="font-semibold">
                {formatDate(new Date(enquiry?.quotationDueDate))}
              </span>
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
              className="cursor-pointer text-xs sm:text-sm"
              onClick={() => navigateToEditEnquiry()}
            >
              <PenIcon className="size-4" /> Edit Enquiry
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-xs sm:text-sm"
              onClick={() =>
                redirect(`/quotations/create?enquiry=${enquiryId}`)
              }
            >
              <CirclePlusIcon className="size-4" /> Create Quotation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            <EnquiryDetailsPDFExport enquiry={enquiry}>
              <DropdownMenuItem className="cursor-pointer text-xs sm:text-sm">
                <DownloadIcon className="size-3" /> Save (.pdf)
              </DropdownMenuItem>
            </EnquiryDetailsPDFExport>
            <DropdownMenuItem
              className="cursor-pointer text-xs sm:text-sm"
              onClick={() => generateCsv({ data: enquiry, type: 'Enquiry' })}
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
                <p className="font-medium">{enquiry.customerName}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild data-html2canvas-ignore>
                      <Copy
                        onClick={copyCustomerId}
                        className="size-4 text-muted-foreground cursor-pointer"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy Customer ID</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div data-html2canvas-ignore>
              <Button
                size={'sm'}
                variant={'ghost'}
                onClick={() => redirect(`/customers/${enquiry.customerId}`)}
              >
                View Customer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Enquiry Date</p>
              <p className="font-medium">
                {formatDate(new Date(enquiry.enquiryDate))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Quotation Due Date
              </p>
              <p className="font-medium">
                {formatDate(new Date(enquiry.quotationDueDate))}
              </p>
            </div>
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
                    <th className="text-right py-3 px-4">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiry.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{item.itemCode}</td>
                      <td className="py-3 px-4">{item.itemDescription}</td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {enquiry.termsAndConditions && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {enquiry.termsAndConditions}
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Attachments Section */}
        <FileAttachmentsCard
          enquiryId={enquiryId}
          files={enquiry.attachments || []}
        />
      </div>
    </div>
  );
};

export default EnquiryDetailsPage;

