'use client';

import React, { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { createWorkOrderSchema, editWorkOrderSchema } from '../schemas';
import { useCreateWorkOrder, useUpdateWorkOrder, useGetWorkOrderDetails } from '../api/use-work-order-api';
import { useCustomers } from '@/features/customers/api/use-customers';
import { usePurchaseOrders } from '@/features/purchase-orders/api/use-purchase-orders';
import { useItems } from '@/features/items/api/use-items';
import { useGetCompanies } from '@/features/companies/api/use-get-companies';
import { Item } from '@/features/items/schemas';
import { Company } from '@/features/companies/schemas';
import { MinusCircle, PlusCircle } from 'lucide-react';

type CreateWorkOrderFormData = z.infer<typeof createWorkOrderSchema>;
type EditWorkOrderFormData = z.infer<typeof editWorkOrderSchema>;

interface CreateWorkOrderFormProps {
  onSuccess?: () => void;
  workOrderId?: string;
  isEdit?: boolean;
}

export const CreateWorkOrderForm: React.FC<CreateWorkOrderFormProps> = ({
  onSuccess,
  workOrderId,
  isEdit = false,
}) => {
  const { toast } = useToast();
  
  // Track which items are manual entry (to enable/disable part name editing)
  const [manualEntryItems, setManualEntryItems] = React.useState<Set<number>>(new Set());
  
  const { mutate: createWorkOrder, isPending: isCreating } = useCreateWorkOrder();
  const { mutate: updateWorkOrder, isPending: isUpdating } = useUpdateWorkOrder();
  const { data: workOrder, isFetching } = useGetWorkOrderDetails({
    id: workOrderId || '',
  });

  // Fetch customers for dropdown
  const { data: customersData } = useCustomers({
    page: 1,
    limit: 100, // Get enough customers for dropdown
  });
  
  // Fetch purchase orders for dropdown
  const { data: purchaseOrdersData } = usePurchaseOrders({
    page: 1,
    limit: 100, // Get enough POs for dropdown
  });

  // Fetch items for dropdown
  const { data: itemsData } = useItems({
    page: 1,
    limit: 200, // Get enough items for dropdown
    isActiveFilter: true, // Only active items
  });

  // Fetch companies for dropdown
  const { data: companiesData } = useGetCompanies();

  const schema = isEdit ? editWorkOrderSchema : createWorkOrderSchema;
  
  const form = useForm<CreateWorkOrderFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'Open',
      customerId: '',
      customerName: '',
      orderType: 'PRODUCTION',
      POId: '',
      targetDate: '',
      workOrderId: '',
      projectName: '',
      companyId: '',
      items: [
        {
          partNo: '',
          partName: '',
          revisionLevel: 'A',
          qty: 1,
        },
      ],
      progress: 0,
      completedQty: 0,
      totalPlannedQty: 0,
      remarks: '',
      createdBy: 'system',
    },
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    if (isEdit && workOrder && !isFetching) {
      form.reset({
        status: workOrder.status,
        customerId: workOrder.customerId,
        customerName: workOrder.customerName,
        orderType: workOrder.orderType,
        POId: workOrder.POId,
        targetDate: workOrder.targetDate,
        workOrderId: workOrder.workOrderId,
        projectName: workOrder.projectName,
        companyId: workOrder.companyId,
        items: workOrder.items?.length > 0 ? workOrder.items : [{
          partNo: '',
          partName: '',
          revisionLevel: 'A',
          qty: 1,
        }],
        progress: workOrder.progress,
        completedQty: workOrder.completedQty,
        totalPlannedQty: workOrder.totalPlannedQty,
        remarks: workOrder.remarks || '',
        updatedBy: 'system',
      });
    }
  }, [workOrder, isFetching, isEdit, form]);

  const onSubmit = (data: CreateWorkOrderFormData | EditWorkOrderFormData) => {
    if (isEdit && workOrderId) {
      updateWorkOrder(
        { id: workOrderId, data: data as EditWorkOrderFormData },
        {
          onSuccess: () => {
            toast({
              title: 'Success',
              description: 'Work order updated successfully',
            });
            onSuccess?.();
          },
          onError: (error: unknown) => {
            toast({
              title: 'Error',
              description: (error as Error)?.message || 'Failed to update work order',
              variant: 'destructive',
            });
          },
        }
      );
    } else {
      createWorkOrder(data as CreateWorkOrderFormData, {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Work order created successfully',
          });
          form.reset();
          onSuccess?.();
        },
        onError: (error: unknown) => {
          toast({
            title: 'Error',
            description: (error as Error)?.message || 'Failed to create work order',
            variant: 'destructive',
          });
        },
      });
    }
  };

  const addItem = () => {
    const newIndex = itemFields.length;
    appendItem({
      partNo: '',
      partName: '',
      revisionLevel: 'A',
      qty: 1,
    });
    
    // New items start as manual entry
    const newManualEntryItems = new Set(manualEntryItems);
    newManualEntryItems.add(newIndex);
    setManualEntryItems(newManualEntryItems);
  };

  // Handle customer selection - auto-populate customer name when ID is selected
  const handleCustomerSelection = (customerId: string) => {
    const selectedCustomer = customersData?.customers?.find(customer => customer.id === customerId);
    if (selectedCustomer) {
      form.setValue('customerId', customerId);
      form.setValue('customerName', selectedCustomer.name);
    }
  };

  // Handle company selection
  const handleCompanySelection = (companyId: string) => {
    if (companyId === 'none') {
      form.setValue('companyId', '');
      return;
    }
    
    form.setValue('companyId', companyId);
  };

  // Handle PO selection - auto-populate customer info when PO is selected
  const handlePurchaseOrderSelection = (poId: string) => {
    if (poId === 'none') {
      form.setValue('POId', '');
      return;
    }
    
    const selectedPO = purchaseOrdersData?.purchaseOrders?.find(po => po.id === poId);
    if (selectedPO) {
      form.setValue('POId', poId);
      // If PO has customer info, pre-populate it
      if (selectedPO.customerId) {
        form.setValue('customerId', selectedPO.customerId);
        // Find customer name from customers data
        const customer = customersData?.customers?.find(c => c.id === selectedPO.customerId);
        if (customer) {
          form.setValue('customerName', customer.name);
        }
      }
    }
  };

  // Handle item selection - auto-populate item fields
  const handleItemSelection = (itemId: string, index: number) => {
    const newManualEntryItems = new Set(manualEntryItems);
    
    if (itemId === 'none') {
      // Mark as manual entry and clear fields
      newManualEntryItems.add(index);
      setManualEntryItems(newManualEntryItems);
      form.setValue(`items.${index}.partNo`, '');
      form.setValue(`items.${index}.partName`, '');
      form.setValue(`items.${index}.revisionLevel`, 'A');
      return;
    }
    
    // Remove from manual entry set
    newManualEntryItems.delete(index);
    setManualEntryItems(newManualEntryItems);
    
    const selectedItem = itemsData?.data?.find((item: Item) => item.id === itemId);
    if (selectedItem) {
      // Auto-populate from selected item
      form.setValue(`items.${index}.partNo`, selectedItem.partNumber || selectedItem.itemCode);
      form.setValue(`items.${index}.partName`, selectedItem.itemDescription);
      // Reset revision level to default
      form.setValue(`items.${index}.revisionLevel`, 'A');
    }
  };

  const isPending = isCreating || isUpdating || isFetching;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle>{isEdit ? 'Edit Work Order' : 'Create Work Order'}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="workOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Order ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Auto-generated if empty" />
                    </FormControl>
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
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                        <SelectItem value="Short Closed">Short Closed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={handleCustomerSelection} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customersData?.customers?.filter(customer => customer.id).map((customer) => (
                          <SelectItem key={customer.id} value={customer.id!}>
                            {customer.name} ({customer.id})
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
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Auto-filled when customer is selected" readOnly className="bg-gray-50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="orderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select order type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PRODUCTION">Production</SelectItem>
                        <SelectItem value="PROTOTYPE">Prototype</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="REWORK">Rework</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="POId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Order</FormLabel>
                    <Select 
                      onValueChange={handlePurchaseOrderSelection} 
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a purchase order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Purchase Order</SelectItem>
                        {purchaseOrdersData?.purchaseOrders?.filter(po => po.id).map((po) => (
                          <SelectItem key={po.id} value={po.id!}>
                            {po.poNumber} - {po.buyerName || 'No Buyer'}
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
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter project name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <Select 
                      onValueChange={handleCompanySelection} 
                      value={field.value || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Company</SelectItem>
                        {companiesData?.filter((company: Company) => company.id).map((company: Company) => (
                          <SelectItem key={company.id} value={company.id!}>
                            {company.name} - {company.city}, {company.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Items Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="h-8"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {itemFields.map((item, index) => (
                <div key={item.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Item {index + 1}</h4>
                    {itemFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          removeItem(index);
                          // Clean up manual entry state
                          const newManualEntryItems = new Set(manualEntryItems);
                          newManualEntryItems.delete(index);
                          // Adjust indices for remaining items
                          const adjustedSet = new Set<number>();
                          newManualEntryItems.forEach(i => {
                            if (i > index) {
                              adjustedSet.add(i - 1);
                            } else if (i < index) {
                              adjustedSet.add(i);
                            }
                          });
                          setManualEntryItems(adjustedSet);
                        }}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Item Selector */}
                    <FormItem>
                      <FormLabel>Select Item</FormLabel>
                      <Select onValueChange={(value) => handleItemSelection(value, index)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an item" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Manual Entry</SelectItem>
                          {itemsData?.data?.filter((item: Item) => item.id).map((item: Item) => (
                            <SelectItem key={item.id} value={item.id!}>
                              {item.itemCode} - {item.itemDescription}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>

                    <FormField
                      control={form.control}
                      name={`items.${index}.partNo`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Part No</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Auto-filled or manual entry" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.partName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Part Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder={manualEntryItems.has(index) ? "Enter part name" : "Auto-filled when item selected"} 
                              readOnly={!manualEntryItems.has(index)} 
                              className={!manualEntryItems.has(index) ? "bg-gray-50" : ""} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.revisionLevel`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Revision Level</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="A" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.qty`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {index < itemFields.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Progress & Quantities */}
          <Card>
            <CardHeader>
              <CardTitle>Progress & Quantities</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Progress (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completedQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Completed Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalPlannedQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Planned Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Remarks */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter any additional remarks or notes"
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEdit ? 'Update Work Order' : 'Create Work Order'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CreateWorkOrderForm;
