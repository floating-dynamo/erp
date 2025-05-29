'use client';
import React, { useState } from 'react';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowLeft,
  ArrowRight,
  CopyIcon,
  EyeIcon,
  RefreshCwIcon,
  MoreHorizontal,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PurchaseOrder } from '../schemas';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/loader';
import { formatDate } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Fuse from 'fuse.js';
import { usePurchaseOrders } from '../api/use-purchase-orders';
import { CurrencySymbol } from '@/lib/types';
import { PurchaseOrderFilters } from './purchase-order-filters';
import { useDebounce } from '@/hooks/use-debounce';

const ActionsCell = ({ purchaseOrder }: { purchaseOrder: PurchaseOrder }) => {
  const { toast } = useToast();

  const handleCopyEnquiryId = () => {
    navigator.clipboard.writeText(purchaseOrder.id!);
    toast({
      title: 'PO ID copied',
      description: purchaseOrder.id,
    });
  };

  const handleCopyCustomerId = () => {
    navigator.clipboard.writeText(purchaseOrder.customerId!);
    toast({
      title: 'Customer ID copied',
      description: purchaseOrder.customerId,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => redirect(`purchase-orders/${purchaseOrder?.id}`)}
        >
          <EyeIcon className="size-3" /> View Purchase Order
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyEnquiryId}
        >
          <CopyIcon className="size-3" /> Copy purchaseOrder ID
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyCustomerId}
        >
          <CopyIcon className="size-3" /> Copy customer ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: 'customerId',
  },
  {
    accessorKey: 'poNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          PO Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="ml-4">{row.getValue('poNumber')}</div>,
  },
  {
    accessorKey: 'poDate',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          PO Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4">{formatDate(row.getValue('poDate'))}</div>
    ),
  },
  {
    accessorKey: 'deliveryDate',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Delivery Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4">{formatDate(row.getValue('deliveryDate'))}</div>
    ),
  },
  {
    accessorKey: 'buyerName',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Buyer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="ml-4">{row.getValue('buyerName')}</div>,
  },
  {
    accessorKey: 'items',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Number of Items
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const items = row.getValue('items') as { itemCode: number }[];
      return (
        <div className="ml-4">{items.length > 0 ? items.length : 'NA'}</div>
      );
    },
  },
  {
    accessorKey: 'totalBasicValue',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Basic Value ({CurrencySymbol.INR})
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4">{row.getValue('totalBasicValue')}</div>
    ),
  },
  {
    accessorKey: 'totalValue',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Value ({CurrencySymbol.INR})
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="ml-4">{row.getValue('totalValue')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <ActionsCell purchaseOrder={row.original} />,
  },
];

const PurchaseOrdersTable: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    customerId: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [searchInputValue, setSearchInputValue] = useState('');
  const searchQuery = useDebounce(searchInputValue, 300);
  
  const [page, setPage] = useState(0);
  const [limit] = useState(100);
  
  const [filters, setFilters] = useState({
    buyerNameFilter: '',
    enquiryId: '',
    deliveryDateFrom: '',
    deliveryDateTo: '',
    totalValueFrom: '',
    totalValueTo: '',
  });

  const {
    data = { purchaseOrders: [], total: 0, totalPages: 0 },
    isLoading,
    refetch: refetchPurchaseOrdersData,
  } = usePurchaseOrders({
    ...filters,
    page: page + 1,
    limit,
    searchQuery,
  });
  
  const { purchaseOrders, total, totalPages } = data || {};
  
  const fuseSearchKeys: (keyof PurchaseOrder | string)[] = [
    'customerName',
    'poNumber',
    'formattedPoDate',
    'buyerName',
    'totalBasicValue',
    'totalValue',
  ];

  const processedPurchaseOrders = React.useMemo(() => {
    return purchaseOrders?.map((purchaseOrder) => ({
      ...purchaseOrder,
      formattedPoDate: formatDate(new Date(purchaseOrder.poDate || '')),
    }));
  }, [purchaseOrders]);

  const fuse = React.useMemo(() => {
    return new Fuse(processedPurchaseOrders || [], {
      keys: fuseSearchKeys,
      threshold: 0.1, // Adjust threshold for fuzzy matching
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedPurchaseOrders]);

  const filteredPurchaseOrders = React.useMemo(() => {
    if (!searchQuery) return purchaseOrders;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, purchaseOrders]);

  // Calculate total pages based on filtered results
  const totalFilteredPurchaseOrders = filteredPurchaseOrders?.length || 0;
  const totalFilteredPages = Math.ceil(totalFilteredPurchaseOrders / limit);
  
  // Client-side pagination for search results
  const paginatedPurchaseOrders = React.useMemo(() => {
    if (!filteredPurchaseOrders) return [];
    
    if (searchQuery) {
      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      return filteredPurchaseOrders.slice(startIndex, endIndex);
    }
    
    return filteredPurchaseOrders;
  }, [filteredPurchaseOrders, page, limit, searchQuery]);
  
  // Use appropriate pagination values based on whether we're searching or not
  const displayedTotal = searchQuery ? totalFilteredPurchaseOrders : total;
  const displayedTotalPages = searchQuery ? totalFilteredPages : totalPages;

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };
  
  // Reset page when search query changes
  React.useEffect(() => {
    setPage(0);
  }, [searchQuery, filters]);

  const table = useReactTable({
    data: searchQuery ? paginatedPurchaseOrders : processedPurchaseOrders ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: !searchQuery, // Only use manual pagination when not searching
    pageCount: displayedTotalPages,
    rowCount: displayedTotal,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search Purchase Order..."
            value={searchInputValue}
            onChange={(event) => setSearchInputValue(event.target.value)}
            className="max-w-sm"
          />
          <PurchaseOrderFilters
            onApplyFilters={handleApplyFilters}
            currentFilters={filters}
          />
        </div>
        <Button variant="secondary" onClick={() => refetchPurchaseOrdersData()}>
          <RefreshCwIcon className="size-4" /> Refresh Data
        </Button>
      </div>
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <Loader text="Fetching purchase orders data" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <p>No Purchase Orders to show</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
      
      <div className="flex items-center justify-between py-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {displayedTotalPages || 1} (Total Purchase Orders: {displayedTotal})
          </p>
        </div>
        <div className="space-x-2 flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={page === 0}
          >
            <ArrowLeft className="size-4" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((prev) =>
                displayedTotalPages ? Math.min(prev + 1, displayedTotalPages - 1) : prev + 1
              )
            }
            disabled={page + 1 >= displayedTotalPages}
          >
            Next
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrdersTable;
