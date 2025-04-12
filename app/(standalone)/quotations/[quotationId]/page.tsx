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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { use } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGetQuotationDetails } from '@/features/quotations/api/use-get-quotation-details';
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
      </div>
    </div>
  );
}

export default QuotationDetails;
