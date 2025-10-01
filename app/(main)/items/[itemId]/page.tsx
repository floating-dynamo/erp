'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  FileText,
  Hash,
  Info,
  MoreHorizontal,
  Package,
  Ruler,
  Settings,
  Tag,
  User,
} from 'lucide-react';
import { useGetItemDetails } from '@/features/items/api/use-get-item-details';
import { formatCurrency, formatDate } from '@/lib/utils';
import Loader from '@/components/loader';

interface ItemDetailsPageProps {
  params: Promise<{
    itemId: string;
  }>;
}

const ItemDetailsPage = ({ params }: ItemDetailsPageProps) => {
  const router = useRouter();
  const { itemId } = use(params);

  const {
    data: item,
    isLoading: isFetchingItem,
    error,
  } = useGetItemDetails({
    id: itemId,
  });

  if (isFetchingItem) {
    return <Loader />;
  }

  if (error || !item) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card>
          <CardContent className="p-6">
            <p>Item not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEdit = () => {
    router.push(`/items/${itemId}/edit`);
  };

  const handleBack = () => {
    router.push('/items');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Item Details</h1>
            <p className="text-muted-foreground">
              {item.itemCode} - {item.itemDescription}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={item.isActive ? 'default' : 'secondary'}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Item
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(item.id!)}
              >
                Copy Item ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Item Code</p>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  <p className="font-medium">{item.itemCode}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">UOM</p>
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  <p className="font-medium">{item.uom}</p>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <p className="font-medium">{item.itemDescription}</p>
              </div>
            </div>

            {item.category && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <p className="font-medium">{item.category}</p>
                  </div>
                </div>
                {item.subcategory && (
                  <div>
                    <p className="text-sm text-muted-foreground">Subcategory</p>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <p className="font-medium">{item.subcategory}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Financial */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {item.standardRate && (
              <div>
                <p className="text-sm text-muted-foreground">Standard Rate</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <p className="font-medium text-lg">
                    {formatCurrency(item.standardRate, item.currency || 'INR')}
                  </p>
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="font-medium">{item.currency || 'INR'}</p>
            </div>

            {item.hsn && (
              <div>
                <p className="text-sm text-muted-foreground">HSN Code</p>
                <p className="font-medium">{item.hsn}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technical Details */}
        {(item.specifications || item.manufacturer || item.partNumber || item.materialConsideration) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.specifications && (
                <div>
                  <p className="text-sm text-muted-foreground">Specifications</p>
                  <p className="font-medium whitespace-pre-wrap">{item.specifications}</p>
                </div>
              )}

              {item.manufacturer && (
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <p className="font-medium">{item.manufacturer}</p>
                  </div>
                </div>
              )}

              {item.partNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Part Number</p>
                  <p className="font-medium">{item.partNumber}</p>
                </div>
              )}

              {item.materialConsideration && (
                <div>
                  <p className="text-sm text-muted-foreground">Material Consideration</p>
                  <p className="font-medium whitespace-pre-wrap">{item.materialConsideration}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {item.remarks && (
              <div>
                <p className="text-sm text-muted-foreground">Remarks</p>
                <p className="font-medium whitespace-pre-wrap">{item.remarks}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {item.createdAt && (
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p>{formatDate(new Date(item.createdAt))}</p>
                  </div>
                </div>
              )}

              {item.updatedAt && (
                <div>
                  <p className="text-muted-foreground">Updated</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p>{formatDate(new Date(item.updatedAt))}</p>
                  </div>
                </div>
              )}

              {item.createdBy && (
                <div>
                  <p className="text-muted-foreground">Created By</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <p>{item.createdBy}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItemDetailsPage;