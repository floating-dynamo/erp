'use client';

import React from 'react';
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
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  CopyIcon,
  EyeIcon,
  EditIcon,
  MoreHorizontal,
  RefreshCwIcon,
  TrashIcon,
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
import { Operation } from '../schemas';
import { useOperations } from '../api/use-operations';
import { useDeleteOperation } from '../api/use-delete-operation';
import Loader from '@/components/loader';
import { redirect } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { OperationRawMaterial } from '../schemas';

const ActionsCell = ({ operation }: { operation: Operation }) => {
  const { toast } = useToast();
  const deleteOperation = useDeleteOperation();

  const handleCopyOperationId = () => {
    navigator.clipboard.writeText(operation.id || '');
    toast({
      title: 'Operation ID copied',
      description: operation.id,
    });
  };

  const handleDelete = () => {
    if (operation.id) {
      deleteOperation.mutate(operation.id);
    }
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
          onClick={() => redirect(`operations/${operation?.id}`)}
        >
          <EyeIcon className="size-3" /> View details
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => redirect(`operations/${operation?.id}/edit`)}
        >
          <EditIcon className="size-3" /> Edit operation
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyOperationId}
        >
          <CopyIcon className="size-3" /> Copy operation ID
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-red-600"
          onClick={handleDelete}
        >
          <TrashIcon className="size-3" /> Delete operation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const columns: ColumnDef<Operation>[] = [
  {
    accessorKey: 'process',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Process
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('process')}</div>
    ),
  },
  {
    accessorKey: 'workCenter',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0"
        >
          Work Center
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>{row.getValue('workCenter')}</div>
    ),
  },
  {
    accessorKey: 'setupMinutes',
    header: 'Setup (min)',
    cell: ({ row }) => (
      <div className="text-right">{row.getValue('setupMinutes')}</div>
    ),
  },
  {
    accessorKey: 'cncMinutesEstimate',
    header: 'CNC (min)',
    cell: ({ row }) => (
      <div className="text-right">{row.getValue('cncMinutesEstimate')}</div>
    ),
  },
  {
    accessorKey: 'totalMinutesEstimate',
    header: 'Total (min)',
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.getValue('totalMinutesEstimate')}</div>
    ),
  },
  {
    accessorKey: 'rawMaterials',
    header: 'Materials',
    cell: ({ row }) => {
      const rawMaterials = row.getValue('rawMaterials') as OperationRawMaterial[];
      return (
        <div className="text-sm">
          {rawMaterials?.length > 0 
            ? `${rawMaterials.length} material${rawMaterials.length > 1 ? 's' : ''}`
            : 'None'
          }
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return (
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {description || '-'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <ActionsCell operation={row.original} />,
  },
];

interface OperationsTableProps {
  searchQuery: string;
  processFilter?: string;
  workCenterFilter?: string;
}

export function OperationsTable({ 
  searchQuery, 
  processFilter, 
  workCenterFilter 
}: OperationsTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(20);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const {
    data: operationsData,
    isLoading,
    refetch,
    error,
  } = useOperations({
    page: currentPage,
    limit: pageSize,
    searchTerm: debouncedSearchQuery,
    processFilter,
    workCenterFilter,
  });

  const table = useReactTable({
    data: operationsData?.operations || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
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

  const totalPages = operationsData?.totalPages || 1;

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-red-500">Error loading operations. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {operationsData ? (
            <>
              Showing {((currentPage - 1) * pageSize) + 1} to{' '}
              {Math.min(currentPage * pageSize, operationsData.totalCount)} of{' '}
              {operationsData.totalCount} operations
            </>
          ) : (
            'Loading...'
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <Loader />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No operations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}