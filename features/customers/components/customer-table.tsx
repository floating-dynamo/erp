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
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  CopyIcon,
  EyeIcon,
  FilterIcon,
  FilterX,
  MoreHorizontal,
  PlusCircleIcon,
  RefreshCwIcon,
  XIcon,
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
import Fuse from 'fuse.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const CustomerSearchFilters = ({
  countries,
  states,
  cities,
  selectedCountry,
  setSelectedCountry,
  selectedState,
  setSelectedState,
  selectedCity,
  setSelectedCity,
  clearFilters,
}: {
  countries: string[];
  states: string[];
  cities: string[];
  selectedCountry: string;
  setSelectedCountry: (value: string) => void;
  selectedState: string;
  setSelectedState: (value: string) => void;
  selectedCity: string;
  setSelectedCity: (value: string) => void;
  clearFilters: () => void;
}) => {
  const sanitizedCities = Array.from(
    new Set(
      cities.filter((city) => city !== undefined && city !== ' ' && city !== '')
    )
  );
  const sanitizedStates = Array.from(
    new Set(
      states.filter(
        (state) => state !== undefined && state !== ' ' && state !== ''
      )
    )
  );
  const sanitizedCountries = Array.from(
    new Set(
      countries.filter(
        (country) => country !== undefined && country !== ' ' && country !== ''
      )
    )
  );

  return (
    <div>
      <h2 className="text-md font-semibold">Select Filters</h2>
      <div className="flex gap-4 p-4 flex-wrap">
        <div className="flex gap-4 items-center flex-wrap">
          <label className="text-sm font-medium" htmlFor="country">
            Country
          </label>
          <Select
            value={selectedCountry}
            onValueChange={(value) => setSelectedCountry(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {sanitizedCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium" htmlFor="state">
            State
          </label>
          <Select
            value={selectedState}
            onValueChange={(value) => setSelectedState(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              {sanitizedStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4 items-center">
          <label htmlFor="city">City</label>
          <Select
            value={selectedCity}
            onValueChange={(value) => setSelectedCity(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {sanitizedCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => clearFilters()} variant="tertiaryDestuctive">
          <XIcon className="size-4" /> Clear Filters
        </Button>
      </div>
    </div>
  );
};

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

  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');

  const [page, setPage] = React.useState(0);
  const [limit] = React.useState(3);

  const clearFilters = (closeFiter: boolean = false) => {
    setFilterCity('');
    setFilterState('');
    setFilterCountry('');
    if (closeFiter) {
      setShowFilter(false);
    }
  };

  const {
    data = { customers: [], total: 0, totalPages: 0 },
    isLoading,
    refetch: refetchCustomerData,
  } = useCustomers({
    city: filterCity,
    state: filterState,
    country: filterCountry,
    page: page + 1,
    limit: limit,
    searchQuery: searchQuery, // Use debounced search query
  });

  const { customers, total } = data || {};

  const fuseCustomerSearchKeys = [
    'name',
    'address.city',
    'address.state',
    'gstNumber',
    'vendorId',
  ];

  const fuse = React.useMemo(() => {
    return new Fuse(customers || [], {
      keys: fuseCustomerSearchKeys,
      threshold: 0.1, // Adjust threshold for fuzzy matching
    });
  }, [customers]);

  // Apply fuzzy search on all customers data
  const filteredCustomers = React.useMemo(() => {
    if (!searchQuery) return customers;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, customers]);

  // Client-side pagination for search results
  const paginatedCustomers = React.useMemo(() => {
    if (!filteredCustomers) return [];

    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, page, limit]);

  // Calculate total pages based on filtered results
  const totalFilteredCustomers = filteredCustomers?.length || 0;
  const totalFilteredPages = Math.ceil(totalFilteredCustomers / limit);

  // Use appropriate pagination values based on whether we're searching or not
  const displayedTotal = searchQuery ? totalFilteredCustomers : total;
  const displayedTotalPages = searchQuery ? totalFilteredPages : data?.totalPages;

  const table = useReactTable({
    data: searchQuery ? paginatedCustomers : filteredCustomers || [],
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
  }, [searchQuery]); // Use debounced searchQuery

  const toggleFilter = () => {
    setShowFilter((prev) => {
      if (prev) {
        clearFilters(true);
      }
      return !prev;
    });
  };

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
          <Button
            variant={showFilter ? 'tertiaryDestuctive' : 'outline'}
            onClick={() => toggleFilter()}
          >
            {showFilter ? (
              <FilterX className="size-4" />
            ) : (
              <FilterIcon className="size-4" />
            )}
          </Button>
        </div>
        <Button variant="secondary" onClick={() => refetchCustomerData()}>
          <RefreshCwIcon className="size-4" /> Refresh Data
        </Button>
      </div>

      {showFilter && customers && (
        <div>
          <CustomerSearchFilters
            clearFilters={clearFilters}
            cities={customers?.map(({ address: { city } }) => city)}
            countries={customers?.map(({ address: { country } }) => country)}
            states={customers?.map(({ address: { state } }) => state)}
            selectedCity={filterCity}
            setSelectedCity={setFilterCity}
            selectedCountry={filterCountry}
            setSelectedCountry={setFilterCountry}
            selectedState={filterState}
            setSelectedState={setFilterState}
          />
        </div>
      )}
      
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
            Page {page + 1} of {displayedTotalPages} (Total Customers: {displayedTotal})
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
