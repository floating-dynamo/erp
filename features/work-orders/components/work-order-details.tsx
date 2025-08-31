'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Package,
  Wrench,
  DollarSign,
  Calendar,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Loader from '@/components/loader';

import { useGetWorkOrderDetails } from '../api/use-get-work-order-details';
import { useDeleteWorkOrder } from '../api/use-delete-work-order';
import { useUpdateWorkOrderStatus } from '../api/use-update-work-order-status';

interface WorkOrderDetailsProps {
  workOrderId: string;
}

const WorkOrderDetails = ({ workOrderId }: WorkOrderDetailsProps) => {
  const { data: workOrder, isLoading, error } = useGetWorkOrderDetails({
    id: workOrderId,
  });

  const { mutate: deleteWorkOrder, isPending: isDeleting } = useDeleteWorkOrder();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateWorkOrderStatus();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'secondary';
      case 'RELEASED':
        return 'outline';
      case 'STARTED':
        return 'default';
      case 'PAUSED':
        return 'destructive';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      case 'CLOSED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
        return 'destructive';
      case 'NORMAL':
        return 'default';
      case 'LOW':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    updateStatus({
      id: workOrderId,
      status: newStatus,
      actualStartDate: newStatus === 'STARTED' ? new Date().toISOString() : undefined,
      actualEndDate: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this work order?')) {
      deleteWorkOrder({ id: workOrderId });
    }
  };

  if (isLoading) {
    return <Loader text="Loading work order details..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Error loading work order: {error.message}</p>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Work order not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/work-orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {workOrder.workOrderNumber || 'Work Order'}
            </h1>
            <p className="text-muted-foreground">{workOrder.workOrderName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Status Actions */}
          {workOrder.status === 'PLANNED' && (
            <Button
              onClick={() => handleStatusUpdate('STARTED')}
              disabled={isUpdatingStatus}
            >
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          )}
          {workOrder.status === 'STARTED' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('PAUSED')}
                disabled={isUpdatingStatus}
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button
                onClick={() => handleStatusUpdate('COMPLETED')}
                disabled={isUpdatingStatus}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </>
          )}
          {workOrder.status === 'PAUSED' && (
            <Button
              onClick={() => handleStatusUpdate('STARTED')}
              disabled={isUpdatingStatus}
            >
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          )}
          
          <Link href={`/work-orders/edit/${workOrderId}`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status and Priority */}
      <div className="flex items-center gap-4">
        <Badge variant={getStatusBadgeVariant(workOrder.status)} className="text-sm">
          {workOrder.status}
        </Badge>
        <Badge variant={getPriorityBadgeVariant(workOrder.priority)} className="text-sm">
          {workOrder.priority} Priority
        </Badge>
        <Badge variant="outline" className="text-sm">
          {workOrder.workOrderType}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrder.productName}</div>
            <p className="text-xs text-muted-foreground">{workOrder.productCode}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrder.progressPercentage || 0}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ 
                  width: `${Math.min(workOrder.progressPercentage || 0, 100)}%` 
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Quantity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrder.completedQuantity || 0} / {workOrder.plannedQuantity}
            </div>
            <p className="text-xs text-muted-foreground">{workOrder.uom}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrder.currency} {workOrder.actualCost || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Planned: {workOrder.currency} {workOrder.plannedCost || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Work Order Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Work Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Work Order Number</p>
                <p className="font-medium">{workOrder.workOrderNumber || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Work Order Name</p>
                <p className="font-medium">{workOrder.workOrderName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Department</p>
                <p className="font-medium">{workOrder.department || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Work Center</p>
                <p className="font-medium">{workOrder.workCenter || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drawing Number</p>
                <p className="font-medium">{workOrder.drawingNumber || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revision</p>
                <p className="font-medium">{workOrder.revision || 'Not specified'}</p>
              </div>
            </div>
            
            {workOrder.productDescription && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Product Description</p>
                <p className="font-medium">{workOrder.productDescription}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates and Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planned Start Date</p>
                <p className="font-medium">
                  {workOrder.plannedStartDate 
                    ? format(new Date(workOrder.plannedStartDate), 'PPP')
                    : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planned End Date</p>
                <p className="font-medium">
                  {workOrder.plannedEndDate 
                    ? format(new Date(workOrder.plannedEndDate), 'PPP')
                    : 'Not set'}
                </p>
              </div>
              {workOrder.dueDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {format(new Date(workOrder.dueDate), 'PPP')}
                  </p>
                </div>
              )}
              {workOrder.actualStartDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Actual Start Date</p>
                  <p className="font-medium">
                    {format(new Date(workOrder.actualStartDate), 'PPP')}
                  </p>
                </div>
              )}
              {workOrder.actualEndDate && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Actual End Date</p>
                  <p className="font-medium">
                    {format(new Date(workOrder.actualEndDate), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operations */}
      {workOrder.operations && workOrder.operations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workOrder.operations.map((operation, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {operation.operationSequence}. {operation.operationName}
                    </h4>
                    <Badge variant="outline">
                      {operation.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Work Center</p>
                      <p className="font-medium">{operation.workCenter}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Setup Time</p>
                      <p className="font-medium">{operation.setupTime || 0} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Run Time</p>
                      <p className="font-medium">{operation.runTime} min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Planned Time</p>
                      <p className="font-medium">{operation.totalPlannedTime} min</p>
                    </div>
                  </div>
                  
                  {operation.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="text-sm">{operation.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {workOrder.resources && workOrder.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workOrder.resources.map((resource, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{resource.resourceName}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {resource.resourceType}
                      </Badge>
                      <Badge variant="outline">
                        {resource.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Planned Quantity</p>
                      <p className="font-medium">{resource.plannedQuantity} {resource.uom}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Actual Quantity</p>
                      <p className="font-medium">{resource.actualQuantity || 0} {resource.uom}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Standard Cost</p>
                      <p className="font-medium">{resource.currency} {resource.standardCost}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Actual Cost</p>
                      <p className="font-medium">{resource.currency} {resource.actualCost || 0}</p>
                    </div>
                  </div>
                  
                  {resource.remarks && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">Remarks</p>
                      <p className="text-sm">{resource.remarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {(workOrder.specialInstructions || workOrder.routingInstructions) && (
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workOrder.specialInstructions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Special Instructions</p>
                <p className="mt-1">{workOrder.specialInstructions}</p>
              </div>
            )}
            {workOrder.routingInstructions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Routing Instructions</p>
                <p className="mt-1">{workOrder.routingInstructions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkOrderDetails;
