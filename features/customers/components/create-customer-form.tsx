'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCustomerSchema, customerAddressSchema } from '../schemas';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Check,
  ChevronsUpDown,
  ImageIcon,
  PlusCircle,
  TrashIcon,
} from 'lucide-react';
import { useAddCustomer } from '../api/use-add-customer';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useEffect, useRef, useState } from 'react';
import { useCountries } from '../api/use-countries';
import Loader from '@/components/loader';
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
import { useGetCustomerDetails } from '../api/use-get-customer-details';
import { useEditCustomer } from '../api/use-edit-customer';
import { CustomerNotFound } from './customer-not-found';
import { useToast } from '@/hooks/use-toast';
import { FileUploadManager } from './file-upload-manager';
import apiService from '@/services/api';

// Infer the form schema type
type CreateCustomerFormSchema = z.infer<typeof createCustomerSchema>;

interface CreateCustomerFormProps {
  onCancel?: () => void;
  showBackButton?: boolean;
  customerId?: string;
}

export const CreateCustomerForm = ({
  onCancel,
  customerId,
  showBackButton = false,
}: CreateCustomerFormProps) => {
  const {
    data: customerData,
    isFetching: isFetchingCustomer,
    status: fetchCustomerStatus,
  } = useGetCustomerDetails({ id: customerId || '' });
  const { mutate: addCustomer, isPending: isPendingAddCustomer } =
    useAddCustomer();
  const { mutate: editCustomer, isPending: isPendingEditCustomer } =
    useEditCustomer();
  const { data: countriesData, isFetching: isFetchingCountries } =
    useCountries();
  const router = useRouter();
  const [countrySelectOpen, setCountrySelectOpen] = useState(false);
  const [stateSelectOpen, setStateSelectOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const isEdit = !!customerId;
  const isPending = isPendingAddCustomer || isPendingEditCustomer;
  const { toast } = useToast();

  const form = useForm<CreateCustomerFormSchema>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: '',
      address: {
        address1: '',
        address2: '',
        city: '',
        state: '',
        country: '',
        pincode: undefined,
      },
      contactDetails: '',
      gstNumber: '',
      vendorId: '',
      customerType: '',
      poc: [],
      attachments: [],
      image: undefined,
    },
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [countryStates, setCountryStates] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && customerData) {
      // Ensure proper data transformation for editing
      const formData = {
        ...customerData,
        address: customerData.address
          ? {
              address1: customerData.address.address1 || '',
              address2: customerData.address.address2 || '',
              city: customerData.address.city || '',
              state: customerData.address.state || '',
              country: customerData.address.country || '',
              pincode: customerData.address.pincode || undefined,
            }
          : {
              address1: '',
              address2: '',
              city: '',
              state: '',
              country: '',
              pincode: undefined,
            },
        poc: customerData.poc || [],
        contactDetails: customerData.contactDetails || '',
        gstNumber: customerData.gstNumber || '',
        vendorId: customerData.vendorId || '',
        customerType: customerData.customerType || '',
        attachments: customerData.attachments || [],
      };
      form.reset(formData);
    }
  }, [isEdit, customerData, form]);

  const watchedCountry = form.watch('address.country');
  useEffect(() => {
    if (countriesData?.data) {
      if (watchedCountry) {
        const selectedCountry = countriesData.data.find(
          (country) => country.country === watchedCountry
        );
        const states = selectedCountry?.cities || [];
        setCountryStates(states);
      } else {
        setCountryStates([]);
      }
    }
  }, [countriesData, watchedCountry]);

  const {
    fields: pocFields,
    append: addPOC,
    remove: removePOC,
  } = useFieldArray({
    control: form.control,
    name: 'poc',
  });

  const onSubmit = async (data: CreateCustomerFormSchema) => {
    console.log('Form submitted with data:', data);
    console.log('Is edit mode:', isEdit);
    console.log('Customer ID:', customerId);

    if (isEdit) {
      // For editing, include all data including attachments
      console.log('Attempting to edit customer...');
      editCustomer(
        { id: customerId!, customer: data },
        {
          onSuccess: () => {
            console.log('Edit success callback triggered');
            toast({
              title: 'Success',
              description: 'Customer updated successfully',
            });
            router.push('/customers');
          },
          onError: (error) => {
            console.error('Edit error callback triggered:', error);
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      // For creating new customers, remove attachments as they'll be uploaded separately
      const customerData = {
        ...data,
        attachments: [],
      };

      addCustomer(customerData, {
        onSuccess: async (response) => {
          toast({
            title: 'Success',
            description: 'Customer created successfully',
          });

          // Upload files if any are selected and we have a customer ID
          if (
            selectedFiles &&
            selectedFiles.length > 0 &&
            response?.customer?.id
          ) {
            try {
              const uploadResult = await apiService.uploadCustomerFiles({
                customerId: response.customer.id,
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
                  'Customer created but file upload failed. You can upload files later.',
                variant: 'destructive',
              });
            }
          }

          router.push('/customers');
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

  const handleFilesChange = (files: FileList | null) => {
    setSelectedFiles(files);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size before processing (7.5MB limit)
      const maxSize = 7.5 * 1024 * 1024; // 7.5MB
      if (file.size > maxSize) {
        toast({
          title: 'Image too large',
          description: 'Please select an image smaller than 7.5MB',
          variant: 'destructive',
        });
        // Clear the input
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }

      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        form.setValue('image', base64String);
      };
      reader.onerror = () => {
        toast({
          title: 'Error reading file',
          description: 'Failed to process the selected image',
          variant: 'destructive',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (isFetchingCountries || isFetchingCustomer) {
    return <Loader />;
  }

  if (fetchCustomerStatus === 'error') {
    return <CustomerNotFound />;
  }

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold flex gap-7 items-center">
          {showBackButton && (
            <Button
              variant="outline"
              type="button"
              size="icon"
              onClick={onCancel}
              disabled={false}
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          {isEdit ? 'Edit the customer details' : 'Add a new customer'}
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Customer Name <span className="text-orange-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter customer name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Address</h2>
              {(
                Object.keys(customerAddressSchema.shape) as Array<
                  keyof typeof customerAddressSchema.shape
                >
              ).map(
                (key) =>
                  key !== 'state' &&
                  key !== 'country' && (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`address.${key}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={`Enter ${key}`}
                              onChange={(e) => {
                                if (key === 'pincode') {
                                  const value = e.target.value;
                                  field.onChange(
                                    value === ''
                                      ? undefined
                                      : Number(value) || undefined
                                  );
                                } else {
                                  field.onChange(e.target.value);
                                }
                              }}
                              value={field.value ?? ''}
                              type={key === 'pincode' ? 'number' : 'text'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
              )}

              <div className="flex items-start gap-8">
                {/* Address - Country */}
                <FormField
                  control={form.control}
                  name="address.country"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-1/2">
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Popover
                          open={countrySelectOpen}
                          onOpenChange={setCountrySelectOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'w-full justify-between',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value
                                  ? countriesData?.data?.find(
                                      (country) =>
                                        country.country === field.value
                                    )?.country
                                  : 'Select Country'}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="sm:w-[300px] w-[200px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search Country..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No Country found.</CommandEmpty>
                                <CommandGroup>
                                  {countriesData?.data?.map((country) => (
                                    <CommandItem
                                      value={country.country}
                                      key={country.country}
                                      onSelect={() => {
                                        form.setValue(
                                          'address.country',
                                          country.country
                                        );
                                        setCountrySelectOpen(false);
                                      }}
                                    >
                                      {country.country}
                                      <Check
                                        className={cn(
                                          'ml-auto',
                                          country.country === field.value
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

                {/* Address - State */}
                <FormField
                  control={form.control}
                  name="address.state"
                  render={({ field }) => (
                    <FormItem className="flex flex-col w-1/2">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Popover
                          open={stateSelectOpen}
                          onOpenChange={setStateSelectOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  'w-full justify-between',
                                  !field.value && 'text-muted-foreground'
                                )}
                                disabled={!form.getValues('address.country')}
                              >
                                {field.value ? field.value : 'Select State'}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="sm:w-[300px] w-[200px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search State..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No State found.</CommandEmpty>
                                <CommandGroup>
                                  {countryStates.map((state) => (
                                    <CommandItem
                                      key={state}
                                      value={state}
                                      onSelect={() => {
                                        field.onChange(state);
                                        setStateSelectOpen(false);
                                      }}
                                    >
                                      {state}
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
            </div>

            {/* POC Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Points of Contact</h2>
              {pocFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-end gap-4 border-b pb-4 flex-wrap"
                >
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name={`poc.${index}.name` as const}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter name"
                            type="text"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mobile */}
                  <FormField
                    control={form.control}
                    name={`poc.${index}.mobile` as const}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Mobile</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === ''
                                  ? undefined
                                  : Number(value) || undefined
                              );
                            }}
                            placeholder="Enter mobile number"
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name={`poc.${index}.email` as const}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter email address"
                            type="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Remove Button */}
                  {/* Remove Button */}
                  <div className="flex items-center justify-center h-full">
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={() => removePOC(index)}
                      className="flex items-center justify-center mb-2"
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Add POC Button */}
              <Button
                type="button"
                variant={'tertiary'}
                onClick={() =>
                  addPOC({
                    name: '',
                    mobile: undefined,
                    email: '',
                  })
                }
              >
                <PlusCircle className="size-4" /> Add POC
              </Button>
            </div>

            {/* Other Fields */}
            <FormField
              control={form.control}
              name="contactDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Details</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter contact details" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gstNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter GST Number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Vendor ID" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Type</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter Customer Type" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Logo Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center gap-x-5">
                    {field.value ? (
                      <div className="size-[72px] relative rounded-md overflow-hidden">
                        <Image
                          src={
                            field.value instanceof File
                              ? URL.createObjectURL(field.value)
                              : field.value
                          }
                          alt="Logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <Avatar className="size-[72px]">
                        <AvatarFallback>
                          <ImageIcon className="size-[36px] text-neutral-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col">
                      <p className="text-sm">Company Logo</p>
                      <p className="text-sm text-muted-foreground">
                        JPEG, PNG, SVG or JPEG, max 1mb
                      </p>
                      <input
                        className="hidden"
                        accept=".jpg, .png, .jpeg, .svg"
                        type="file"
                        ref={inputRef}
                        onChange={handleImageChange}
                        disabled={isPending}
                      />
                      {field.value ? (
                        <Button
                          type="button"
                          disabled={isPending}
                          variant={'destructive'}
                          size={'xs'}
                          className="w-fit mt-2"
                          onClick={() => {
                            field.onChange(null);
                            if (inputRef.current) {
                              inputRef.current.value = '';
                            }
                          }}
                        >
                          Remove Image
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={isPending}
                          variant={'tertiary'}
                          size={'xs'}
                          className="w-fit mt-2"
                          onClick={() => inputRef.current?.click()}
                        >
                          Upload Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />

            {/* File Attachments Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">File Attachments</h2>
              <p className="text-sm text-muted-foreground">
                Upload documents, contracts, or other files related to this
                customer.
              </p>

              <FileUploadManager
                customerId={isEdit ? customerId : undefined}
                attachments={form.watch('attachments') || []}
                onFilesChange={handleFilesChange}
                disabled={isPending}
                showUploadButton={isEdit} // Only show upload button for existing customers
              />

              {!isEdit && selectedFiles && selectedFiles.length > 0 && (
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  📄 {selectedFiles.length} file(s) selected. Files will be
                  uploaded after the customer is created.
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-end gap-3 w-full mt-8">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto min-w-[120px] h-11 text-base font-medium"
                size="default"
                onClick={() => {
                  console.log('Update button clicked');
                  console.log('Form state:', form.formState);
                  console.log('Form errors:', form.formState.errors);
                  console.log('Form values:', form.getValues());
                }}
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isEdit ? 'Updating...' : 'Creating...'}</span>
                  </div>
                ) : (
                  <span>{isEdit ? 'Update Customer' : 'Create Customer'}</span>
                )}
              </Button>

              {/* Cancel/Back Button for mobile */}
              {showBackButton && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isPending}
                  className="w-full sm:w-auto min-w-[120px] h-11 text-base font-medium order-first sm:order-last"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
