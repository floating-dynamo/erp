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
import {
  ArrowUpDown,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  MoreHorizontal,
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
import { SupplierDc } from '../schemas';
import { Input } from '@/components/ui/input';
import Loader from '@/components/loader';
import { useToast } from '@/hooks/use-toast';
import { useSupplierDcs } from '../api/use-supplier-dcs';
import { redirect } from 'next/navigation';
import Fuse from 'fuse.js';
import { formatDate, generateSupplierDCExcel } from '@/lib/utils';

const ActionsCell = ({ supplierDc }: { supplierDc: SupplierDc }) => {
  const { toast } = useToast();

  const handleCopySupplierDcId = () => {
    navigator.clipboard.writeText(supplierDc.id!);
    toast({
      title: 'Supplier DC ID copied',
      description: supplierDc?.id,
    });
  };

  const handleCopySupplierDcNumber = () => {
    navigator.clipboard.writeText(supplierDc.dcNo!);
    toast({
      title: 'Supplier DC Number copied',
      description: supplierDc?.dcNo,
    });
  };

  const handleDownloadExcel = (supplierDc: SupplierDc) => {
    generateSupplierDCExcel(supplierDc);
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
          onClick={() => redirect(`supplier-dc/${supplierDc?.id}`)}
        >
          <EyeIcon className="size-3" /> View Supplier DC
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => handleDownloadExcel(supplierDc)}
        >
          <DownloadIcon className="size-3" /> Download Excel Sheet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopySupplierDcId}
        >
          <CopyIcon className="size-3" /> Copy Supplier DC ID
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopySupplierDcNumber}
        >
          <CopyIcon className="size-3" /> Copy Supplier DC Number
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const columns: ColumnDef<SupplierDc>[] = [
  {
    accessorKey: 'dcNo',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          DC Number
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('dcNo')}</div>,
  },
  {
    accessorKey: 'from',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          From
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('from')}</div>,
  },
  {
    accessorKey: 'to',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          To
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('to')}</div>,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => {
      const date = row.getValue('date') as string;
      return date ? <div>{formatDate(new Date(date))}</div> : 'NA';
    },
  },
  {
    accessorKey: 'gstIn',
    header: 'GSTIN',
    cell: ({ row }) => {
      const gstIn = row.getValue('gstIn') as string;
      return gstIn ? <div>{gstIn}</div> : 'NA';
    },
  },
  {
    accessorKey: 'id',
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <ActionsCell supplierDc={row.original} />,
  },
];

export default function SupplierDcTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      id: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const {
    data: supplierDcs = [],
    isLoading,
    refetch: refetchSupplierDcsData,
  } = useSupplierDcs();
  const fuseQuotationSearchKeys = ['to', 'from', 'gstIn', 'date', 'dcNo'];

  // Fuse.js configuration
  const fuse = React.useMemo(() => {
    return new Fuse(supplierDcs ?? [], {
      keys: fuseQuotationSearchKeys,
      threshold: 0.1, // Adjust threshold for fuzzy matching
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierDcs]);

  const filteredQuotations = React.useMemo(() => {
    if (!searchQuery) return supplierDcs;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, supplierDcs]);

  const table = useReactTable({
    data: filteredQuotations ?? [],
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

  if (isLoading) {
    return <Loader text="Fetching all Supplier DCs" />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search Supplier Dcs..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline">
            <FilterIcon className="size-4" />
          </Button>
        </div>
        <Button variant="secondary" onClick={() => refetchSupplierDcsData()}>
          <RefreshCwIcon className="size-4" /> Refresh Data
        </Button>
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
                  <p>No Supplier Dcs to view</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
