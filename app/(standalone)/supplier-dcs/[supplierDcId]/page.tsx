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
import { useGetSupplierDCDetails } from '@/features/supplier-dc/api/use-get-supplier-dc-details';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeftIcon,
  Building2,
  Calendar,
  Copy,
  Package,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import React, { use } from 'react';

interface SupplierDcDetailsPageProps {
  params: Promise<{ supplierDcId: string }>;
}

const SupplierDcDetailsPage = ({ params }: SupplierDcDetailsPageProps) => {
  const { supplierDcId } = use(params);
  const { data: supplierDc, isFetching } = useGetSupplierDCDetails({
    id: supplierDcId,
  });
  const { toast } = useToast();
  const supplierDcDetailsElementId = `supplier-dc-details-${supplierDcId}`;

  if (isFetching) {
    return <Loader text="Loading supplier DC details" />;
  }

  if (!supplierDc) {
    return <div>Supplier DC not found.</div>;
  }

  function backToSupplierDcsPage() {
    redirect('/supplier-dcs');
  }

  function copySupplierDcId() {
    navigator.clipboard.writeText(supplierDc?.id || '');
    toast({
      title: 'Supplier DC ID Copied',
      description: supplierDc?.id,
    });
  }

  return (
    <div className="w-full lg:max-w-4xl" id={supplierDcDetailsElementId}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            type="button"
            size="icon"
            onClick={backToSupplierDcsPage}
            disabled={false}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex gap-4 items-center flex-wrap">
              <h1 className="text-xl sm:text-3xl font-bold">
                {supplierDc.dcNo || 'NA'}
              </h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Copy
                      onClick={copySupplierDcId}
                      className="size-4 text-muted-foreground cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Supplier DC ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Date:{' '}
              <span className="font-semibold">
                {formatDate(new Date(supplierDc?.date))}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              From / To Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-medium">{supplierDc.from}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">To</p>
              <p className="font-medium">{supplierDc.to}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              GSTIN & PO Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">GSTIN</p>
              <p className="font-medium">{supplierDc.gstIn}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PO Reference</p>
              <p className="font-medium">{supplierDc.poRef}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Work Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">WO Number</th>
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-right py-3 px-4">Quantity</th>
                    <th className="text-right py-3 px-4">Purpose</th>
                    <th className="text-right py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierDc.workOrders.map((wo, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{wo.woNumber}</td>
                      <td className="py-3 px-4">{wo.woDescription}</td>
                      <td className="py-3 px-4 text-right">{wo.qty}</td>
                      <td className="py-3 px-4 text-right">{wo.purpose}</td>
                      <td className="py-3 px-4 text-right">{wo.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupplierDcDetailsPage;
