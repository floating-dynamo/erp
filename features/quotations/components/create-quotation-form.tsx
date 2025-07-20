import Loader from '@/components/loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useGetCustomerDetails } from '@/features/customers/api/use-get-customer-details';
import { useGetEnquiryDetails } from '@/features/enquiries/api/use-get-enquiry-details';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { createQuotationSchema } from '../schemas';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  PlusCircleIcon,
  TrashIcon,
} from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn, formatDate, getMetaData } from '@/lib/utils';
import { useCustomers } from '@/features/customers/api/use-customers';
import { useEnquiries } from '@/features/enquiries/api/use-enquiries';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useAddQuotation } from '../api/use-add-quotation';
import { MetaDataType } from '@/lib/types';
import { useGetQuotationDetails } from '../api/use-get-quotation-details';
import { useEditQuotation } from '../api/use-edit-quotation';
import { QuotationFileUploadManager } from './quotation-file-upload-manager';

type CreateQuotationFormSchema = z.infer<typeof createQuotationSchema>;

interface CreateQuotationFormProps {
  quotationId?: string;
}

const CreateQuotationForm = ({ quotationId }: CreateQuotationFormProps) => {
  const searchParams = useSearchParams();
  const enquiryIdInitialValue = searchParams.get('enquiry') || '';
  const [enquiryId, setEnquiryId] = useState<string | undefined>(
    enquiryIdInitialValue
  );
  const isEdit = !!quotationId;

  const { data: enquiry, isFetching: isFetchingEnquiry } = useGetEnquiryDetails(
    { id: enquiryId ?? '' }
  );
  const { data: customer, isFetching: isFetchingCustomer } =
    useGetCustomerDetails({
      id: enquiry?.customerId || '',
    });
  const { mutate: editQuotation } = useEditQuotation();
  const { data, isFetching: isFetchingCustomerList } = useCustomers();
  const customerList = data?.customers || [];
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const {
    data: enquiryList,
    isFetching: isFetchingEnquiryList,
    refetch: refetchEnquiry,
  } = useEnquiries({ customerId: selectedCustomerId });
  const { data: quotationData, isFetching: isFetchingQuotation } =
    useGetQuotationDetails({
      id: quotationId || '',
    });
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [enquirySelectOpen, setEnquirySelectOpen] = useState(false);
  const { mutate: addQuotation, isPending } = useAddQuotation();
  const uomMetaData = getMetaData(MetaDataType.UOM);
  const currencyMetaData = getMetaData(MetaDataType.CURRENCY);
  const router = useRouter();

  const disableCustomerSelect = !!enquiryIdInitialValue || isEdit;
  const disableEnquirySelect = !!enquiryIdInitialValue || isEdit;

  const form = useForm<CreateQuotationFormSchema>({
    resolver: zodResolver(createQuotationSchema),
  });

  const {
    fields: itemFields,
    append: addItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (isEdit && quotationData) {
      form.reset({
        ...quotationData,
        items: quotationData.items.map((item) => ({
          ...item,
        })),
      });
    } else {
      form.reset({
        customerId: enquiry?.customerId || '',
        enquiryNumber: enquiry?.enquiryNumber || '',
        customerName: enquiry?.customerName || '',
        items: enquiry
          ? enquiry?.items?.map(({ itemCode, itemDescription, quantity }) => ({
              itemDescription,
              quantity,
              itemCode: itemCode || 0,
              amount: 0,
              rate: 0,
              currency: '',
              materialConsideration: '',
              uom: '',
            }))
          : [
              {
                itemDescription: '',
                quantity: 0,
                itemCode: 0,
                amount: 0,
                rate: 0,
                currency: '',
                materialConsideration: '',
                uom: '',
              },
            ],
      });
    }
  }, [enquiry, form, quotationData, isEdit]);

  useEffect(() => {
    if (selectedCustomerId) {
      refetchEnquiry();
    }
  }, [selectedCustomerId, refetchEnquiry]);

  if (
    isFetchingEnquiry ||
    isFetchingCustomer ||
    isFetchingCustomerList ||
    isFetchingEnquiryList ||
    isFetchingQuotation
  ) {
    return <Loader />;
  }

  const onSubmit = (values: CreateQuotationFormSchema) => {
    // Calculating amount for each item
    values.items = values.items.map((item) => ({
      ...item,
      amount: item.rate * item.quantity,
    }));

    console.log('Quotation: ', values);
    if (isEdit && quotationId) {
      editQuotation(
        {
          id: quotationId,
          quotation: {
            id: quotationId,
            ...values,
            totalAmount: values.items.reduce(
              (acc, prev) => prev.amount + acc,
              0
            ),
          },
        },
        {
          onSuccess: () => {
            form.reset();
            router.push('/quotations');
          },
        }
      );
    } else {
      addQuotation(values, {
        onSuccess: () => {
          form.reset();
          router.push('/quotations');
        },
      });
    }
  };

  return (
    <div>
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex px-7 py-3">
          <CardTitle className="text-xl font-bold flex gap-7 items-center">
            {isEdit
              ? `Editing Quotation - ${quotationData?.quoteNumber}`
              : 'Add a new quotation'}
          </CardTitle>
          {enquiryIdInitialValue && (
            <p className="text-sm text-muted-foreground">
              Creating Quotation for Enquiry -{' '}
              <span className="font-semibold">
                {enquiry?.enquiryNumber || 'NA'}
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
              <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-fit mb-4 flex-wrap">
                {/* Customer Name */}
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col bg-white py-4">
                      <FormLabel>
                        Customer <span className="text-orange-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover
                          open={customerSelectOpen}
                          onOpenChange={setCustomerSelectOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'sm:w-[300px] w-full justify-between disabled:text-slate-800',
                                  !field.value && 'text-muted-foreground'
                                )}
                                disabled={disableCustomerSelect}
                              >
                                {customer
                                  ? customer.name
                                  : field.value
                                  ? customerList?.find(
                                      ({ id }) => id === field.value
                                    )?.name
                                  : 'Select Customer'}
                                {!enquiryIdInitialValue && (
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
                                      value={name}
                                      key={id}
                                      onSelect={() => {
                                        form.setValue('customerId', id);
                                        form.setValue('customerName', name);
                                        form.setValue('enquiryNumber', '');
                                        setCustomerSelectOpen(false);
                                        setSelectedCustomerId(id);
                                      }}
                                    >
                                      {name}
                                      <Check
                                        className={cn(
                                          'ml-auto',
                                          id === field.value
                                            ? 'opacity-100'
                                            : 'opacity-0'
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
                    <FormItem className="flex flex-col bg-white py-4">
                      <FormLabel>
                        Enquiry Number{' '}
                        <span className="text-orange-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover
                          open={enquirySelectOpen}
                          onOpenChange={setEnquirySelectOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'sm:w-[300px] w-full justify-between disabled:text-slate-800',
                                  !field.value && 'text-muted-foreground'
                                )}
                                disabled={disableEnquirySelect}
                              >
                                {enquiry
                                  ? enquiry.enquiryNumber
                                  : field.value
                                  ? enquiryList?.enquiries?.find(
                                      ({ enquiryNumber }) =>
                                        enquiryNumber === field.value
                                    )?.enquiryNumber
                                  : 'Select Enquiry Number'}
                                {!enquiryIdInitialValue && (
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
                                  {enquiryList?.enquiries?.map(({ enquiryNumber, id }) => (
                                    <CommandItem
                                      value={enquiryNumber}
                                      key={enquiryNumber}
                                      onSelect={() => {
                                        form.setValue(
                                          'enquiryNumber',
                                          enquiryNumber
                                        );
                                        setEnquirySelectOpen(false);
                                        setEnquiryId(id);
                                      }}
                                    >
                                      {enquiryNumber}
                                      <Check
                                        className={cn(
                                          'ml-auto',
                                          enquiryNumber === field.value
                                            ? 'opacity-100'
                                            : 'opacity-0'
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

                {/* Quotation Date */}
                <FormField
                  control={form.control}
                  name="quotationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start justify-center min-w-72 py-4">
                      <FormLabel>
                        Quotation Date{' '}
                        <span className="text-orange-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon />
                              {field.value
                                ? formatDate(new Date(field.value))
                                : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                const selectedDate = date
                                  ? date.toISOString()
                                  : '';
                                field.onChange(selectedDate);
                              }}
                            />
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
                          <FormLabel>
                            Item Code <span className="text-orange-500">*</span>
                          </FormLabel>
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
                          <FormLabel>
                            Description{' '}
                            <span className="text-orange-500">*</span>
                          </FormLabel>
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
                          <FormLabel>
                            Quantity <span className="text-orange-500">*</span>
                          </FormLabel>
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
                          <FormLabel>
                            Rate <span className="text-orange-500">*</span>
                          </FormLabel>
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
                        <FormItem className="flex flex-col bg-white">
                          <FormLabel>Unit Of Measurement</FormLabel>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      'w-full h-12 justify-between disabled:text-slate-800',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value
                                      ? uomMetaData?.find(
                                          (uom) => uom.value === field.value
                                        )?.label
                                      : 'Select UOM'}
                                    <ChevronsUpDown className="opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Search UOM..."
                                    className="h-9"
                                  />
                                  <CommandList>
                                    <CommandEmpty>No UOM found.</CommandEmpty>
                                    <CommandGroup>
                                      {uomMetaData?.map(({ label, value }) => (
                                        <CommandItem
                                          value={value}
                                          key={label}
                                          onSelect={() => {
                                            form.setValue(
                                              `items.${index}.uom`,
                                              value
                                            );
                                          }}
                                        >
                                          {label}
                                          <Check
                                            className={cn(
                                              'ml-auto',
                                              value === field.value
                                                ? 'opacity-100'
                                                : 'opacity-0'
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

                    {/* Currency */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.currency` as const}
                      render={({ field }) => (
                        <FormItem className="flex flex-col bg-white">
                          <FormLabel>Currency</FormLabel>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      'w-full h-12 justify-between disabled:text-slate-800',
                                      !field.value && 'text-muted-foreground'
                                    )}
                                  >
                                    {field.value
                                      ? currencyMetaData?.find(
                                          (currency) =>
                                            currency.value === field.value
                                        )?.label
                                      : 'Select Currency'}
                                    <ChevronsUpDown className="opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Search Currency..."
                                    className="h-9"
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      No Currency found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {currencyMetaData?.map(
                                        ({ label, value }) => (
                                          <CommandItem
                                            value={value}
                                            key={label}
                                            onSelect={() => {
                                              form.setValue(
                                                `items.${index}.currency`,
                                                value
                                              );
                                            }}
                                          >
                                            {label}
                                            <Check
                                              className={cn(
                                                'ml-auto',
                                                value === field.value
                                                  ? 'opacity-100'
                                                  : 'opacity-0'
                                              )}
                                            />
                                          </CommandItem>
                                        )
                                      )}
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

                    {/* Material */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.materialConsideration` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material Consideration</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter the material considerations"
                              type="text"
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Remarks */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.remarks` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Remarks</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter your remarks"
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
                  variant={'tertiary'}
                  onClick={() =>
                    addItem({
                      itemCode: 0,
                      itemDescription: '',
                      quantity: 0,
                      amount: 0,
                      rate: 0,
                    })
                  }
                >
                  <PlusCircleIcon className="size-4" /> Add Item
                </Button>
              </div>

              {/* T&C */}
              <div className="flex w-full mt-6">
                <FormField
                  control={form.control}
                  name={'termsAndConditions'}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Terms And Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter the terms and conditions..."
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* File Upload Section - only show in edit mode when quotation exists */}
            {isEdit && quotationData?.id && (
              <div className="space-y-4">
                <Separator className="my-7" />
                <QuotationFileUploadManager
                  quotationId={quotationData.id}
                  files={quotationData.attachments || []}
                  onFilesChange={() => {
                    // Optionally refetch quotation data to update the UI
                    window.location.reload();
                  }}
                />
              </div>
            )}

            <Separator className="my-7" />
            <div className="flex items-center justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="w-full md:w-fit"
              >
                {isEdit ? 'Update Quotation' : 'Create Quotation'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </div>
  );
};

export default CreateQuotationForm;
