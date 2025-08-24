'use client';

import React from 'react';
import {
  Building2,
  Package,
  ScrollText,
  ArrowLeftIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PenIcon,
  DownloadIcon,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { use, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGetBomDetails } from '@/features/bom/api/use-get-bom-details';
import Loader from '@/components/loader';
import { formatDate } from '@/lib/utils';
import { redirect } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { BomItem } from '@/features/bom/schemas';

interface BomDetailsPageProps {
  params: Promise<{ bomId: string }>;
}

// Hierarchical item display component
const HierarchicalItemDisplay: React.FC<{
  item: BomItem;
  level?: number;
  onItemClick?: (item: BomItem) => void;
  onToggleExpand?: (item: BomItem) => void;
}> = ({
  item,
  level = 0,
  onItemClick,
  onToggleExpand,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const hasChildren: boolean = Boolean(item.children && item.children.length > 0);

  const indentStyle: React.CSSProperties = {
    marginLeft: `${level * 24}px`,
  };

  const handleToggleExpand = (): void => {
    setIsExpanded(!isExpanded);
    onToggleExpand?.(item);
  };

  const handleItemClick = (): void => {
    onItemClick?.(item);
  };

  return (
    <div>
      <div
        className='flex items-center py-2 border-b cursor-pointer hover:bg-muted/50'
        style={indentStyle}
        onClick={handleItemClick}
      >
        {hasChildren ? (
          <Button
            variant='ghost'
            size='sm'
            className='h-6 w-6 p-0 mr-2'
            onClick={(e) => {
              e.stopPropagation();
              handleToggleExpand();
            }}
          >
            {isExpanded ? (
              <ChevronDown className='h-4 w-4' />
            ) : (
              <ChevronRight className='h-4 w-4' />
            )}
          </Button>
        ) : (
          <div className='w-8' />
        )}

        <div className='flex-1 grid grid-cols-8 gap-4 items-center'>
          <div className='font-medium'>{item.itemCode}</div>
          <div className='col-span-2'>
            <div className='font-medium'>{item.itemDescription}</div>
            {item.materialConsideration && (
              <div className='text-sm text-muted-foreground'>
                {item.materialConsideration}
              </div>
            )}
          </div>
          <div className='text-right'>{item.quantity}</div>
          <div>{item.uom || 'N/A'}</div>
          <div className='text-right'>{item.rate}</div>
          <div>{item.currency || 'INR'}</div>
          <div className='text-right font-medium'>{item.amount}</div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child, index) => (
            <HierarchicalItemDisplay
              key={`${child.itemCode}-${index}`}
              item={child}
              level={level + 1}
              onItemClick={onItemClick}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function BomDetails({ params }: BomDetailsPageProps): React.JSX.Element {
  const { bomId }: { bomId: string } = use(params);
  const { toast } = useToast();

  const {
    data: bom,
    isLoading,
    error,
  } = useGetBomDetails({
    id: bomId,
  });

  const backToBomsPage = (): void => {
    redirect('/boms');
  };

  const copyBomId = (): void => {
    navigator.clipboard.writeText(bomId);
    toast({
      title: 'BOM ID copied',
      description: bomId,
    });
  };

  const handleItemClick = (item: BomItem): void => {
    console.log('Item clicked:', item);
    // Handle item click logic here
  };

  const handleToggleExpand = (item: BomItem): void => {
    console.log('Item expand toggled:', item);
    // Handle expand/collapse logic here
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !bom) {
    redirect('/boms');
    return <></>;
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    ACTIVE: 'bg-green-100 text-green-800 hover:bg-green-200',
    INACTIVE: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    ARCHIVED: 'bg-red-100 text-red-800 hover:bg-red-200',
  };

  const typeColors: Record<string, string> = {
    MANUFACTURING: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    ENGINEERING: 'bg-green-100 text-green-800 hover:bg-green-200',
    SALES: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    SERVICE: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  };

  return (
    <div className='container mx-auto py-6 space-y-6' id='bom-details'>
      <div className='flex items-start gap-4'>
        <Button
          variant='outline'
          size='icon'
          onClick={backToBomsPage}
          disabled={false}
          data-html2canvas-ignore
        >
          <ArrowLeftIcon className='size-4' />
        </Button>
        <div className='flex flex-col'>
          <div className='flex gap-4 items-center flex-wrap'>
            <h1 className='text-xl sm:text-3xl font-bold'>{bom.bomNumber}</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild data-html2canvas-ignore>
                  <CopyIcon
                    onClick={copyBomId}
                    className='size-4 text-muted-foreground cursor-pointer'
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy BOM ID</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className='text-muted-foreground text-xs sm:text-sm'>
            {bom.bomName}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild data-html2canvas-ignore>
            <Button variant='ghost' size='icon'>
              <MoreHorizontalIcon className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className='cursor-pointer text-xs sm:text-sm'
              onClick={() => redirect(`/boms/${bomId}/edit`)}
            >
              <PenIcon className='size-3' /> Edit BOM
            </DropdownMenuItem>
            <DropdownMenuItem
              className='cursor-pointer text-xs sm:text-sm'
              onClick={() => {
                toast({
                  title: 'Export feature coming soon',
                  description: 'BOM export functionality will be available soon.',
                });
              }}
            >
              <DownloadIcon className='size-3' /> Save (.csv)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Package className='h-5 w-5' />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex flex-col'>
              <p className='text-sm text-muted-foreground'>Product Name</p>
              <div className='flex items-center gap-3'>
                <p className='font-medium'>{bom.productName}</p>
              </div>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Product Code</p>
              <p className='font-semibold font-mono'>{bom.productCode}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>BOM Type</p>
              <Badge
                className={
                  typeColors[bom.bomType as keyof typeof typeColors] ||
                  'bg-gray-100 text-gray-800'
                }
              >
                {bom.bomType}
              </Badge>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Status</p>
              <Badge
                className={
                  statusColors[bom.status as keyof typeof statusColors] ||
                  'bg-gray-100 text-gray-800'
                }
              >
                {bom.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Building2 className='h-5 w-5' />
              BOM Information
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-sm text-muted-foreground'>Version</p>
              <p className='font-medium'>{bom.version}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>BOM Date</p>
              <p className='font-medium'>
                {bom.bomDate ? formatDate(new Date(bom.bomDate)) : 'NA'}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>
                Total Material Cost
              </p>
              <p className='font-semibold text-lg'>
                {bom.items[0]?.currency || 'INR'} {bom.totalMaterialCost}
              </p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Created By</p>
              <p className='font-medium'>{bom.createdBy || 'NA'}</p>
            </div>
            {bom.customerName && (
              <div>
                <p className='text-sm text-muted-foreground'>Customer</p>
                <p className='font-medium'>{bom.customerName}</p>
              </div>
            )}
            {bom.enquiryNumber && (
              <div>
                <p className='text-sm text-muted-foreground'>Enquiry Number</p>
                <p className='font-medium'>{bom.enquiryNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className='md:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Package className='h-5 w-5' />
              Hierarchical Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {/* Header */}
              <div className='grid grid-cols-8 gap-4 py-3 px-4 bg-muted rounded font-semibold text-sm'>
                <div>Item Code</div>
                <div className='col-span-2'>Description</div>
                <div className='text-right'>Qty</div>
                <div>UOM</div>
                <div className='text-right'>Rate</div>
                <div>Currency</div>
                <div className='text-right'>Amount</div>
              </div>

              {/* Hierarchical Items */}
              <div className='space-y-1'>
                {bom.items.map((item, index) => (
                  <HierarchicalItemDisplay
                    key={`${item.itemCode}-${index}`}
                    item={item}
                    level={0}
                    onItemClick={handleItemClick}
                    onToggleExpand={handleToggleExpand}
                  />
                ))}
              </div>

              {/* Total */}
              <div className='grid grid-cols-8 gap-4 py-3 px-4 border-t-2 font-semibold'>
                <div className='col-span-7 text-right'>
                  Total Material Cost:
                </div>
                <div className='text-right'>
                  {bom.items[0]?.currency || 'INR'} {bom.totalMaterialCost}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {bom.description && (
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ScrollText className='h-5 w-5' />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='whitespace-pre-line'>{bom.description}</div>
            </CardContent>
          </Card>
        )}

        {bom.notes && (
          <Card className='md:col-span-2'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ScrollText className='h-5 w-5' />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='whitespace-pre-line'>{bom.notes}</div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default BomDetails;
