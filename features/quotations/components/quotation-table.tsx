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
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  CopyIcon,
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
import { Quotation } from '../schemas';
import { Input } from '@/components/ui/input';
import Loader from '@/components/loader';
import { useToast } from '@/hooks/use-toast';
import { useQuotations } from '../api/use-quotations';
import { redirect } from 'next/navigation';
import Fuse from 'fuse.js';
import { useDebounce } from '@/hooks/use-debounce';

const ActionsCell = ({ quotation }: { quotation: Quotation }) => {
  const { toast } = useToast();

  const handleCopyCustomerId = () => {
    navigator.clipboard.writeText(quotation.customerId!);
    toast({
      title: 'Customer ID copied',
      description: quotation.customerId,
    });
  };

  const handleCopyEnquiryNumber = () => {
    navigator.clipboard.writeText(quotation.enquiryNumber!);
    toast({
      title: 'Enquiry Number copied',
      description: quotation?.enquiryNumber,
    });
  };

  const handleCopyQuotationId = () => {
    navigator.clipboard.writeText(quotation.id!);
    toast({
      title: 'Quotation ID copied',
      description: quotation?.id,
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
          onClick={() => redirect(`quotations/${quotation?.id}`)}
        >
          <EyeIcon className="size-3" /> View Quotation
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyCustomerId}
        >
          <CopyIcon className="size-3" /> Copy Customer ID
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyEnquiryNumber}
        >
          <CopyIcon className="size-3" /> Copy Enquiry Number
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyQuotationId}
        >
          <CopyIcon className="size-3" /> Copy Quotation ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const columns: ColumnDef<Quotation>[] = [
  {
    accessorKey: 'customerName',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>{row.getValue('customerName')}</div>,
  },
  {
    accessorKey: 'enquiryNumber',
    header: 'Enquiry Number',
    cell: ({ row }) => {
      const enquiryNumber = row.getValue('enquiryNumber') as string;
      return enquiryNumber ? <div>{enquiryNumber}</div> : 'NA';
    },
  },
  {
    accessorKey: 'quoteNumber',
    header: 'Quote Number',
    cell: ({ row }) => {
      const quoteNumber = row.getValue('quoteNumber') as string;
      return quoteNumber ? <div>{quoteNumber}</div> : 'NA';
    },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const totalAmount = row.getValue('totalAmount') as number;
      const currency = row.original.items[0]?.currency || 'INR';
      return (
        <div>
          {currency} {totalAmount}
        </div>
      );
    },
  },
  {
    accessorKey: 'id',
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <ActionsCell quotation={row.original} />,
  },
];

export default function QuotationsTable() {
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
  
  const [page, setPage] = React.useState(0);
  const [limit] = React.useState(1);

  const {
    data = { quotations: [], total: 0, totalPages: 0 },
    isLoading,
    refetch: refetchQuotationData,
  } = useQuotations({
    page: page + 1, 
    limit,
    searchQuery,
  });
  
  const { quotations, total, totalPages } = data || {};

  const fuseQuotationSearchKeys = [
    'customerName',
    'enquiryNumber',
    'quoteNumber',
    'totalAmount',
  ];

  // Fuse.js configuration
  const fuse = React.useMemo(() => {
    return new Fuse(quotations ?? [], {
      keys: fuseQuotationSearchKeys,
      threshold: 0.1, // Adjust threshold for fuzzy matching
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotations]);

  const filteredQuotations = React.useMemo(() => {
    if (!searchQuery) return quotations;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, quotations]);

  // Client-side pagination for search results
  const paginatedQuotations = React.useMemo(() => {
    if (!filteredQuotations) return [];
    
    if (searchQuery) {
      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      return filteredQuotations.slice(startIndex, endIndex);
    }
    
    return filteredQuotations;
  }, [filteredQuotations, page, limit, searchQuery]);

  // Calculate total pages based on filtered results
  const totalFilteredQuotations = filteredQuotations?.length || 0;
  const totalFilteredPages = Math.ceil(totalFilteredQuotations / limit);

  // Use appropriate pagination values based on whether we're searching or not
  const displayedTotal = searchQuery ? totalFilteredQuotations : total;
  const displayedTotalPages = searchQuery ? totalFilteredPages : totalPages;

  const table = useReactTable({
    data: searchQuery ? paginatedQuotations : filteredQuotations ?? [],
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

  // Reset page when search query changes
  React.useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search Quotation..."
            value={searchInputValue}
            onChange={(event) => setSearchInputValue(event.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline">
            <FilterIcon className="size-4" />
          </Button>
        </div>
        <Button variant="secondary" onClick={() => refetchQuotationData()}>
          <RefreshCwIcon className="size-4" /> Refresh Data
        </Button>
      </div>
      
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <Loader text="Fetching quotations data" />
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
                    <p>No Quotations to view</p>
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
            Page {page + 1} of {displayedTotalPages} (Total Quotations: {displayedTotal})
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
            disabled={page + 1 === displayedTotalPages}
          >
            Next
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
