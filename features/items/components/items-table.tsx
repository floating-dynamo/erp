'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Copy, Eye, MoreHorizontal, Edit, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useItems } from '../api/use-items';
import Loader from '@/components/loader';
import { formatCurrency } from '@/lib/utils';
import { redirect } from 'next/navigation';
import Fuse from 'fuse.js';
import { useDebounce } from '@/hooks/use-debounce';
import { ItemFilters } from './item-filters';
import { Item } from '../schemas';

const ActionsCell = ({ item }: { item: Item }) => {
  const { toast } = useToast();

  const handleCopyItemId = () => {
    navigator.clipboard.writeText(item.id!);
    toast({
      title: 'Item ID copied',
      description: item.id,
    });
  };

  const handleCopyItemCode = () => {
    navigator.clipboard.writeText(item.itemCode);
    toast({
      title: 'Item Code copied',
      description: item.itemCode,
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
          onClick={() => redirect(`items/${item?.id}`)}
        >
          <Eye className="size-3" /> View item
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => redirect(`items/${item?.id}/edit`)}
        >
          <Edit className="size-3" /> Edit item
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyItemId}
        >
          <Copy className="size-3" /> Copy item ID
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyItemCode}
        >
          <Copy className="size-3" /> Copy item code
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const columns: ColumnDef<Item>[] = [
  {
    accessorKey: 'id',
  },
  {
    accessorKey: 'itemCode',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Item Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4 font-medium">{row.getValue('itemCode')}</div>
    ),
  },
  {
    accessorKey: 'itemDescription',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4 max-w-[300px] truncate">{row.getValue('itemDescription')}</div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <div className="ml-4">{row.getValue('category') || '-'}</div>
    ),
  },
  {
    accessorKey: 'subcategory',
    header: 'Subcategory',
    cell: ({ row }) => (
      <div className="ml-4">{row.getValue('subcategory') || '-'}</div>
    ),
  },
  {
    accessorKey: 'uom',
    header: 'UOM',
    cell: ({ row }) => (
      <div className="ml-4 font-medium">{row.getValue('uom')}</div>
    ),
  },
  {
    accessorKey: 'standardRate',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Standard Rate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rate = row.getValue('standardRate') as number;
      const currency = row.original.currency || 'INR';
      return (
        <div className="ml-4 font-medium">
          {rate ? formatCurrency(rate, currency) : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <div className="ml-4">
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;
      return <ActionsCell item={item} />;
    },
  },
];

const ItemsTable: React.FC = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    id: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchInputValue, setSearchInputValue] = React.useState('');
  const searchQuery = useDebounce(searchInputValue, 300);
  
  // Filter states
  const [filters, setFilters] = React.useState({
    categoryFilter: '',
    isActiveFilter: true,
  });
  
  const [page, setPage] = React.useState(0);
  const [limit] = React.useState(100);

  const {
    data = { data: [], total: 0, totalPages: 0 },
    isLoading,
  } = useItems({
    page: page + 1, 
    limit,
    searchQuery,
    categoryFilter: filters.categoryFilter,
    isActiveFilter: filters.isActiveFilter,
  });
  
  const { data: items, total, totalPages } = data || {};

  const processedItems = React.useMemo(() => {
    return items || [];
  }, [items]);

  const fuse = React.useMemo(() => {
    const fuseItemSearchKeys = [
      'itemCode',
      'itemDescription',
      'category',
      'subcategory',
      'manufacturer',
      'partNumber',
    ];
    
    return new Fuse(processedItems || [], {
      keys: fuseItemSearchKeys,
      threshold: 0.3,
      includeScore: true,
    });
  }, [processedItems]);

  const searchedItems = React.useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return processedItems;
    }
    
    const fuseResults = fuse.search(searchQuery);
    return fuseResults.map((result) => result.item);
  }, [searchQuery, processedItems, fuse]);

  const table = useReactTable({
    data: searchedItems || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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

  const handleApplyFilters = (newFilters: {
    categoryFilter: string;
    isActiveFilter: boolean;
  }) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Search items..."
          value={searchInputValue}
          onChange={(event) => setSearchInputValue(event.target.value)}
          className="max-w-sm"
        />
        <ItemFilters
          onApplyFilters={handleApplyFilters}
          currentFilters={filters}
        />
      </div>
      <div className="rounded-md border">
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
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No items found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {searchQuery ? (
            `${table.getRowModel().rows.length} item(s) found`
          ) : (
            `${(page * limit) + 1}-${Math.min((page + 1) * limit, total || 0)} of ${total || 0} item(s)`
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= (totalPages || 1) - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemsTable;