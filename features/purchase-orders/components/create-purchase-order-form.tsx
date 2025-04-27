import React, { useState } from 'react';
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

const CreatePurchaseOrderForm = () => {
  const { mutate: addPurchaseOrder, isPending: isPendingAddPurchaseOrder } =
    useAddPurchaseOrder();
  const [formKey] = useState(0);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const { data, isFetching: isFetchingCustomerList } = useCustomers();
  const customerList = data?.customers || [];

  const form = useForm<z.infer<typeof createPurchaseOrderSchema>>({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: {
      poNumber: '',
      poDate: '',
      deliveryDate: '',
      items: [{ itemCode: undefined, itemDescription: '', quantity: 0 }],
      taxPercentage: 0,
      customerId: '',
    },
  });

  const onSubmit = (values: z.infer<typeof createPurchaseOrderSchema>) => {
    addPurchaseOrder(values, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  if (isFetchingCustomerList) {
    return <Loader />;
  }

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          Add a new Purchase Order
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
                                      setCustomerSelectOpen(false);
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
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Delivery Date</FormLabel>
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
                disabled={isPendingAddPurchaseOrder}
              >
                Create Purchase Order
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreatePurchaseOrderForm;
