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
  RefreshCwIcon,
  ShieldCheckIcon,
  ShieldXIcon,
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Loader from '@/components/loader';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { UserFilters } from './user-filters';
import { useUsers } from '../api/use-users';
import { UserFilterFormValues } from '../types';
import { User } from '@/lib/types/user';
import { formatDate } from '@/lib/utils';
import Fuse from 'fuse.js';
import { Badge } from '@/components/ui/badge';

const ActionsCell = ({ user }: { user: User }) => {
  const { toast } = useToast();
  const router = useRouter();

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(user.id);
    toast({
      title: 'User ID copied',
      description: user.id,
    });
  };

  const handleViewUser = () => {
    router.push(`/users/${user.id}`);
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
          onClick={handleViewUser}
        >
          <EyeIcon className="size-3" /> View User
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyUserId}
        >
          <CopyIcon className="size-3" /> Copy User ID
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'employee':
        return 'secondary';
      case 'viewer':
        return 'outline';
      case 'accountant':
        return 'secondary';
      case 'sales':
        return 'default';
      case 'purchase':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getRoleVariant(role)} className="capitalize">
      {role}
    </Badge>
  );
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="flex items-center gap-2">
      {isActive ? (
        <>
          <ShieldCheckIcon className="size-4 text-green-600" />
          <span className="text-green-600 font-medium">Active</span>
        </>
      ) : (
        <>
          <ShieldXIcon className="size-4 text-red-600" />
          <span className="text-red-600 font-medium">Inactive</span>
        </>
      )}
    </div>
  );
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'id',
  },
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
    cell: ({ row }) => <div className="ml-4">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="ml-4">{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4">
        <RoleBadge role={row.getValue('role')} />
      </div>
    ),
  },
  {
    accessorKey: 'companyName',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="ml-4">{row.getValue('companyName') || 'N/A'}</div>,
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4">
        <StatusBadge isActive={row.getValue('isActive')} />
      </div>
    ),
  },
  {
    accessorKey: 'lastLoginAt',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Login
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const lastLogin = row.getValue('lastLoginAt');
      return (
        <div className="ml-4">
          {lastLogin ? formatDate(new Date(lastLogin as string)) : 'Never'}
        </div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4">{formatDate(new Date(row.getValue('createdAt')))}</div>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
];

export default function UsersTable() {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
    id: false,
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchInputValue, setSearchInputValue] = React.useState('');
  const searchQuery = useDebounce(searchInputValue, 300);

  const [page, setPage] = React.useState(0);
  const [limit] = React.useState(100);

  const [filters, setFilters] = React.useState<UserFilterFormValues>({
    roleFilter: '',
    isActiveFilter: '',
    companyFilter: '',
    lastLoginFrom: '',
    lastLoginTo: '',
    createdFrom: '',
    createdTo: '',
  });

  const {
    data = { users: [], total: 0, totalPages: 0 },
    isLoading,
    refetch: refetchUsersData,
  } = useUsers({
    role: filters.roleFilter,
    isActive: filters.isActiveFilter ? filters.isActiveFilter === 'true' : undefined,
    companyId: filters.companyFilter,
    page: page + 1,
    limit,
    searchQuery,
    lastLoginFrom: filters.lastLoginFrom,
    lastLoginTo: filters.lastLoginTo,
    createdFrom: filters.createdFrom,
    createdTo: filters.createdTo,
  });

  const { users, total, totalPages } = data || {};

  const fuseSearchKeys: (keyof User | string)[] = [
    'name',
    'email',
    'role',
    'companyName',
  ];

  // Fuse.js configuration
  const fuse = React.useMemo(() => {
    return new Fuse(users || [], {
      keys: fuseSearchKeys,
      threshold: 0.1, // Adjust threshold for fuzzy matching
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const filteredUsers = React.useMemo(() => {
    if (!searchQuery) return users;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, users]);

  // Client-side pagination for search results
  const paginatedUsers = React.useMemo(() => {
    if (!filteredUsers) return [];
    
    if (searchQuery) {
      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      return filteredUsers.slice(startIndex, endIndex);
    }
    
    return filteredUsers;
  }, [filteredUsers, page, limit, searchQuery]);

  // Calculate total pages based on filtered results
  const totalFilteredUsers = filteredUsers?.length || 0;
  const totalFilteredPages = Math.ceil(totalFilteredUsers / limit);

  // Use appropriate pagination values based on whether we're searching or not
  const displayedTotal = searchQuery ? totalFilteredUsers : total;
  const displayedTotalPages = searchQuery ? totalFilteredPages : totalPages;

  const table = useReactTable({
    data: searchQuery ? paginatedUsers : filteredUsers ?? [],
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
  }, [searchQuery, filters]);

  const handleApplyFilters = (newFilters: UserFilterFormValues) => {
    setFilters(newFilters);
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search Users..."
            value={searchInputValue}
            onChange={(event) => setSearchInputValue(event.target.value)}
            className="max-w-sm"
          />
          <UserFilters
            onApplyFilters={handleApplyFilters}
            currentFilters={filters}
          />
        </div>
        <Button variant="secondary" onClick={() => refetchUsersData()}>
          <RefreshCwIcon className="size-4" /> Refresh Data
        </Button>
      </div>
      
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <Loader text="Fetching users data" />
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
                    <p>No users to view</p>
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
            Page {page + 1} of {displayedTotalPages || 1} (Total Users: {displayedTotal})
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
            disabled={page + 1 >= (displayedTotalPages || 1)}
          >
            Next
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
