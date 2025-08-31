'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wrench, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus 
} from 'lucide-react';
import Link from 'next/link';
import Loader from '@/components/loader';

import { useWorkOrderStats } from '../api/use-work-order-stats';
import { useWorkOrders } from '../api/use-work-orders';

const WorkOrderDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useWorkOrderStats();
  const { data: recentWorkOrders, isLoading: workOrdersLoading } = useWorkOrders({
    page: 1,
    limit: 5,
  });

  const workOrders = recentWorkOrders?.workOrders || [];

  if (statsLoading || workOrdersLoading) {
    return <Loader text="Loading work orders dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Work Orders</h2>
          <p className="text-muted-foreground">
            Monitor and manage your production work orders
          </p>
        </div>
        <Link href="/work-orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Work Order
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalWorkOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active orders in system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inProgressWorkOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedWorkOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              Successfully finished
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats?.overdueWorkOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Past due date
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Work Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Work Orders</CardTitle>
          <Link href="/work-orders">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {workOrders.length === 0 ? (
            <div className="text-center py-6">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No work orders</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by creating a new work order.
              </p>
              <div className="mt-6">
                <Link href="/work-orders/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Work Order
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {workOrders.map((workOrder) => (
                <div key={workOrder.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{workOrder.workOrderName}</p>
                      <p className="text-sm text-muted-foreground">
                        {workOrder.workOrderNumber} • {workOrder.productName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        workOrder.priority === 'URGENT' ? 'destructive' :
                        workOrder.priority === 'HIGH' ? 'destructive' :
                        workOrder.priority === 'NORMAL' ? 'default' : 'secondary'
                      }
                    >
                      {workOrder.priority}
                    </Badge>
                    <Badge 
                      variant={
                        workOrder.status === 'COMPLETED' ? 'default' :
                        workOrder.status === 'STARTED' ? 'default' :
                        workOrder.status === 'PAUSED' ? 'destructive' : 'secondary'
                      }
                    >
                      {workOrder.status}
                    </Badge>
                    <Link href={`/work-orders/${workOrder.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Overview */}
      {stats && (stats.totalPlannedCost > 0 || stats.totalActualCost > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Planned Cost</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹ {stats.totalPlannedCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Estimated project costs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Actual Cost</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹ {stats.totalActualCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Actual incurred costs
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkOrderDashboard;
