'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Package,
  Wrench,
  Clock,
  DollarSign,
} from 'lucide-react';
import Loader from '@/components/loader';
import { useRouter } from 'next/navigation';

import { createWorkOrderSchema, WorkOrder } from '../schemas';
import { useAddWorkOrder } from '../api/use-add-work-order';
import { useEditWorkOrder } from '../api/use-edit-work-order';
import { useGetWorkOrderDetails } from '../api/use-get-work-order-details';

const CreateWorkOrderForm = ({
  isEdit = false,
  workOrderId,
}: {
  isEdit?: boolean;
  workOrderId?: string;
}) => {
  const router = useRouter();
  const [formKey] = useState(0);

  const {
    mutate: addWorkOrder,
    isPending: isPendingAddWorkOrder,
  } = useAddWorkOrder();
  const {
    mutate: editWorkOrder,
    isPending: isPendingEditWorkOrder,
  } = useEditWorkOrder();
  const { data: workOrder, isFetching } = useGetWorkOrderDetails({
    id: workOrderId || '',
  });

  const form = useForm<WorkOrder>({
    resolver: zodResolver(createWorkOrderSchema),
    defaultValues: {
      workOrderName: '',
      workOrderType: 'PRODUCTION',
      priority: 'NORMAL',
      status: 'PLANNED',
      productName: '',
      productCode: '',
      plannedQuantity: 1,
      uom: '',
      plannedStartDate: '',
      plannedEndDate: '',
      currency: 'INR',
      operations: [
        {
          operationSequence: 1,
          operationName: '',
          operationCode: '',
          workCenter: '',
          setupTime: 0,
          runTime: 0,
          totalPlannedTime: 0,
          actualTime: 0,
          status: 'PLANNED',
          qualityChecks: [],
        },
      ],
      resources: [],
    },
  });

  const {
    fields: operationFields,
    append: appendOperation,
    remove: removeOperation,
  } = useFieldArray({
    control: form.control,
    name: 'operations',
  });

  const {
    fields: resourceFields,
    append: appendResource,
    remove: removeResource,
  } = useFieldArray({
    control: form.control,
    name: 'resources',
  });

  useEffect(() => {
    if (isEdit && workOrder) {
      form.reset({
        ...workOrder,
        plannedStartDate: workOrder.plannedStartDate
          ? new Date(workOrder.plannedStartDate).toISOString().split('T')[0]
          : '',
        plannedEndDate: workOrder.plannedEndDate
          ? new Date(workOrder.plannedEndDate).toISOString().split('T')[0]
          : '',
        dueDate: workOrder.dueDate
          ? new Date(workOrder.dueDate).toISOString().split('T')[0]
          : undefined,
      });
    }
  }, [isEdit, workOrder, form]);

  const onSubmit = (data: WorkOrder) => {
    if (isEdit && workOrderId) {
      editWorkOrder(
        { id: workOrderId, data },
        {
          onSuccess: () => {
            router.push('/work-orders');
          },
        }
      );
    } else {
      addWorkOrder(data, {
        onSuccess: () => {
          router.push('/work-orders');
        },
      });
    }
  };

  const addDefaultOperation = () => {
    appendOperation({
      operationSequence: operationFields.length + 1,
      operationName: '',
      operationCode: '',
      workCenter: '',
      setupTime: 0,
      runTime: 0,
      totalPlannedTime: 0,
      actualTime: 0,
      status: 'PLANNED',
      qualityChecks: [],
    });
  };

  const addDefaultResource = () => {
    appendResource({
      resourceType: 'MATERIAL',
      resourceName: '',
      resourceCode: '',
      plannedQuantity: 1,
      actualQuantity: 0,
      uom: '',
      standardCost: 0,
      actualCost: 0,
      currency: 'INR',
      status: 'PLANNED',
    });
  };

  if (isFetching) {
    return <Loader text={`Loading ${isEdit ? 'work order details' : 'form'}`} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Work Order' : 'Create Work Order'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? 'Update work order details and manage production'
              : 'Create a new work order for production planning'}
          </p>
        </div>
        <Badge variant={isEdit ? 'secondary' : 'default'}>
          {isEdit ? 'Edit Mode' : 'New Work Order'}
        </Badge>
      </div>

      <Form {...form}>
        <form key={formKey} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="workOrderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Order Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter work order name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workOrderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Order Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work order type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PRODUCTION">Production</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="REWORK">Rework</SelectItem>
                        <SelectItem value="PROTOTYPE">Prototype</SelectItem>
                        <SelectItem value="REPAIR">Repair</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
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
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="RELEASED">Released</SelectItem>
                        <SelectItem value="STARTED">Started</SelectItem>
                        <SelectItem value="PAUSED">Paused</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workCenter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Center</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter work center" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter planned quantity"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
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
                    <FormLabel>Unit of Measurement *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Nos, Kg, Meter" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="drawingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drawing Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter drawing number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Dates and Planning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Dates and Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="plannedStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plannedEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned End Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {operationFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Operation {index + 1}</h4>
                    {operationFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeOperation(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`operations.${index}.operationName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operation Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter operation name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`operations.${index}.workCenter`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Center *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter work center" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`operations.${index}.runTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Run Time (minutes) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter run time"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`operations.${index}.totalPlannedTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Planned Time (minutes) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter total planned time"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`operations.${index}.operationCode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Operation Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter operation code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`operations.${index}.setupTime`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Setup Time (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter setup time"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addDefaultOperation}>
                <Plus className="mr-2 h-4 w-4" />
                Add Operation
              </Button>
            </CardContent>
          </Card>

          {/* Resources (Optional) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resources (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resourceFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Resource {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeResource(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`resources.${index}.resourceType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select resource type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MATERIAL">Material</SelectItem>
                              <SelectItem value="LABOR">Labor</SelectItem>
                              <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                              <SelectItem value="OVERHEAD">Overhead</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resources.${index}.resourceName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter resource name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resources.${index}.plannedQuantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Planned Quantity *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter planned quantity"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resources.${index}.uom`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit of Measurement *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Nos, Kg, Hours" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resources.${index}.standardCost`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Standard Cost *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter standard cost"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`resources.${index}.resourceCode`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter resource code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              
              <Button type="button" variant="outline" onClick={addDefaultResource}>
                <Plus className="mr-2 h-4 w-4" />
                Add Resource
              </Button>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any special instructions for this work order"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="routingInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Routing Instructions</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter routing instructions"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/work-orders')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPendingAddWorkOrder || isPendingEditWorkOrder}
            >
              {isPendingAddWorkOrder || isPendingEditWorkOrder
                ? 'Saving...'
                : isEdit
                ? 'Update Work Order'
                : 'Create Work Order'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateWorkOrderForm;
