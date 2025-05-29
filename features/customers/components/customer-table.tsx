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
  MoreHorizontal,
  PlusCircleIcon,
  RefreshCwIcon,
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
import { Customer } from '../schemas';
import { Input } from '@/components/ui/input';
import { useCustomers } from '../api/use-customers';
import Loader from '@/components/loader';
import { redirect } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import { CustomerFilters } from './customer-filters';

const ActionsCell = ({ customer }: { customer: Customer }) => {
  const { toast } = useToast();

  const handleCopyCustomerId = () => {
    navigator.clipboard.writeText(customer.id!);
    toast({
      title: 'Customer ID copied',
      description: customer.id,
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
          onClick={() => redirect(`enquiries/create?customer=${customer?.id}`)}
        >
          <PlusCircleIcon className="size-3" /> Create enquiry
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => redirect(`customers/${customer?.id}`)}
        >
          <EyeIcon className="size-3" /> View customer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'address.city',
    header: 'City',
    cell: ({ row }) => {
      const address = row.original.address;
      return address ? <div>{address.city}</div> : null;
    },
  },
  {
    accessorKey: 'address.state',
    header: 'State',
    cell: ({ row }) => {
      const address = row.original.address;
      return address ? <div>{address.state}</div> : null;
    },
  },
  {
    accessorKey: 'gstNumber',
    header: 'GST Number',
    cell: ({ row }) => <div>{row.getValue('gstNumber')}</div>,
  },
  {
    accessorKey: 'vendorId',
    header: 'Vendor ID',
    cell: ({ row }) => <div>{row.getValue('vendorId')}</div>,
  },
  {
    accessorKey: 'id',
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <ActionsCell customer={row.original} />,
  },
];

export default function CustomerTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchInputValue, setSearchInputValue] = React.useState('');
  const searchQuery = useDebounce(searchInputValue, 300);

  // Filter states
  const [filters, setFilters] = React.useState({
    country: '',
    state: '',
    city: '',
  });

  const [page, setPage] = React.useState(0);
  const [limit] = React.useState(100);

  const {
    data = { customers: [], total: 0, totalPages: 0 },
    isLoading,
    refetch: refetchCustomerData,
  } = useCustomers({
    country: filters.country,
    state: filters.state,
    city: filters.city,
    page: page + 1,
    limit: limit,
    searchQuery: searchQuery,
  });

  const { customers, total, totalPages } = data || {};

  const table = useReactTable({
    data: customers || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    rowCount: total,
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

  // Reset page when search query or filters change
  React.useEffect(() => {
    setPage(0);
  }, [searchQuery, filters.country, filters.state, filters.city]);

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4 justify-between flex-wrap">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search Customer..."
            value={searchInputValue}
            onChange={(event) => setSearchInputValue(event.target.value)}
            className="max-w-sm"
          />
          <CustomerFilters
            onApplyFilters={setFilters}
            currentFilters={filters}
          />
        </div>
        <Button variant="secondary" onClick={() => refetchCustomerData()}>
          <RefreshCwIcon className="size-4" /> Refresh Data
        </Button>
      </div>
      
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <Loader text="Fetching customers data" />
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
                    <p>No customers to view</p>
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
            Page {page + 1} of {totalPages} (Total Customers: {total})
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
                totalPages ? Math.min(prev + 1, totalPages - 1) : prev + 1
              )
            }
            disabled={page + 1 === totalPages || totalPages === 0 || total === 0}
          >
            Next
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
