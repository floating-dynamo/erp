"use client";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetCustomerDetails } from "@/features/customers/api/use-get-customer-details";
import { useToast } from "@/hooks/use-toast";
import { cn, generatePDF } from "@/lib/utils";
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
  UserRoundX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import { use } from "react";

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

  if (isFetching) {
    return <Loader text="Loading customer details" />;
  }

  if (!customer) {
    return <CustomerNotFound />;
  }

  function copyCustomerId() {
    navigator.clipboard.writeText(customer?.id || "");
    toast({
      title: "Customer ID Copied",
      description: customer?.id,
    });
  }

  function backToCustomersPage() {
    redirect("/customers");
  }

  return (
    <div className="w-full lg:max-w-4xl" id={`customer-details-${customerId}`}>
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
        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild data-html2canvas-ignore>
              <Button variant="outline" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer text-xs sm:text-sm">
                <PenIcon className="size-4" /> Edit Customer
              </DropdownMenuItem>
              <Separator className="my-2" />
              <DropdownMenuLabel>Export</DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer text-xs sm:text-sm"
                onClick={() =>
                  generatePDF(
                    `customer-details-${customerId}`,
                    customer.name.split(" ").join("_")
                  )
                }
              >
                <DownloadIcon className="size-3" /> Save (.pdf)
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-xs sm:text-sm"
                onClick={() =>
                  generatePDF(
                    `customer-details-${customerId}`,
                    customer.name.split(" ").join("_")
                  )
                }
              >
                <DownloadIcon className="size-3" /> Save (.xlsx)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <CompanyDetailsCard
          contactDetails={customer?.contactDetails || "NA"}
          gstNumber={customer?.gstNumber || "NA"}
          vendorId={customer?.vendorId || "NA"}
        />
        <AddressDetailsCard {...customer?.address} />
        <PocDetailsCard poc={customer?.poc || []} />
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
  address1 = "",
  address2 = "",
  city = "",
  state = "",
  country = "",
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

const CustomerNotFound = () => {
  function backToCustomerListing() {
    redirect("/customers");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <UserRoundX className="size-12 text-slate-500" />
      <p className="text-muted-foreground text-lg text-center md:text-2xl">
        Customer data not found
      </p>
      <Button
        onClick={backToCustomerListing}
        variant={"outline"}
        className="md:text-lg"
      >
        <ArrowLeftIcon className="size-4" />
        Back to Customer Listing
      </Button>
    </div>
  );
};
