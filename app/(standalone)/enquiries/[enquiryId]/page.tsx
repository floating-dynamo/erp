"use client";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetEnquiryDetails } from "@/features/enquiries/api/use-get-enquiry-details";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeftIcon,
  Building2,
  Calendar,
  ClipboardXIcon,
  Copy,
  Download,
  Package,
  ScrollText,
} from "lucide-react";
import { redirect } from "next/navigation";
import React, { use } from "react";

interface EnquiryDetailsPageProps {
  params: Promise<{ enquiryId: string }>;
}

const EnquiryDetailsPage = ({ params }: EnquiryDetailsPageProps) => {
  const { enquiryId } = use(params);
  const { data: enquiry, isFetching } = useGetEnquiryDetails({
    id: enquiryId,
  });
  const { toast } = useToast();

  if (isFetching) {
    return <Loader text="Loading enquiry details" />;
  }

  if (!enquiry) {
    return <EnquiryNotFound />;
  }

  function backToEnquiriesPage() {
    redirect("/enquiries");
  }

  function copyEnquiryId() {
    navigator.clipboard.writeText(enquiry?.id || "");
    toast({
      title: "Enquiry ID Copied",
      description: enquiry?.id,
    });
  }

  function copyCustomerId() {
    navigator.clipboard.writeText(enquiry?.customerId || "");
    toast({
      title: "Customer ID Copied",
      description: enquiry?.customerId,
    });
  }

  return (
    <div className="w-full lg:max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            type="button"
            size="icon"
            onClick={backToEnquiriesPage}
            disabled={false}
          >
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex gap-4 items-center flex-wrap">
              <h1 className="text-xl sm:text-3xl font-bold">
                {enquiry.enquiryNumber}
              </h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
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
              Due:{" "}
              <span className="font-semibold">{formatDate(new Date(enquiry?.quotationDueDate))}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Enquiry
          </Button>
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
              <p className="text-sm text-muted-foreground">Customer Name</p>
              <div className="flex items-center gap-3">
                <p className="font-medium">{enquiry.customerName}</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
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
            <div>
              <Button
                size={"sm"}
                variant={"ghost"}
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
      </div>
    </div>
  );
};

export default EnquiryDetailsPage;

const EnquiryNotFound = () => {
  function backToEnquiryListing() {
    redirect("/enquiries");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <ClipboardXIcon className="size-12 text-slate-500" />
      <p className="text-muted-foreground text-lg text-center md:text-2xl">
        Enquiry data not found
      </p>
      <Button
        onClick={backToEnquiryListing}
        variant={"outline"}
        className="md:text-lg"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Enquiry Listing
      </Button>
    </div>
  );
};
