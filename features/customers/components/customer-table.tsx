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
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
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
  return (
    <div>
      <h2 className="text-lg font-semibold">Filter Customers</h2>
      <div className="flex gap-4 p-4">
        <div className="flex gap-4 items-center">
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
              {countries.map((country) => (
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
              {states.map((state) => (
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
              {cities.map((city) => (
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
  const [searchQuery, setSearchQuery] = React.useState('');

  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [filterCity, setFilterCity] = useState<string>('');
  const [filterState, setFilterState] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<string>('');

  const clearFilters = (closeFiter: boolean = false) => {
    setFilterCity('');
    setFilterState('');
    setFilterCountry('');
    if (closeFiter) {
      setShowFilter(false);
    }
  };

  const {
    data: customers = [],
    isLoading,
    refetch: refetchCustomerData,
  } = useCustomers({
    city: filterCity,
    state: filterState,
    country: filterCountry,
  });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers]);

  const filteredCustomers = React.useMemo(() => {
    if (!searchQuery) return customers;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, customers]);

  const table = useReactTable({
    data: filteredCustomers ?? [],
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

  const toggleFilter = () => {
    setShowFilter((prev) => {
      if (prev) {
        clearFilters(true);
      }
      return !prev;
    });
  };

  if (isLoading) {
    return <Loader text="Fetching all customers" />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4 justify-between flex-wrap">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search Customer..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
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
            cities={Array.from(
              new Set(
                customers
                  ?.map(({ address: { city } }) => city)
                  .filter(
                    (city) => city !== undefined && city !== ' ' && city !== ''
                  )
              )
            )}
            countries={Array.from(
              new Set(
                customers
                  ?.map(({ address: { country } }) => country)
                  .filter(
                    (country) =>
                      country !== undefined && country !== ' ' && country !== ''
                  )
              )
            )}
            states={Array.from(
              new Set(
                customers
                  ?.map(({ address: { state } }) => state)
                  .filter(
                    (state) =>
                      state !== undefined && state !== ' ' && state !== ''
                  )
              )
            )}
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
      </div>
      {/* <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div> */}
    </div>
  );
}
