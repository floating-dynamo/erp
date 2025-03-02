'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createEnquirySchema } from '../schemas';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ArrowLeft,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  PlusCircleIcon,
  TrashIcon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useAddEnquiry } from '../api/use-add-enquiry';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import Loader from '@/components/loader';
import { useCustomers } from '@/features/customers/api/use-customers';
import { useGetCustomerDetails } from '@/features/customers/api/use-get-customer-details';
import { useGetEnquiryDetails } from '../api/use-get-enquiry-details';
import { EnquiryNotFound } from '@/app/(standalone)/enquiries/[enquiryId]/page';

interface CreateEnquiryFormProps {
  onCancel?: () => void;
  showBackButton?: boolean;
  enquiryId?: string;
}

type ZodCreateEnquirySchema = z.infer<typeof createEnquirySchema>;

export const CreateEnquiryForm = ({
  onCancel,
  enquiryId,
  showBackButton = false,
}: CreateEnquiryFormProps) => {
  const {
    data: enquiryData,
    isFetching: isFetchingEnquiry,
    status: fetchEnquiryStatus,
  } = useGetEnquiryDetails({ id: enquiryId || '' });
  const { mutate: addEnquiry, isPending } = useAddEnquiry();
  const { data: customers, isLoading } = useCustomers();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customer') || '';
  const { data: customer, isFetching: isFetchingCustomer } =
    useGetCustomerDetails({
      id: customerId || '',
    });
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const isEdit = !!enquiryId;

  const form = useForm<ZodCreateEnquirySchema>({
    resolver: zodResolver(createEnquirySchema),
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isEdit && enquiryData) {
      form.reset(enquiryData);
    }
  }, [isEdit, enquiryData, form]);

  useEffect(() => {
    form.reset({
      customerName: customer?.name || '',
      customerId: customer?.id,
      items: [{ itemCode: 0, itemDescription: '', quantity: 0 }],
      isQotationCreated: false,
    });
  }, [customer, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('file', file);
    }
  };

  const onSubmit = (values: ZodCreateEnquirySchema) => {
    const finalValues = {
      ...values,
    };
    console.log('Enquiry: ', finalValues);
    if (isEdit) {
      console.log('Editing enquiry');
    } else {
      addEnquiry(finalValues, {
        onSuccess: () => {
          form.reset();
          router.push('/enquiries');
        },
      });
    }
  };

  if ((isLoading && !customers && isFetchingCustomer) || isFetchingEnquiry) {
    return <Loader />;
  }

  const customerSelectData =
    customers?.map((customer) => ({
      value: customer.id,
      label: customer.name,
    })) || [];

  if (fetchEnquiryStatus === 'error') {
    return <EnquiryNotFound />;
  }

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold flex gap-7 item-center">
          {showBackButton && (
            <Button
              variant="outline"
              type="button"
              size="icon"
              onClick={onCancel}
              disabled={false}
              className={cn(!onCancel && 'invisible')}
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          Add a new enquiry
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col sticky top-0 bg-white z-50 py-4 border-b-2">
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
                                'sm:w-[300px] w-full justify-between disabled:text-slate-700',
                                !field.value && 'text-muted-foreground'
                              )}
                              disabled={!!customer}
                            >
                              {customer
                                ? customer.name
                                : field.value
                                ? customerSelectData.find(
                                    (customer) => customer.value === field.value
                                  )?.label
                                : 'Select Customer'}
                              <ChevronsUpDown className="opacity-50" />
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
                                {customerSelectData.map((customer) => (
                                  <CommandItem
                                    value={customer.label}
                                    key={customer.value}
                                    onSelect={() => {
                                      form.setValue(
                                        'customerId',
                                        customer.value
                                      );
                                      form.setValue(
                                        'customerName',
                                        customer.label
                                      );
                                      setCustomerSelectOpen(false);
                                    }}
                                  >
                                    {customer.label}
                                    <Check
                                      className={cn(
                                        'ml-auto',
                                        customer.value === field.value
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
              <FormField
                control={form.control}
                name="enquiryNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enquiry Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter enquiry number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enquiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Enquiry Date <span className="text-orange-500">*</span>
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
                              ? new Intl.DateTimeFormat('en-US').format(
                                  new Date(field.value)
                                )
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
              <FormField
                control={form.control}
                name="quotationDueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Quotation Due Date{' '}
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
                              ? new Intl.DateTimeFormat('en-US').format(
                                  new Date(field.value)
                                )
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
              <FormField
                control={form.control}
                name="items"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Items</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-6">
                        {(field.value || []).map((item, index) => (
                          <div
                            key={index}
                            className="flex gap-2 flex-wrap items-end border-b pb-4"
                          >
                            {/* Item Code */}
                            <div>
                              <FormLabel className="text-xs text-muted-foreground">
                                Item Code
                              </FormLabel>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Enter item code"
                                value={item.itemCode || ''}
                                onChange={(e) =>
                                  field.onChange(
                                    (field.value || []).map((itm, i) =>
                                      i === index
                                        ? {
                                            ...itm,
                                            itemCode: Number(e.target.value),
                                          }
                                        : itm
                                    )
                                  )
                                }
                              />
                            </div>

                            {/* Item Description */}
                            <div>
                              <FormLabel className="text-xs text-muted-foreground">
                                Description{' '}
                                <span className="text-orange-500">*</span>
                              </FormLabel>
                              <Input
                                {...field}
                                type="text"
                                placeholder="Enter item description"
                                value={item.itemDescription || ''}
                                onChange={(e) =>
                                  field.onChange(
                                    (field.value || []).map((itm, i) =>
                                      i === index
                                        ? {
                                            ...itm,
                                            itemDescription: e.target.value,
                                          }
                                        : itm
                                    )
                                  )
                                }
                              />
                            </div>

                            {/* Quantity */}
                            <div>
                              <FormLabel className="text-xs text-muted-foreground">
                                Quantity{' '}
                                <span className="text-orange-500">*</span>
                              </FormLabel>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Enter quantity"
                                value={item.quantity || ''}
                                onChange={(e) =>
                                  field.onChange(
                                    (field.value || []).map((itm, i) =>
                                      i === index
                                        ? {
                                            ...itm,
                                            quantity: Number(e.target.value),
                                          }
                                        : itm
                                    )
                                  )
                                }
                              />
                            </div>

                            {/* Remove Button */}
                            {field.value.length > 1 && (
                              <div className="flex items-center justify-center h-full">
                                <Button
                                  variant="destructive"
                                  type="button"
                                  className="mb-2"
                                  onClick={() =>
                                    field.onChange(
                                      (field.value || []).filter(
                                        (_, i) => i !== index
                                      )
                                    )
                                  }
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
                            field.onChange([
                              ...(field.value || []),
                              {
                                itemCode: undefined,
                                itemDescription: '',
                                quantity: undefined,
                              },
                            ])
                          }
                        >
                          <PlusCircleIcon className="size-4" />
                          Add a new item
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="termsAndConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms and conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder="Enter the terms and conditions"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      <Avatar className="size-[72px]">
                        <AvatarFallback>
                          <UploadCloudIcon className="size-[36px] text-neutral-400" />
                        </AvatarFallback>
                      </Avatar>
                      {!field.value ? (
                        <div className="flex flex-col">
                          <p className="text-sm">Attach a file</p>
                          <p className="text-sm text-muted-foreground">
                            You can add a maximum of 1 file, 20MB
                          </p>
                          <input
                            className="hidden"
                            accept=".jpg, .png, .jpeg, .svg, .pdf"
                            type="file"
                            ref={inputRef}
                            onChange={handleFileChange}
                            disabled={false}
                          />
                          <Button
                            type="button"
                            disabled={false}
                            variant={'tertiary'}
                            size={'xs'}
                            className="w-fit mt-2"
                            onClick={() => inputRef.current?.click()}
                          >
                            Upload File
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <p className="text-sm">Uploaded File</p>
                          <div className="text-muted-foreground flex items-center gap-2">
                            <p className="text-sm">{field.value.name}</p>
                            <span
                              className="font-semibold p-0 m-0"
                              onClick={() => {
                                field.onChange(null);
                                if (inputRef.current) {
                                  inputRef.current.value = '';
                                }
                              }}
                            >
                              <XIcon className="size-4 hover:opacity-75 cursor-pointer transition" />
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              />
            </div>
            <Separator className="my-7" />
            <div className="flex items-center justify-end">
              <Button type="submit" size="lg" disabled={isPending}>
                {isEdit ? 'Update Enquiry' : 'Create Enquiry'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
