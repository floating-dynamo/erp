'use client';

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, UseFormReturn, Path } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  PlusIcon,
  TrashIcon,
  ChevronRight,
  ChevronDown,
  ArrowLeftIcon,
} from 'lucide-react';
import { createBomSchema, editBomSchema, BomItem } from '../schemas';
import { useAddBom } from '../api/use-add-bom';
import { useEditBom } from '../api/use-edit-bom';
import { useGetBomDetails } from '../api/use-get-bom-details';
import { getMetaData } from '@/lib/utils';
import { MetaDataType } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Loader from '@/components/loader';
import type { 
  HierarchicalItemFormProps,
  BomItemFormData
} from '../types';

type CreateBomFormSchema = z.infer<typeof createBomSchema>;
type EditBomFormSchema = z.infer<typeof editBomSchema>;

interface CreateBomFormComponentProps {
  bomId?: string;
}

// Hierarchical Item Form Component
const HierarchicalItemForm: React.FC<HierarchicalItemFormProps<CreateBomFormSchema>> = ({ 
  itemIndex, 
  parentPath = 'items',
  level = 0,
  form,
  onRemove,
  canRemove = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const uomMetaData = getMetaData(MetaDataType.UOM);
  const currencyMetaData = getMetaData(MetaDataType.CURRENCY);
  
  const currentPath = `${parentPath}.${itemIndex}` as const;
  const childrenPath = `${currentPath}.children` as const;
  
  const {
    fields: childFields,
    append: addChild,
    remove: removeChild,
  } = useFieldArray({
    control: form.control,
    name: childrenPath as "items",
  });

  const addChildItem = (): void => {
    const newChild: BomItem = {
      itemCode: 0,
      itemDescription: '',
      materialConsideration: '',
      quantity: 1,
      uom: '',
      rate: 0,
      currency: '',
      amount: 0,
      remarks: '',
      level: level + 1,
      parentId: '',
      children: [],
    };
    addChild(newChild);
  };

  const calculateAmount = React.useCallback((): void => {
    // Use a simpler approach to get current values
    const formData = form.getValues();
    const pathSegments = currentPath.split('.');
    
    // Navigate to the current item using the path
    let currentItem: unknown = formData;
    for (const segment of pathSegments) {
      if (currentItem && typeof currentItem === 'object') {
        currentItem = (currentItem as Record<string, unknown>)[segment];
      }
    }
    
    if (currentItem && typeof currentItem === 'object') {
      const itemObj = currentItem as Record<string, unknown>;
      const quantity = Number(itemObj.quantity) || 0;
      const rate = Number(itemObj.rate) || 0;
      const amount = quantity * rate;
      
      // Set the calculated amount
      const amountPath = `${currentPath}.amount`;
      form.setValue(amountPath as keyof CreateBomFormSchema, amount as never);
    }
  }, [form, currentPath]);

  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith(currentPath) && (name.includes('quantity') || name.includes('rate'))) {
        calculateAmount();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, currentPath, calculateAmount]);

  const indentStyle: React.CSSProperties = {
    marginLeft: `${level * 20}px`,
  };

  return (
    <div style={indentStyle} className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {childFields.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          <h4 className="font-medium">
            {level === 0 ? 'Root Item' : `Sub-Item (Level ${level})`}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addChildItem}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Sub-Item
          </Button>
          {canRemove && onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <FormField
          control={form.control}
          name={`${currentPath}.itemCode` as Path<CreateBomFormSchema>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Code *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter item code"
                  type="number"
                  value={field.value as number || 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${currentPath}.itemDescription` as Path<CreateBomFormSchema>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Description *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter item description" 
                  value={field.value as string || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${currentPath}.materialConsideration` as Path<CreateBomFormSchema>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material Consideration</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter material details" 
                  value={field.value as string || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${currentPath}.quantity` as Path<CreateBomFormSchema>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter quantity"
                  type="number"
                  value={field.value as number || 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${currentPath}.uom` as Path<CreateBomFormSchema>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Measurement</FormLabel>
              <Select onValueChange={field.onChange} value={field.value as string || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select UOM" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {uomMetaData.map((uom) => (
                    <SelectItem key={uom.value} value={uom.value}>
                      {uom.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${currentPath}.rate` as Path<CreateBomFormSchema>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter rate"
                  type="number"
                  step="0.01"
                  value={field.value as number || 0}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${currentPath}.currency` as Path<CreateBomFormSchema>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value as string || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencyMetaData.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${currentPath}.amount` as Path<CreateBomFormSchema>}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (Auto-calculated)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Auto-calculated"
                  type="number"
                  step="0.01"
                  value={field.value as number || 0}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${currentPath}.remarks` as Path<CreateBomFormSchema>}
          render={({ field }) => (
            <FormItem className="md:col-span-2 lg:col-span-1">
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter remarks" 
                  value={field.value as string || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Child Items */}
      {isExpanded && childFields.length > 0 && (
        <div className="mt-4">
          <h5 className="font-medium mb-2">Sub-Items:</h5>
          {childFields.map((field, index) => (
            <HierarchicalItemForm
              key={field.id}
              itemIndex={index}
              parentPath={childrenPath}
              level={level + 1}
              form={form}
              onRemove={() => removeChild(index)}
              canRemove={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CreateBomForm: React.FC<CreateBomFormComponentProps> = ({ bomId }) => {
  const router = useRouter();
  const isEdit: boolean = !!bomId;

  const { data: bomData, isFetching: isFetchingBom } = useGetBomDetails({
    id: bomId || '',
    enabled: !!bomId,
  });

  const { mutate: addBom, isPending: isAddingBom } = useAddBom({
    onSuccess: () => {
      router.push('/boms');
    },
  });

  const { mutate: editBom, isPending: isEditingBom } = useEditBom({
    onSuccess: () => {
      router.push('/boms');
    },
  });

  const form: UseFormReturn<CreateBomFormSchema> = useForm<CreateBomFormSchema>({
    resolver: zodResolver(isEdit ? editBomSchema : createBomSchema),
    defaultValues: {
      bomName: '',
      productName: '',
      productCode: '',
      version: '1.0',
      bomType: 'MANUFACTURING',
      status: 'DRAFT',
      items: [{
        itemCode: 0,
        itemDescription: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        level: 0,
        children: [],
      }],
      description: '',
      notes: '',
    },
  });

  const {
    fields: itemFields,
    append: addItem,
    remove: removeItem,
  } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  React.useEffect(() => {
    if (isEdit && bomData) {
      form.reset({
        ...bomData,
        id: bomData.id,
      });
    }
  }, [bomData, form, isEdit]);

  if (isEdit && isFetchingBom) {
    return <Loader />;
  }

  const onSubmit = (values: CreateBomFormSchema): void => {
    // Calculate amounts for all items recursively
    const calculateItemAmounts = (items: BomItemFormData[]): BomItemFormData[] => {
      return items.map((item) => ({
        ...item,
        amount: item.rate * item.quantity,
        children: item.children ? calculateItemAmounts(item.children) : [],
      }));
    };

    values.items = calculateItemAmounts(values.items as BomItemFormData[]);

    // Calculate total material cost recursively
    const calculateTotalCost = (items: BomItemFormData[]): number => {
      return items.reduce((total, item) => {
        let itemTotal = item.amount || 0;
        if (item.children && item.children.length > 0) {
          itemTotal += calculateTotalCost(item.children);
        }
        return total + itemTotal;
      }, 0);
    };

    values.totalMaterialCost = calculateTotalCost(values.items as BomItemFormData[]);

    console.log('BOM Data: ', values);

    if (isEdit && bomId) {
      editBom({
        id: bomId,
        bom: {
          id: bomId,
          ...values,
        } as EditBomFormSchema,
      });
    } else {
      addBom(values);
    }
  };

  const addRootItem = (): void => {
    const newItem: BomItem = {
      itemCode: 0,
      itemDescription: '',
      materialConsideration: '',
      quantity: 1,
      uom: '',
      rate: 0,
      currency: '',
      amount: 0,
      remarks: '',
      level: 0,
      parentId: '',
      children: [],
    };
    addItem(newItem);
  };

  const isLoading: boolean = isAddingBom || isEditingBom;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/boms')}
        >
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Edit BOM' : 'Create New BOM'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update BOM details and items' : 'Create a new bill of materials with hierarchical items'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bomName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BOM Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter BOM name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bomType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BOM Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select BOM type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                          <SelectItem value="ENGINEERING">Engineering</SelectItem>
                          <SelectItem value="SALES">Sales</SelectItem>
                          <SelectItem value="SERVICE">Service</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Items</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRootItem}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Root Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {itemFields.map((field, index) => (
                <HierarchicalItemForm
                  key={field.id}
                  itemIndex={index}
                  level={0}
                  form={form}
                  onRemove={itemFields.length > 1 ? () => removeItem(index) : undefined}
                  canRemove={itemFields.length > 1}
                />
              ))}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter BOM description" 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter additional notes" 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/boms')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader /> {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update BOM' : 'Create BOM'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateBomForm;