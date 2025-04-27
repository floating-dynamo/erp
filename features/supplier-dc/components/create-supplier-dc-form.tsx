'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierDcSchema } from '../schemas';
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
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, PlusCircleIcon, TrashIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { z } from 'zod';
import { useAddSupplierDc } from '../api/use-add-supplier-dc';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { useEditSupplierDc } from '../api/use-edit-supplier-dc';
import { useGetSupplierDCDetails } from '../api/use-get-supplier-dc-details';

interface CreateSupplierDcFormProps {
  supplierDcId?: string;
}

export const CreateSupplierDcForm = ({
  supplierDcId,
}: CreateSupplierDcFormProps) => {
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();
  const { mutate: addSupplierDc, isPending: isPendingAddSupplierDc } =
    useAddSupplierDc();
  type ZodCreateSupplierDcSchema = z.infer<typeof supplierDcSchema>;
  const isEdit = !!supplierDcId;
  const { mutate: editSupplierDc, isPending: isPendingEditSupplierDc } =
    useEditSupplierDc();
  const { data: supplierDcData } = useGetSupplierDCDetails({
    id: supplierDcId || '',
  });

  const form = useForm({
    resolver: zodResolver(supplierDcSchema),
    defaultValues: {
      from: '',
      to: '',
      gstIn: '',
      poRef: '',
      dcNo: '',
      date: '',
      workOrders: [
        { woNumber: '', woDescription: '', qty: 1, purpose: '', remarks: '' },
      ],
      returnable: false,
      nonreturnable: false,
    },
  });

  const isPending = isPendingAddSupplierDc || isPendingEditSupplierDc;

  useEffect(() => {
    if (isEdit && supplierDcData) {
      form.reset(supplierDcData);
    }
    setFormKey((prevKey) => prevKey + 1);
  }, []);

  const onSubmit = (values: ZodCreateSupplierDcSchema) => {
    console.log('Supplier DC:', values);
    if (isEdit) {
      editSupplierDc({ id: supplierDcId!, supplierDc: values });
      router.push(`/supplier-dcs/${supplierDcId}`);
    } else {
      addSupplierDc(values);
      router.push('/supplier-dcs');
    }
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex p-7">
        <CardTitle className="text-xl font-bold">
          {isEdit ? 'Editing Supplier DC' : 'Create Supplier DC'}
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
                name="from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <span className="text-orange-500">*</span>
                    <FormControl>
                      <Textarea
                        rows={7}
                        {...field}
                        placeholder="Enter from location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <span className="text-orange-500">*</span>
                    <FormControl>
                      <Textarea
                        rows={7}
                        {...field}
                        placeholder="Enter to location"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 w-full items-center flex-wrap">
                <FormField
                  control={form.control}
                  name="gstIn"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>GSTIN</FormLabel>
                      <span className="text-orange-500">*</span>
                      <FormControl>
                        <Input {...field} placeholder="Enter GSTIN" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="poRef"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>PO Reference</FormLabel>
                      <span className="text-orange-500">*</span>
                      <FormControl>
                        <Input {...field} placeholder="Enter PO Reference" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>Date</FormLabel>
                      <span className="text-orange-500">*</span>
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
              </div>
              {/* <FormField
                  control={form.control}
                  name="dcNo"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-1/3">
                      <FormLabel>DC No.</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter DC No." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              <FormField
                control={form.control}
                name="workOrders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Orders</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-6">
                        {field.value.map((workOrder, index) => (
                          <div
                            key={index}
                            className="flex flex-wrap gap-4 items-end border-b pb-4"
                          >
                            <div>
                              <FormLabel>WO Number</FormLabel>
                              <span className="text-orange-500">*</span>
                              <Input
                                value={workOrder.woNumber}
                                onChange={(e) => {
                                  const updatedWorkOrders = [...field.value];
                                  updatedWorkOrders[index].woNumber =
                                    e.target.value;
                                  field.onChange(updatedWorkOrders);
                                }}
                                placeholder="Enter WO Number"
                              />
                            </div>
                            <div>
                              <FormLabel>WO Description</FormLabel>
                              <span className="text-orange-500">*</span>
                              <Input
                                value={workOrder.woDescription}
                                onChange={(e) => {
                                  const updatedWorkOrders = [...field.value];
                                  updatedWorkOrders[index].woDescription =
                                    e.target.value;
                                  field.onChange(updatedWorkOrders);
                                }}
                                placeholder="Enter WO Description"
                              />
                            </div>
                            <div>
                              <FormLabel>Quantity</FormLabel>
                              <span className="text-orange-500">*</span>
                              <Input
                                type="number"
                                value={workOrder.qty}
                                onChange={(e) => {
                                  const updatedWorkOrders = [...field.value];
                                  updatedWorkOrders[index].qty = Number(
                                    e.target.value
                                  );
                                  field.onChange(updatedWorkOrders);
                                }}
                                placeholder="Enter Quantity"
                              />
                            </div>
                            <div>
                              <FormLabel>Purpose</FormLabel>
                              <Input
                                value={workOrder.purpose}
                                onChange={(e) => {
                                  const updatedWorkOrders = [...field.value];
                                  updatedWorkOrders[index].purpose =
                                    e.target.value;
                                  field.onChange(updatedWorkOrders);
                                }}
                                placeholder="Enter Purpose"
                              />
                            </div>
                            <div>
                              <FormLabel>Remarks</FormLabel>
                              <Input
                                value={workOrder.remarks}
                                onChange={(e) => {
                                  const updatedWorkOrders = [...field.value];
                                  updatedWorkOrders[index].remarks =
                                    e.target.value;
                                  field.onChange(updatedWorkOrders);
                                }}
                                placeholder="Enter Remarks"
                              />
                            </div>
                            {field.value.length > 1 && (
                              <Button
                                variant="destructive"
                                type="button"
                                onClick={() => {
                                  const updatedWorkOrders = field.value.filter(
                                    (_, i) => i !== index
                                  );
                                  field.onChange(updatedWorkOrders);
                                }}
                              >
                                <TrashIcon />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          onClick={() => {
                            field.onChange([
                              ...field.value,
                              {
                                woNumber: '',
                                woDescription: '',
                                qty: 1,
                                purpose: '',
                                remarks: '',
                              },
                            ]);
                          }}
                        >
                          <PlusCircleIcon /> Add Work Order
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 w-full items-center flex-wrap">
                <FormField
                  control={form.control}
                  name="returnable"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="returnable"
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(checked)
                            }
                            disabled={form.watch('nonreturnable')}
                          />
                          <label
                            htmlFor="returnable"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Mark as returnable
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nonreturnable"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="nonreturnable"
                            checked={field.value}
                            disabled={form.watch('returnable')}
                            onCheckedChange={(checked) =>
                              field.onChange(checked)
                            }
                          />
                          <label
                            htmlFor="nonreturnable"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Mark as non-returnable
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <Separator className="my-7" />
            <div className="flex items-center justify-end">
              <Button disabled={isPending} type="submit">
                {isEdit ? 'Update Supplier DC' : 'Create Supplier DC'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
