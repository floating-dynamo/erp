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
import {
  ArrowLeft,
  CalendarIcon,
  Check,
  ChevronsUpDown,
  PlusCircleIcon,
  TrashIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { useAddEnquiry } from '../api/use-add-enquiry';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, formatDate } from '@/lib/utils';
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
import { useEditEnquiry } from '../api/use-edit-enquiry';
import { EnquiryNotFound } from './enquiry-not-found';
import { FileUploadManager } from './file-upload-manager';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

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
  const { mutate: addEnquiry, isPending: isPendingAddEnquiry } =
    useAddEnquiry();
  const { data, isLoading } = useCustomers();
  const { customers } = data || { customers: [] };
  const { mutate: editEnquiry, isPending: isPendingEditEnquiry } =
    useEditEnquiry();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customer') || '';
  const { data: customer, isFetching: isFetchingCustomer } =
    useGetCustomerDetails({
      id: customerId || '',
    });
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const isEdit = !!enquiryId;
  const isPending = isPendingEditEnquiry || isPendingAddEnquiry;
  const { toast } = useToast();

  const form = useForm<ZodCreateEnquirySchema>({
    resolver: zodResolver(createEnquirySchema),
    defaultValues: {
      customerId: '',
      customerName: '',
      enquiryNumber: '',
      enquiryDate: '',
      quotationDueDate: '',
      items: [{ itemCode: 0, itemDescription: '', quantity: 0 }],
      termsAndConditions: '',
      file: undefined,
      isQotationCreated: false,
    },
  });
  const router = useRouter();

  useEffect(() => {
    if (isEdit && enquiryData) {
      console.log('Editing Enquiry Data: ', enquiryData);
      setFormKey((prevKey) => prevKey + 1);
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

  const handleFilesChange = (files: FileList | null) => {
    setSelectedFiles(files);
  };

  const onSubmit = (values: ZodCreateEnquirySchema) => {
    const finalValues = {
      ...values,
    };
    console.log('Enquiry: ', finalValues);
    if (isEdit) {
      console.log('Editing enquiry');
      editEnquiry(
        {
          id: enquiryId,
          enquiry: finalValues,
        },
        {
          onSuccess: () => {
            form.reset();
            router.push('/enquiries');
          },
        }
      );
    } else {
      addEnquiry(finalValues, {
        onSuccess: async (response) => {
          toast({
            title: 'Success',
            description: 'Enquiry created successfully',
          });

          // Upload files if any are selected and we have an enquiry ID
          if (
            selectedFiles &&
            selectedFiles.length > 0 &&
            response?.enquiry?.id
          ) {
            try {
              const uploadResult = await apiService.uploadEnquiryFiles({
                enquiryId: response.enquiry.id,
                files: selectedFiles,
              });

              if (uploadResult.success) {
                toast({
                  title: 'Files Uploaded',
                  description: `${selectedFiles.length} file(s) uploaded successfully`,
                });
              }
            } catch (error) {
              console.error('File upload error:', error);
              toast({
                title: 'File Upload Warning',
                description:
                  'Enquiry created but file upload failed. You can upload files later.',
                variant: 'destructive',
              });
            }
          }

          form.reset();
          router.push('/enquiries');
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
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
        <Form {...form} key={formKey}>
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
                              disabled={!!customer || isEdit}
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
              {/* File Attachments Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">File Attachments</h2>
                <p className="text-sm text-muted-foreground">
                  Upload documents, contracts, or other files related to this
                  enquiry.
                </p>

                <FileUploadManager
                  enquiryId={isEdit ? enquiryId : undefined}
                  attachments={form.watch('attachments') || []}
                  onFilesChange={handleFilesChange}
                  disabled={isPending}
                  showUploadButton={isEdit} // Only show upload button for existing enquiries
                />

                {!isEdit && selectedFiles && selectedFiles.length > 0 && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    📄 {selectedFiles.length} file(s) selected. Files will be
                    uploaded after the enquiry is created.
                  </div>
                )}
              </div>
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
