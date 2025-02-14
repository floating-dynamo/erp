import Loader from "@/components/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { useGetCustomerDetails } from "@/features/customers/api/use-get-customer-details";
import { useGetEnquiryDetails } from "@/features/enquiries/api/use-get-enquiry-details";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { createQuotationSchema, Quotation } from "../schemas";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, PlusCircleIcon, TrashIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn, generateQuoteNumber } from "@/lib/utils";
import { useCustomers } from "@/features/customers/api/use-customers";
import { useEnquiries } from "@/features/enquiries/api/use-enquiries";
import { Input } from "@/components/ui/input";

type CreateQuotationFormSchema = z.infer<typeof createQuotationSchema>;

const CreateQuotationForm = () => {
  const searchParams = useSearchParams();
  const enquiryId = searchParams.get("enquiry") || "";

  const { data: enquiry, isFetching: isFetchingEnquiry } = useGetEnquiryDetails(
    { id: enquiryId }
  );
  const { data: customer, isFetching: isFetchingCustomer } =
    useGetCustomerDetails({
      id: enquiry?.customerId || "",
    });
  const { data: customerList, isFetching: isFetchingCustomerList } =
    useCustomers();
  const { data: enquiryList, isFetching: isFetchingEnquiryList } =
    useEnquiries();

  const form = useForm<CreateQuotationFormSchema>({
    resolver: zodResolver(createQuotationSchema),
  });

  const {
    fields: itemFields,
    append: addItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    form.reset({
      customerId: enquiry?.customerId || "",
      enquiryNumber: enquiry?.enquiryNumber || "",
      customerName: enquiry?.customerName || "",
      items: enquiry
        ? enquiry?.items?.map(({ itemCode, itemDescription, quantity }) => ({
            itemDescription,
            quantity,
            itemCode: itemCode || 0,
            amount: 0,
            rate: 0,
            currency: "",
            materialConsideration: "",
            uom: "",
          }))
        : [
            {
              itemDescription: "",
              quantity: 0,
              itemCode: 0,
              amount: 0,
              rate: 0,
              currency: "",
              materialConsideration: "",
              uom: "",
            },
          ],
    });
  }, [enquiry, form]);

  if (
    isFetchingEnquiry ||
    isFetchingCustomer ||
    isFetchingCustomerList ||
    isFetchingEnquiryList
  ) {
    return <Loader />;
  }

  const onSubmit = (values: CreateQuotationFormSchema) => {
    const quotationDate = new Date().toISOString();
    const finalValues: Quotation = {
      ...values,
      quoteNumber: generateQuoteNumber(
        quotationDate,
        enquiry?.enquiryNumber || ""
      ),
      quotationDate,
    };
    console.log("Quotation: ", finalValues);
  };

  return (
    <div>
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex px-7 py-3">
          <CardTitle className="text-xl font-bold flex gap-7 items-center">
            Add a new quotation
          </CardTitle>
          {enquiry && (
            <p className="text-sm text-muted-foreground">
              Creating Quotation for Enquiry -{" "}
              <span className="font-semibold">
                {enquiry?.enquiryNumber || "NA"}
              </span>
            </p>
          )}
        </CardHeader>
      </Card>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col">
              <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-fit">
                {/* Customer Name */}
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sticky top-0 bg-white z-50 py-4">
                      <FormLabel>
                        Customer <span className="text-orange-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "sm:w-[300px] w-full justify-between disabled:text-slate-800",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={!!customer}
                              >
                                {customer
                                  ? customer.name
                                  : field.value
                                  ? customerList?.find(
                                      ({ id }) => id === field.value
                                    )?.name
                                  : "Select Customer"}
                                {!customer && (
                                  <ChevronsUpDown className="opacity-50" />
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="sm:w-[300px] w-[200px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search Customer..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No Customer found.</CommandEmpty>
                                <CommandGroup>
                                  {customerList?.map(({ id, name }) => (
                                    <CommandItem
                                      value={id}
                                      key={id}
                                      onSelect={() => {
                                        form.setValue("customerId", id);
                                      }}
                                    >
                                      {name}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Enquiry Number */}
                <FormField
                  control={form.control}
                  name="enquiryNumber"
                  render={({ field }) => (
                    <FormItem className="flex flex-col sticky top-0 bg-white z-50 py-4">
                      <FormLabel>
                        Enquiry Number{" "}
                        <span className="text-orange-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "sm:w-[300px] w-full justify-between disabled:text-slate-800",
                                  !field.value && "text-muted-foreground"
                                )}
                                disabled={!!enquiry}
                              >
                                {enquiry
                                  ? enquiry.enquiryNumber
                                  : field.value
                                  ? enquiryList?.find(
                                      ({ enquiryNumber }) =>
                                        enquiryNumber === field.value
                                    )?.enquiryNumber
                                  : "Select Enquiry Number"}
                                {!customer && (
                                  <ChevronsUpDown className="opacity-50" />
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="sm:w-[300px] w-[200px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search Enquiry..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No Enquiry found.</CommandEmpty>
                                <CommandGroup>
                                  {enquiryList?.map(({ enquiryNumber }) => (
                                    <CommandItem
                                      value={enquiryNumber}
                                      key={enquiryNumber}
                                      onSelect={() => {
                                        form.setValue(
                                          "enquiryNumber",
                                          enquiryNumber
                                        );
                                      }}
                                    >
                                      {enquiryNumber}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          enquiryNumber === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Items Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Items</h2>
                {itemFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-end gap-4 border-b pb-4 flex-wrap"
                  >
                    {/* Item Code */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.itemCode` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Code</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter item code"
                              type="number"
                              className="w-full"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || null)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Item Description */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.itemDescription` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter item description"
                              type="text"
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter quantity"
                              type="number"
                              className="w-full"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || null)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Rate */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.rate` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter the rate"
                              type="number"
                              className="w-full"
                              value={field.value}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || null)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Unit of Measurement */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.uom` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit Of Measurement</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter the UOM"
                              type="text"
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Unit of Measurement */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.currency` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter the Currency"
                              type="text"
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Remove Button */}
                    {itemFields.length > 1 && (
                      <div className="flex items-center justify-center h-full">
                        <Button
                          variant="destructive"
                          type="button"
                          onClick={() => removeItem(index)}
                          className="flex items-center justify-center mb-2"
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Item Button */}
                <Button
                  type="button"
                  variant={"tertiary"}
                  onClick={() =>
                    addItem({
                      itemCode: 0,
                      itemDescription: "",
                      quantity: 0,
                      amount: 0,
                      rate: 0,
                    })
                  }
                >
                  <PlusCircleIcon className="size-4" /> Add Item
                </Button>
              </div>
            </div>
            <Separator className="my-7" />
            <div className="flex items-center justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={false}
                className="w-full md:w-fit"
              >
                Create Quotation
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </div>
  );
};

export default CreateQuotationForm;
