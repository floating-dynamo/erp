'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOperationSchema, PROCESS_TYPES, WORK_CENTER_TYPES } from '../schemas';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  PlusCircle,
  TrashIcon,
} from 'lucide-react';
import { useAddOperation } from '../api/use-add-operation';
import { useEditOperation } from '../api/use-edit-operation';
import { useGetOperationDetails } from '../api/use-get-operation-details';
import { useItems } from '@/features/items/api/use-items';
import type { Item } from '@/features/items/schemas';
import { useRouter } from 'next/navigation';
import Loader from '@/components/loader';

// Infer the form schema type
type CreateOperationFormSchema = z.infer<typeof createOperationSchema>;

interface CreateOperationFormProps {
  onCancel?: () => void;
  showBackButton?: boolean;
  operationId?: string;
}

export const CreateOperationForm = ({
  onCancel,
  operationId,
  showBackButton = false,
}: CreateOperationFormProps) => {
  const {
    data: operationData,
    isFetching: isFetchingOperation,
    status: fetchOperationStatus,
  } = useGetOperationDetails(operationId || '');
  
  const { mutate: addOperation, isPending: isPendingAddOperation } = useAddOperation();
  const { mutate: editOperation, isPending: isPendingEditOperation } = useEditOperation();
  const router = useRouter();
  const isEdit = !!operationId;
  const isPending = isPendingAddOperation || isPendingEditOperation;

  // Fetch items for raw materials dropdown
  const { data: itemsData } = useItems({
    page: 1,
    limit: 200, // Get enough items for dropdown
    isActiveFilter: true, // Only active items
  });

  const form = useForm<CreateOperationFormSchema>({
    resolver: zodResolver(createOperationSchema),
    defaultValues: {
      process: '',
      workCenter: '',
      setupMinutes: 0,
      cncMinutesEstimate: 0,
      totalMinutesEstimate: 0,
      description: '',
      rawMaterials: [],
      isActive: true,
    },
  });

  const { fields: rawMaterialFields, append: appendRawMaterial, remove: removeRawMaterial } = useFieldArray({
    control: form.control,
    name: 'rawMaterials',
  });

  // Populate form with existing data when editing
  React.useEffect(() => {
    if (isEdit && operationData && fetchOperationStatus === 'success') {
      form.reset({
        process: operationData.process || '',
        workCenter: operationData.workCenter || '',
        setupMinutes: operationData.setupMinutes || 0,
        cncMinutesEstimate: operationData.cncMinutesEstimate || 0,
        totalMinutesEstimate: operationData.totalMinutesEstimate || 0,
        description: operationData.description || '',
        rawMaterials: operationData.rawMaterials || [],
        isActive: operationData.isActive ?? true,
      });
    }
  }, [operationData, isEdit, fetchOperationStatus, form]);

  // Auto-calculate total minutes when setup or cnc minutes change
  const setupMinutes = form.watch('setupMinutes');
  const cncMinutesEstimate = form.watch('cncMinutesEstimate');
  React.useEffect(() => {
    const total = Number(setupMinutes) + Number(cncMinutesEstimate);
    form.setValue('totalMinutesEstimate', total);
  }, [setupMinutes, cncMinutesEstimate, form]);

  const onSubmit = (data: CreateOperationFormSchema) => {
    if (isEdit && operationId) {
      editOperation({
        id: operationId,
        data,
      });
    } else {
      addOperation(data);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  if (isEdit && isFetchingOperation) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader />
      </div>
    );
  }

  if (isEdit && fetchOperationStatus === 'error') {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-red-500">Error loading operation details. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showBackButton && (
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isEdit ? 'Edit Operation' : 'Create Operation'}
        </h1>
        <p className="text-muted-foreground">
          {isEdit ? 'Update the operation details below.' : 'Fill out the form below to create a new operation.'}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Process */}
              <FormField
                control={form.control}
                name="process"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a process" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROCESS_TYPES.map((process) => (
                          <SelectItem key={process} value={process}>
                            {process}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Work Center */}
              <FormField
                control={form.control}
                name="workCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Center *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a work center" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WORK_CENTER_TYPES.map((workCenter) => (
                          <SelectItem key={workCenter} value={workCenter}>
                            {workCenter}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Estimates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="setupMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setup Minutes *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.1"
                          placeholder="0"
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
                  name="cncMinutesEstimate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNC Minutes Estimate *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.1"
                          placeholder="0"
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
                  name="totalMinutesEstimate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Minutes Estimate</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          readOnly 
                          className="bg-gray-50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter operation description..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Raw Materials Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Raw Materials (Optional)</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendRawMaterial({
                    itemId: '',
                    itemCode: '',
                    itemDescription: '',
                    quantity: 0,
                    uom: '',
                  })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Material
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {rawMaterialFields.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No raw materials added. Click &ldquo;Add Material&rdquo; to get started.
                </p>
              ) : (
                rawMaterialFields.map((field, index) => (
                  <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                      {/* Item Selection Dropdown */}
                      <FormField
                        control={form.control}
                        name={`rawMaterials.${index}.itemId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Item *</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                const selectedItem = itemsData?.data?.find((item: Item) => item.id === value);
                                if (selectedItem) {
                                  // Auto-fill item details
                                  form.setValue(`rawMaterials.${index}.itemId`, selectedItem.id || '');
                                  form.setValue(`rawMaterials.${index}.itemCode`, selectedItem.itemCode || '');
                                  form.setValue(`rawMaterials.${index}.itemDescription`, selectedItem.itemDescription || '');
                                  form.setValue(`rawMaterials.${index}.uom`, selectedItem.uom || '');
                                }
                                field.onChange(value);
                              }} 
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an item" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {itemsData?.data?.map((item: Item) => (
                                  item.id && (
                                    <SelectItem key={item.id} value={item.id}>
                                      {item.itemCode} - {item.itemDescription}
                                    </SelectItem>
                                  )
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Auto-filled Item Details */}
                      <FormField
                        control={form.control}
                        name={`rawMaterials.${index}.itemCode`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Code</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Auto-filled" 
                                readOnly 
                                className="bg-gray-50"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`rawMaterials.${index}.itemDescription`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Auto-filled" 
                                readOnly 
                                className="bg-gray-50"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`rawMaterials.${index}.uom`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UOM</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Auto-filled" 
                                readOnly 
                                className="bg-gray-50"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Quantity Field */}
                    <div className="w-32">
                      <FormField
                        control={form.control}
                        name={`rawMaterials.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.1"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRawMaterial(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader /> : isEdit ? 'Update Operation' : 'Create Operation'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};