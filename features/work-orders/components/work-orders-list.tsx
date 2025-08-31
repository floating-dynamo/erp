'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import Link from 'next/link';
import Loader from '@/components/loader';

import { useWorkOrders } from '../api/use-work-orders';
import { useDeleteWorkOrder } from '../api/use-delete-work-order';
import { useUpdateWorkOrderStatus } from '../api/use-update-work-order-status';

const WorkOrdersList = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL_STATUS');
  const [priorityFilter, setPriorityFilter] = useState('ALL_PRIORITY');
  const [workOrderTypeFilter, setWorkOrderTypeFilter] = useState('ALL_TYPES');

  const { 
    data: workOrdersData, 
    isLoading, 
    error 
  } = useWorkOrders({
    page,
    limit: 10,
    searchQuery,
    statusFilter: statusFilter === 'ALL_STATUS' ? undefined : statusFilter,
    priorityFilter: priorityFilter === 'ALL_PRIORITY' ? undefined : priorityFilter,
    workOrderTypeFilter: workOrderTypeFilter === 'ALL_TYPES' ? undefined : workOrderTypeFilter,
  });

  const { mutate: deleteWorkOrder, isPending: isDeleting } = useDeleteWorkOrder();
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateWorkOrderStatus();

  const workOrders = workOrdersData?.workOrders || [];
  const totalPages = workOrdersData?.totalPages || 1;

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

  const handleStatusUpdate = (workOrderId: string, newStatus: string) => {
    updateStatus({
      id: workOrderId,
      status: newStatus,
      actualStartDate: newStatus === 'STARTED' ? new Date().toISOString() : undefined,
      actualEndDate: newStatus === 'COMPLETED' ? new Date().toISOString() : undefined,
    });
  };

  const handleDelete = (workOrderId: string) => {
    if (window.confirm('Are you sure you want to delete this work order?')) {
      deleteWorkOrder({ id: workOrderId });
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500">Error loading work orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage and track production work orders
          </p>
        </div>
        <Link href="/work-orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Work Order
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search work orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_STATUS">All Status</SelectItem>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="RELEASED">Released</SelectItem>
                <SelectItem value="STARTED">Started</SelectItem>
                <SelectItem value="PAUSED">Paused</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_PRIORITY">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={workOrderTypeFilter} onValueChange={setWorkOrderTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_TYPES">All Types</SelectItem>
                <SelectItem value="PRODUCTION">Production</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="REWORK">Rework</SelectItem>
                <SelectItem value="PROTOTYPE">Prototype</SelectItem>
                <SelectItem value="REPAIR">Repair</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL_STATUS');
                setPriorityFilter('ALL_PRIORITY');
                setWorkOrderTypeFilter('ALL_TYPES');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8">
              <Loader text="Loading work orders..." />
            </div>
          ) : workOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No work orders found.</p>
              <Link href="/work-orders/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first work order
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Work Order #</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Planned Qty</TableHead>
                  <TableHead>Completed Qty</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workOrders.map((workOrder) => (
                  <TableRow key={workOrder.id}>
                    <TableCell className="font-medium">
                      {workOrder.workOrderNumber}
                    </TableCell>
                    <TableCell>{workOrder.workOrderName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {workOrder.workOrderType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{workOrder.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          {workOrder.productCode}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(workOrder.priority)}>
                        {workOrder.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(workOrder.status)}>
                        {workOrder.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {workOrder.plannedQuantity} {workOrder.uom}
                    </TableCell>
                    <TableCell>
                      {workOrder.completedQuantity} {workOrder.uom}
                    </TableCell>
                    <TableCell>
                      {workOrder.plannedStartDate 
                        ? format(new Date(workOrder.plannedStartDate), 'MMM dd, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {workOrder.dueDate 
                        ? format(new Date(workOrder.dueDate), 'MMM dd, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(workOrder.progressPercentage || 0, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {workOrder.progressPercentage || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/work-orders/${workOrder.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/work-orders/edit/${workOrder.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {workOrder.status === 'PLANNED' && (
                            <DropdownMenuItem 
                              onClick={() => workOrder.id && handleStatusUpdate(workOrder.id, 'STARTED')}
                              disabled={isUpdatingStatus}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Start Work Order
                            </DropdownMenuItem>
                          )}
                          {workOrder.status === 'STARTED' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => workOrder.id && handleStatusUpdate(workOrder.id, 'PAUSED')}
                                disabled={isUpdatingStatus}
                              >
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Work Order
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => workOrder.id && handleStatusUpdate(workOrder.id, 'COMPLETED')}
                                disabled={isUpdatingStatus}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Complete Work Order
                              </DropdownMenuItem>
                            </>
                          )}
                          {workOrder.status === 'PAUSED' && (
                            <DropdownMenuItem 
                              onClick={() => workOrder.id && handleStatusUpdate(workOrder.id, 'STARTED')}
                              disabled={isUpdatingStatus}
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Resume Work Order
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => workOrder.id && handleDelete(workOrder.id)}
                            disabled={isDeleting}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrdersList;
