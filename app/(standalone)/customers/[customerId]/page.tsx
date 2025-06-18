'use client';
import Loader from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useGetCustomerDetails } from '@/features/customers/api/use-get-customer-details';
import { useToast } from '@/hooks/use-toast';
import { cn, generateCsv } from '@/lib/utils';
import {
  ArrowLeftIcon,
  Building2Icon,
  Copy,
  DownloadIcon,
  MailIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PenIcon,
  PhoneIcon,
  UserIcon,
  FileIcon,
  Download,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { redirect } from 'next/navigation';
import { use } from 'react';
import CustomerDetailsPDFExport from '@/features/customers/components/customer-details-pdf-export';
import { CustomerNotFound } from '@/features/customers/components/customer-not-found';
import { useDownloadCustomerFile, useDeleteCustomerFile } from '@/features/customers/api/use-customer-files';
import { CustomerFile } from '@/features/customers/schemas';
import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface CustomerDetailsPageProps {
  params: Promise<{ customerId: string }>;
}

export default function CustomerDetailsPage({
  params,
}: CustomerDetailsPageProps) {
  const { customerId } = use(params);
  const { data: customer, isFetching } = useGetCustomerDetails({
    id: customerId,
  });
  const { toast } = useToast();
  const customerDetailsElementId = `customer-details-${customerId}`;
  const [customerFiles, setCustomerFiles] = useState<CustomerFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);

  // Fetch customer files
  useEffect(() => {
    const fetchFiles = async () => {
      if (!customerId) return;
      
      try {
        setIsLoadingFiles(true);
        const result = await apiService.getCustomerFiles({ customerId });
        setCustomerFiles(result.files || []);
      } catch (error) {
        console.error('Error fetching customer files:', error);
        toast({
          title: 'Error',
          description: 'Failed to load customer files',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingFiles(false);
      }
    };

    fetchFiles();
  }, [customerId, toast]);

  if (isFetching) {
    return <Loader text="Loading customer details" />;
  }

  if (!customer) {
    return <CustomerNotFound />;
  }

  function copyCustomerId() {
    navigator.clipboard.writeText(customer?.id || '');
    toast({
      title: 'Customer ID Copied',
      description: customer?.id,
    });
  }

  function backToCustomersPage() {
    redirect('/customers');
  }

  function navigateToEditCustomer() {
    redirect(`/customers/edit/${customer?.id}`);
  }

  // Helper function to generate consistent colors based on customer name
  const getAvatarStyle = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-red-500 to-red-600',
      'bg-gradient-to-br from-teal-500 to-teal-600',
    ];

    // Generate consistent color based on name
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="w-full lg:max-w-4xl" id={customerDetailsElementId}>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            type="button"
            size="icon"
            onClick={backToCustomersPage}
            disabled={false}
            data-html2canvas-ignore
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex gap-4 items-center flex-wrap">
              {/* Customer Logo */}
              {customer.image && typeof customer.image === 'string' ? (
                <Avatar className="size-12 border-2 border-white shadow-lg">
                  <AvatarImage src={customer.image} alt={`${customer.name} logo`} />
                  <AvatarFallback className={cn(
                    "text-white font-semibold text-lg",
                    getAvatarStyle(customer.name)
                  )}>
                    {customer.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="size-12 border-2 border-white shadow-lg">
                  <AvatarFallback className={cn(
                    "text-white font-semibold text-lg",
                    getAvatarStyle(customer.name)
                  )}>
                    {customer.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <h1 className="text-xl sm:text-3xl font-bold">{customer.name}</h1>
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
            <p className="text-muted-foreground text-xs sm:text-sm">
              {customer?.customerType}
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
              onClick={navigateToEditCustomer}
              className="cursor-pointer text-xs sm:text-sm"
            >
              <PenIcon className="size-4" /> Edit Customer
            </DropdownMenuItem>
            <Separator className="my-2" />
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            <CustomerDetailsPDFExport customer={customer}>
              <DropdownMenuItem className="cursor-pointer text-xs sm:text-sm">
                <DownloadIcon className="size-3" /> Save (.pdf)
              </DropdownMenuItem>
            </CustomerDetailsPDFExport>
            <DropdownMenuItem
              className="cursor-pointer text-xs sm:text-sm"
              onClick={() => generateCsv({ data: customer, type: 'Customer' })}
            >
              <DownloadIcon className="size-3" /> Save (.csv)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <CompanyDetailsCard
          contactDetails={customer?.contactDetails || 'NA'}
          gstNumber={customer?.gstNumber || 'NA'}
          vendorId={customer?.vendorId || 'NA'}
        />
        <AddressDetailsCard {...customer?.address} />
        <PocDetailsCard poc={customer?.poc || []} />
        <FileAttachmentsCard 
          customerId={customerId}
          files={customerFiles}
          isLoading={isLoadingFiles}
          onFileDeleted={() => {
            // Refresh files after deletion
            const fetchFiles = async () => {
              try {
                const result = await apiService.getCustomerFiles({ customerId });
                setCustomerFiles(result.files || []);
              } catch (error) {
                console.error('Error refreshing files:', error);
              }
            };
            fetchFiles();
          }}
        />
      </div>
    </div>
  );
}

const CompanyDetailsCard = ({
  vendorId,
  gstNumber,
  contactDetails,
  className,
}: {
  vendorId: string;
  gstNumber: string;
  contactDetails: string;
  className?: string;
}) => {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2Icon className="h-5 w-5" />
          <p className="font-bold text-xl">Company Details</p>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Vendor ID</p>
          <p className="font-medium">{vendorId}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">GST Number</p>
          <p className="font-medium">{gstNumber}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Contact Number</p>
          <p className="font-medium">{contactDetails}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const AddressDetailsCard = ({
  address1 = '',
  address2 = '',
  city = '',
  state = '',
  country = '',
  pincode,
  className,
}: {
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: number;
  className?: string;
}) => {
  const isAddressEmpty =
    !address1 && !address2 && !city && !state && !country && !pincode;

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5" />
          <p className="text-xl font-bold">Address</p>
        </CardTitle>
      </CardHeader>
      {isAddressEmpty ? (
        <CardContent>
          <p>NA</p>
        </CardContent>
      ) : (
        <CardContent>
          <p className="font-medium">{address1}</p>
          <p className="text-muted-foreground">
            {city}, {state}
          </p>
          <p className="text-muted-foreground">
            {country} - {pincode}
          </p>
        </CardContent>
      )}
    </Card>
  );
};

const PocDetailsCard = ({
  poc,
}: {
  poc: {
    name: string;
    mobile?: number;
    email: string;
  }[];
}) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          <p className="text-xl font-bold">Points of Contact</p>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {poc.map(({ email, mobile, name }, index) => (
            <div key={index}>
              {index > 0 && <Separator className="my-4" />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <div className="flex items-center gap-2">
                    <MailIcon className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${email}`}
                      className="font-medium hover:underline"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              </div>
              {mobile && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Mobile</p>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{mobile}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const FileAttachmentsCard = ({
  customerId,
  files,
  isLoading,
  onFileDeleted,
}: {
  customerId: string;
  files: CustomerFile[];
  isLoading: boolean;
  onFileDeleted: () => void;
}) => {
  const { toast } = useToast();
  const downloadFile = useDownloadCustomerFile();
  const deleteFile = useDeleteCustomerFile();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CustomerFile | null>(null);

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
    } else if (mimetype.includes('excel') || mimetype.includes('sheet')) {
      return '📊';
    } else if (mimetype.includes('text')) {
      return '📄';
    }
    return '📎';
  };

  const handleDownload = (file: CustomerFile) => {
    downloadFile.mutate({
      customerId,
      fileId: file.id,
      filename: file.originalName,
    });
  };

  const handleDeleteClick = (file: CustomerFile) => {
    setFileToDelete(file);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!fileToDelete) return;

    deleteFile.mutate(
      {
        customerId,
        fileId: fileToDelete.id,
      },
      {
        onSuccess: () => {
          toast({
            title: 'File Deleted',
            description: 'The file has been deleted successfully.',
          });
          onFileDeleted();
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
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2 text-muted-foreground">Loading files...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No files attached to this customer</p>
              <p className="text-sm text-muted-foreground mt-1">
                Files can be uploaded when editing the customer
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
                      className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
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
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={deleteFile.isPending}
      />
    </>
  );
};
