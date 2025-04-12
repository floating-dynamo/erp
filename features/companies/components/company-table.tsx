'use client';
import React from 'react';
import Fuse from 'fuse.js';
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
  RefreshCwIcon,
  FilterIcon,
  MoreHorizontal,
  EyeIcon,
  CopyIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useGetCompanies } from '../api/use-get-companies';
import Loader from '@/components/loader';
import { Company } from '../schemas';
import { redirect } from 'next/navigation';

const ActionsCell = ({ company }: { company: Company }) => {
  const { toast } = useToast();

  const handleCopyCompanyId = () => {
    navigator.clipboard.writeText(company.id!);
    toast({
      title: 'Company ID copied',
      description: company.id,
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
          onClick={() => redirect(`/companies/${company.id}`)}
        >
          <EyeIcon className="size-3" /> View Company
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyCompanyId}
        >
          <CopyIcon className="size-3" /> Copy Company ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const columns: ColumnDef<Company>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="outline"
        size={'sm'}
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: 'state',
    header: 'State',
  },
  {
    accessorKey: 'gstNumber',
    header: 'GST Number',
  },
  {
    accessorKey: 'contact',
    header: 'Contact',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <ActionsCell company={row.original} />,
  },
];

const CompanyTable: React.FC = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data: companies, isLoading, refetch } = useGetCompanies();

  const fuseCompanySearchKeys = ['name', 'city', 'state', 'gstNumber', 'email'];

  const fuse = React.useMemo(() => {
    return new Fuse(companies || [], {
      keys: fuseCompanySearchKeys,
      threshold: 0.1, // Adjust threshold for fuzzy matching
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companies]);

  const filteredCompanies = React.useMemo(() => {
    if (!searchQuery) return companies;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, companies]);

  const table = useReactTable({
    data: filteredCompanies ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (isLoading) {
    return <Loader text="Fetching all companies" />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search Company..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline">
            <FilterIcon className="size-4" />
          </Button>
        </div>
        <Button variant="secondary" onClick={() => refetch()}>
          <RefreshCwIcon className="size-4" /> Refresh Data
        </Button>
      </div>
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
                  <p>Could not find any companies</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CompanyTable;