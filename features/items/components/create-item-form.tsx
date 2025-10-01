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
import { createItemSchema } from '../schemas';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useAddItem } from '../api/use-add-item';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useGetItemDetails } from '../api/use-get-item-details';
import { useEditItem } from '../api/use-edit-item';
import { cn } from '@/lib/utils';
import Loader from '@/components/loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface CreateItemFormProps {
  itemId?: string;
  onCancel?: () => void;
  showBackButton?: boolean;
}

type ZodCreateItemSchema = z.infer<typeof createItemSchema>;

export const CreateItemForm = ({
  itemId,
  onCancel,
  showBackButton = false,
}: CreateItemFormProps) => {
  const {
    data: itemData,
    isFetching: isFetchingItem,
    status: fetchItemStatus,
  } = useGetItemDetails({ id: itemId || '' });
  const { mutate: addItem, isPending: isPendingAddItem } = useAddItem();
  const { mutate: editItem, isPending: isPendingEditItem } = useEditItem();
  const [formKey, setFormKey] = useState(0);
  const { toast } = useToast();
  const router = useRouter();
  
  const isEdit = !!itemId;

  const form = useForm<ZodCreateItemSchema>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      itemCode: '',
      itemDescription: '',
      category: '',
      subcategory: '',
      uom: '',
      standardRate: 0,
      currency: 'INR',
      materialConsideration: '',
      specifications: '',
      manufacturer: '',
      partNumber: '',
      hsn: '',
      remarks: '',
      isActive: true,
    },
  });

  // Load item data for editing
  useEffect(() => {
    if (isEdit && itemData) {
      const formData = {
        itemCode: itemData.itemCode || '',
        itemDescription: itemData.itemDescription || '',
        category: itemData.category || '',
        subcategory: itemData.subcategory || '',
        uom: itemData.uom || '',
        standardRate: itemData.standardRate || 0,
        currency: itemData.currency || 'INR',
        materialConsideration: itemData.materialConsideration || '',
        specifications: itemData.specifications || '',
        manufacturer: itemData.manufacturer || '',
        partNumber: itemData.partNumber || '',
        hsn: itemData.hsn || '',
        remarks: itemData.remarks || '',
        isActive: itemData.isActive ?? true,
      };
      
      form.reset(formData);
      setFormKey((prev) => prev + 1);
    }
  }, [isEdit, itemData, form]);

  const onSubmit = (values: ZodCreateItemSchema) => {
    const finalValues = {
      ...values,
    };
    
    if (isEdit) {
      editItem(
        {
          id: itemId!,
          item: finalValues,
        },
        {
          onSuccess: () => {
            toast({
              title: 'Item updated successfully',
              description: 'The item has been updated',
            });
            router.push('/items');
          },
        }
      );
    } else {
      addItem(finalValues, {
        onSuccess: () => {
          toast({
            title: 'Item created successfully',
            description: 'The item has been created',
          });
          router.push('/items');
        },
      });
    }
  };

  if (isFetchingItem && isEdit) {
    return <Loader />;
  }

  if (fetchItemStatus === 'error' && isEdit) {
    return (
      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="text-center">
            <p className="text-muted-foreground">Item not found</p>
          </div>
        </CardContent>
      </Card>
    );
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
          {isEdit ? 'Edit item' : 'Add a new item'}
        </CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        <Form {...form} key={formKey}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="itemCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Item Code <span className="text-orange-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter item code"
                          {...field}
                          disabled={isEdit} // Item code should not be editable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="itemDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Item Description <span className="text-orange-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter item description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Machinery">Machinery</SelectItem>
                          <SelectItem value="Tools">Tools</SelectItem>
                          <SelectItem value="Materials">Materials</SelectItem>
                          <SelectItem value="Components">Components</SelectItem>
                          <SelectItem value="Consumables">Consumables</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter subcategory" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="uom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Unit of Measurement <span className="text-orange-500">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select UOM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Piece">Piece</SelectItem>
                          <SelectItem value="Meter">Meter</SelectItem>
                          <SelectItem value="Kilogram">Kilogram</SelectItem>
                          <SelectItem value="Liter">Liter</SelectItem>
                          <SelectItem value="Box">Box</SelectItem>
                          <SelectItem value="Carton">Carton</SelectItem>
                          <SelectItem value="Square Meter">Square Meter</SelectItem>
                          <SelectItem value="Cubic Meter">Cubic Meter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pricing and Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing & Details</h3>

                <FormField
                  control={form.control}
                  name="standardRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard Rate</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hsn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter HSN code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manufacturer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturer</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter manufacturer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="partNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Part Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter part number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Status
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Whether this item is active and available for use
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Technical Details - Full Width */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold">Technical Details</h3>

                <FormField
                  control={form.control}
                  name="specifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specifications</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter detailed specifications"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="materialConsideration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Consideration</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter material considerations"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional remarks"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                type="submit"
                disabled={isPendingAddItem || isPendingEditItem}
              >
                {isPendingAddItem || isPendingEditItem
                  ? 'Saving...'
                  : isEdit
                  ? 'Update Item'
                  : 'Create Item'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel || (() => router.push('/items'))}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};