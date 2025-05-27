'use client';

import React, { use } from 'react';
import { redirect } from 'next/navigation';
import { useGetPurchaseOrderDetails } from '@/features/purchase-orders/api/use-get-purchase-order-details';
import Loader from '@/components/loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeftIcon,
  Building2,
  Calendar,
  Copy,
  Package,
  ScrollText,
} from 'lucide-react';

interface PurchaseOrderDetailsPageProps {
  params: Promise<{ purchaseOrderId: string }>;
}

const PurchaseOrderDetailsPage = ({
  params,
}: PurchaseOrderDetailsPageProps) => {
  const { purchaseOrderId } = use(params);
  const { data: purchaseOrder, isFetching } = useGetPurchaseOrderDetails({
    id: purchaseOrderId,
  });
  const { toast } = useToast();
  const purchaseOrderDetailsElementId = `purchase-order-details-${purchaseOrderId}`;

  if (isFetching) {
    return <Loader text="Loading purchase order details" />;
  }

  if (!purchaseOrder) {
    return <p>Purchase Order not found.</p>;
  }

  function backToPurchaseOrdersPage() {
    redirect('/purchase-orders');
  }

  function copyPurchaseOrderId() {
    navigator.clipboard.writeText(purchaseOrder?.id || '');
    toast({
      title: 'Purchase Order ID Copied',
      description: purchaseOrder?.id,
    });
  }

  return (
    <div className="w-full lg:max-w-4xl" id={purchaseOrderDetailsElementId}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            type="button"
            size="icon"
            onClick={backToPurchaseOrdersPage}
            disabled={false}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex gap-4 items-center flex-wrap">
              <h1 className="text-xl sm:text-3xl font-bold">
                Purchase Order - {purchaseOrder.poNumber || 'NA'}
              </h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Copy
                      onClick={copyPurchaseOrderId}
                      className="size-4 text-muted-foreground cursor-pointer"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Purchase Order ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Delivery Date:{' '}
              <span className="font-semibold">
                {formatDate(new Date(purchaseOrder.deliveryDate || ''))}
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
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Customer ID</p>
              <p className="font-medium">{purchaseOrder.customerId}</p>
              <div className='mt-2' data-html2canvas-ignore>
                <Button
                  size={'sm'}
                  variant={'ghost'}
                  onClick={() =>
                    redirect(`/customers/${purchaseOrder.customerId}`)
                  }
                >
                  View Customer
                </Button>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Buyer Name</p>
              <p className="font-medium">{purchaseOrder.buyerName}</p>
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
              <p className="text-sm text-muted-foreground">PO Date</p>
              <p className="font-medium">
                {formatDate(new Date(purchaseOrder.poDate || ''))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivery Date</p>
              <p className="font-medium">
                {formatDate(new Date(purchaseOrder.deliveryDate || ''))}
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
                  {purchaseOrder.items.map((item, index) => (
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

        {purchaseOrder.typeOfService && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Terms and Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {purchaseOrder.typeOfService}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrderDetailsPage;
