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
      case 'Open':
        return 'default';
      case 'Closed':
        return 'secondary';
      case 'On Hold':
        return 'destructive';
      case 'Short Closed':
        return 'outline';
      default:
        return 'secondary';
    }
  };



  const handleStatusUpdate = (newStatus: string) => {
    updateStatus({
      id: workOrderId,
      status: newStatus,
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
              {workOrder.workOrderId || 'Work Order'}
            </h1>
            <p className="text-muted-foreground">{workOrder.projectName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Status Actions */}
          {workOrder.status === 'Open' && (
            <>
              <Button
                onClick={() => handleStatusUpdate('Closed')}
                disabled={isUpdatingStatus}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('On Hold')}
                disabled={isUpdatingStatus}
              >
                <Pause className="mr-2 h-4 w-4" />
                Put On Hold
              </Button>
            </>
          )}
          {workOrder.status === 'On Hold' && (
            <Button
              onClick={() => handleStatusUpdate('Open')}
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

      {/* Status and Type */}
      <div className="flex items-center gap-4">
        <Badge variant={getStatusBadgeVariant(workOrder.status)} className="text-sm">
          {workOrder.status}
        </Badge>
        <Badge variant="outline" className="text-sm">
          {workOrder.orderType}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workOrder.customerName}</div>
            <p className="text-xs text-muted-foreground">{workOrder.customerId}</p>
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
            <div className="text-2xl font-bold">{workOrder.progress || 0}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ 
                  width: `${Math.min(workOrder.progress || 0, 100)}%` 
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
              {workOrder.completedQty || 0} / {workOrder.totalPlannedQty || 0}
            </div>
            <p className="text-xs text-muted-foreground">Items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Target Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workOrder.targetDate 
                ? format(new Date(workOrder.targetDate), 'MMM dd, yyyy')
                : 'Not set'}
            </div>
            <p className="text-xs text-muted-foreground">
              {workOrder.POId ? `PO: ${workOrder.POId}` : 'No PO'}
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
                <p className="text-sm font-medium text-muted-foreground">Work Order ID</p>
                <p className="font-medium">{workOrder.workOrderId || 'Not assigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project Name</p>
                <p className="font-medium">{workOrder.projectName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Order Type</p>
                <p className="font-medium">{workOrder.orderType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
                <p className="font-medium">{workOrder.customerId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Purchase Order</p>
                <p className="font-medium">{workOrder.POId || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Target Date</p>
                <p className="font-medium">
                  {workOrder.targetDate 
                    ? format(new Date(workOrder.targetDate), 'MMM dd, yyyy') 
                    : 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workOrder.items && workOrder.items.length > 0 ? (
              <div className="space-y-4">
                {workOrder.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Part Number</p>
                        <p className="font-medium">{item.partNo}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Part Name</p>
                        <p className="font-medium">{item.partName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Revision Level</p>
                        <p className="font-medium">{item.revisionLevel || 'A'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                        <p className="font-medium">{item.qty}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No items defined</p>
            )}
          </CardContent>
        </Card>
      </div>





      {/* Remarks */}
      {workOrder.remarks && (
        <Card>
          <CardHeader>
            <CardTitle>Remarks</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{workOrder.remarks}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkOrderDetails;
