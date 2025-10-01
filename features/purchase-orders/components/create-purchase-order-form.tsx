'use client';

import React, { useEffect, useState } from 'react';
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
import { createPurchaseOrderSchema } from '../schemas';
import { useAddPurchaseOrder } from '../api/use-add-purchase-order';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn, formatDate } from '@/lib/utils';
import {
  PlusCircleIcon,
  TrashIcon,
  CalendarIcon,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useCustomers } from '@/features/customers/api/use-customers';
import Loader from '@/components/loader';
import { useGetPurchaseOrderDetails } from '../api/use-get-purchase-order-details';
import { useEditPurchaseOrder } from '../api/use-edit-purchase-order';
import { useRouter } from 'next/navigation';
import { useEnquiries } from '@/features/enquiries/api/use-enquiries';
import { useGetEnquiryDetails } from '@/features/enquiries/api/use-get-enquiry-details';

const CreatePurchaseOrderForm = ({
  isEdit = false,
  purchaseOrderId,
}: {
  isEdit?: boolean;
  purchaseOrderId?: string;
}) => {
  const {
    mutate: addPurchaseOrder,
    isPending: isPendingAddPurchaseOrder,
  } = useAddPurchaseOrder();
  const {
    mutate: editPurchaseOrder,
    isPending: isPendingEditPurchaseOrder,
  } = useEditPurchaseOrder();
  const { data: purchaseOrder, isFetching } = useGetPurchaseOrderDetails({
    id: purchaseOrderId || '',
  });
  const [formKey] = useState(0);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [enquirySelectOpen, setEnquirySelectOpen] = useState(false);
  const [poDateOpen, setPoDateOpen] = useState(false);
  const [deliveryDateOpen, setDeliveryDateOpen] = useState(false);
  const { data, isFetching: isFetchingCustomerList } = useCustomers();
  const customerList = data?.customers || [];
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>();
  const {
    data: enquiryList,
    isFetching: isFetchingEnquiryList,
    refetch: refetchEnquiries,
  } = useEnquiries({ customerId: selectedCustomerId });
  const [enquiryId, setEnquiryId] = useState<string | undefined>();
  const { data: enquiry, isFetching: isFetchingEnquiry } = useGetEnquiryDetails({
    id: enquiryId || '',
  });
  const router = useRouter();

  const form = useForm<z.infer<typeof createPurchaseOrderSchema>>({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: {
      poNumber: '',
      poDate: '',
      deliveryDate: '',
      items: [{ itemCode: undefined, itemDescription: '', quantity: 0 }],
      taxPercentage: 0,
      customerId: '',
      enquiryId: '',
    },
  });

  useEffect(() => {
    if (isEdit && purchaseOrder) {
      form.reset(purchaseOrder);
      if (purchaseOrder.customerId) {
        setSelectedCustomerId(purchaseOrder.customerId);
      }
      if (purchaseOrder.enquiryId) {
        setEnquiryId(purchaseOrder.enquiryId);
      }
    }
  }, [isEdit, purchaseOrder, form]);

  useEffect(() => {
    if (selectedCustomerId) {
      refetchEnquiries();
    }
  }, [selectedCustomerId, refetchEnquiries]);

  // Effect to update items when an enquiry is selected
  useEffect(() => {
    if (enquiry && !isEdit) {
      // Update items based on the selected enquiry
      form.setValue('items', enquiry.items.map(item => ({
        itemId: item.itemId || `item-${Date.now()}-${Math.random()}`, // Generate fallback ID if missing
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        quantity: item.quantity
      })));
    }
  }, [enquiry, form, isEdit]);

  const onSubmit = (values: z.infer<typeof createPurchaseOrderSchema>) => {
    if (isEdit && purchaseOrderId) {
      editPurchaseOrder(
        { id: purchaseOrderId, purchaseOrder: values },
        {
          onSuccess: () => {
            form.reset();
            router.push('/purchase-orders');
          },
        }
      );
    } else {
      addPurchaseOrder(values, {
        onSuccess: () => {
          form.reset();
          router.push('/purchase-orders');
        },
      });
    }
  };

  if (isFetching || isFetchingCustomerList || isFetchingEnquiryList || isFetchingEnquiry) {
    return <Loader />;
  }

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          {isEdit ? 'Edit Purchase Order' : 'Add a new Purchase Order'}
        </CardTitle>
        {enquiry && (
          <div className="text-sm text-muted-foreground">
            Using items from Enquiry: {enquiry.enquiryNumber}
          </div>
        )}
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <Form {...form} key={formKey}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-fit mb-4 flex-wrap">
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
                                  'sm:w-[300px] w-full justify-between disabled:text-slate-700',
                                  !field.value && 'text-muted-foreground'
                                )}
                                disabled={false}
                              >
                                {field.value
                                  ? customerList?.find(
                                      (customer) => customer.id === field.value
                                    )?.name
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
                                  {customerList?.map(({ id, name }) => (
                                    <CommandItem
                                      value={name}
                                      key={id}
                                      onSelect={() => {
                                        form.setValue('customerId', id);
                                        form.setValue('enquiryId', '');
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

                <FormField
                  control={form.control}
                  name="enquiryId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col bg-white py-4">
                      <FormLabel>
                        Enquiry <span className="text-orange-500">*</span>
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
                                  'sm:w-[300px] w-full justify-between disabled:text-slate-700',
                                  !field.value && 'text-muted-foreground'
                                )}
                                disabled={!selectedCustomerId}
                              >
                                {field.value
                                  ? enquiryList?.enquiries?.find(
                                      (enq) => enq.id === field.value
                                    )?.enquiryNumber || 'Select Enquiry'
                                  : 'Select Enquiry'}
                                <ChevronsUpDown className="opacity-50" />
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
                                  {enquiryList?.enquiries?.map(({ id, enquiryNumber }) => (
                                    <CommandItem
                                      value={enquiryNumber}
                                      key={id}
                                      onSelect={() => {
                                        form.setValue('enquiryId', id);
                                        setEnquirySelectOpen(false);
                                        setEnquiryId(id);
                                      }}
                                    >
                                      {enquiryNumber}
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
              </div>

              <FormField
                control={form.control}
                name="poNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PO Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter PO number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4 flex-wrap w-full">
                <FormField
                  control={form.control}
                  name="poDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>PO Date</FormLabel>
                      <FormControl>
                        <Popover open={poDateOpen} onOpenChange={setPoDateOpen}>
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
                                setPoDateOpen(false);
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
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Delivery Date</FormLabel>
                      <FormControl>
                        <Popover open={deliveryDateOpen} onOpenChange={setDeliveryDateOpen}>
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
                                setDeliveryDateOpen(false);
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
              <FormField
                control={form.control}
                name="buyerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buyer Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter buyer name"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
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
                            <div>
                              <FormLabel className="text-xs text-muted-foreground">
                                Item Code
                              </FormLabel>
                              <Input
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
                            <div>
                              <FormLabel className="text-xs text-muted-foreground">
                                Description
                              </FormLabel>
                              <Input
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
                            <div>
                              <FormLabel className="text-xs text-muted-foreground">
                                Quantity
                              </FormLabel>
                              <Input
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
                            {field.value.length > 1 && (
                              <Button
                                variant="destructive"
                                type="button"
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
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="tertiary"
                          onClick={() =>
                            field.onChange([
                              ...(field.value || []),
                              {
                                itemCode: undefined,
                                itemDescription: '',
                                quantity: 0,
                              },
                            ])
                          }
                        >
                          <PlusCircleIcon /> Add Item
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Percentage</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter tax percentage"
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator className="my-7" />
            <div className="flex items-center justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={isEdit ? isPendingEditPurchaseOrder : isPendingAddPurchaseOrder}
              >
                {isEdit ? 'Update Purchase Order' : 'Create Purchase Order'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreatePurchaseOrderForm;
