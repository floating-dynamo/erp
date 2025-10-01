'use client';

import React from 'react';
import { useGetOperationDetails } from '@/features/operations/api/use-get-operation-details';
import { useDeleteOperation } from '@/features/operations/api/use-delete-operation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Trash,
  Clock,
  Settings,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Loader from '@/components/loader';


interface OperationDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

const OperationDetailsPage = ({ params }: OperationDetailsPageProps) => {
  const [operationId, setOperationId] = React.useState<string>('');
  const router = useRouter();
  const { data: operation, isLoading, error } = useGetOperationDetails(operationId);
  const deleteOperation = useDeleteOperation();

  React.useEffect(() => {
    params.then((resolvedParams) => {
      setOperationId(resolvedParams.id);
    });
  }, [params]);

  const handleDelete = () => {
    deleteOperation.mutate(operationId, {
      onSuccess: () => {
        router.push('/operations');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-red-500">Error loading operation details. Please try again.</p>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground">Operation not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" data-testid="operation-details-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {operation.process} - {operation.workCenter}
            </h1>
            <p className="text-muted-foreground">
              Operation ID: {operation.id}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/operations/${operationId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            className="text-red-600 hover:text-red-700"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this operation? This action cannot be undone.')) {
                handleDelete();
              }
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Operation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Process
                  </label>
                  <p className="text-lg font-semibold">{operation.process}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Work Center
                  </label>
                  <p className="text-lg font-semibold">{operation.workCenter}</p>
                </div>
              </div>

              {operation.description && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Description
                    </label>
                    <p className="mt-1 text-gray-900">{operation.description}</p>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="mt-1">
                  <Badge variant={operation.isActive ? 'default' : 'secondary'}>
                    {operation.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Raw Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Raw Materials ({operation.rawMaterials?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {operation.rawMaterials?.length > 0 ? (
                <div className="space-y-4">
                  {operation.rawMaterials.map((material, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{material.itemDescription}</p>
                        <p className="text-sm text-muted-foreground">
                          Code: {material.itemCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {material.quantity} {material.uom}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No raw materials defined for this operation.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Time Estimates */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Time Estimates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Setup Time</span>
                  <span className="font-semibold">
                    {operation.setupMinutes} min
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">CNC Time</span>
                  <span className="font-semibold">
                    {operation.cncMinutesEstimate} min
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Time</span>
                  <span className="text-lg font-bold text-primary">
                    {operation.totalMinutesEstimate} min
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground text-center">
                  ≈ {(operation.totalMinutesEstimate / 60).toFixed(1)} hours
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {operation.createdAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <p className="text-sm">
                    {new Date(operation.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {operation.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="text-sm">
                    {new Date(operation.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OperationDetailsPage;