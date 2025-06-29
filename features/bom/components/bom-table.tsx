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
  ArrowUpDown,
  ArrowLeft,
  MoreHorizontal,
  EyeIcon,
  CopyIcon,
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
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useBoms } from '../api/use-boms';
import { redirect } from 'next/navigation';
import Fuse from 'fuse.js';
import { useDebounce } from '@/hooks/use-debounce';
import Loader from '@/components/loader';
import { Badge } from '@/components/ui/badge';
import { BomFilters } from './bom-filters';
import type { Bom } from '../schemas';

interface ActionsProps {
  bom: Bom;
}

const ActionsCell: React.FC<ActionsProps> = ({ bom }) => {
  const { toast } = useToast();

  const handleCopyBomId = (): void => {
    if (bom.id) {
      navigator.clipboard.writeText(bom.id);
      toast({
        title: 'BOM ID copied',
        description: bom.id,
      });
    }
  };

  const handleCopyBomNumber = (): void => {
    if (bom.bomNumber) {
      navigator.clipboard.writeText(bom.bomNumber);
      toast({
        title: 'BOM Number copied',
        description: bom.bomNumber,
      });
    }
  };

  const handleCopyProductCode = (): void => {
    navigator.clipboard.writeText(bom.productCode);
    toast({
      title: 'Product Code copied',
      description: bom.productCode,
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
          onClick={() => redirect(`boms/${bom?.id}`)}
        >
          <EyeIcon className="size-3" /> View BOM
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyBomId}
        >
          <CopyIcon className="size-3" /> Copy BOM ID
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyBomNumber}
        >
          <CopyIcon className="size-3" /> Copy BOM Number
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyProductCode}
        >
          <CopyIcon className="size-3" /> Copy Product Code
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const columns: ColumnDef<Bom>[] = [
  {
    accessorKey: 'bomNumber',
    header: 'BOM Number',
    cell: ({ row }) => {
      const bomNumber = row.getValue('bomNumber') as string;
      return bomNumber ? <div className="font-medium">{bomNumber}</div> : 'NA';
    },
  },
  {
    accessorKey: 'bomName',
    header: 'BOM Name',
    cell: ({ row }) => {
      const bomName = row.getValue('bomName') as string;
      return <div className="font-medium">{bomName}</div>;
    },
  },
  {
    accessorKey: 'productName',
    header: 'Product Name',
    cell: ({ row }) => {
      const productName = row.getValue('productName') as string;
      return <div>{productName}</div>;
    },
  },
  {
    accessorKey: 'productCode',
    header: 'Product Code',
    cell: ({ row }) => {
      const productCode = row.getValue('productCode') as string;
      return <div className="font-mono text-sm">{productCode}</div>;
    },
  },
  {
    accessorKey: 'bomType',
    header: 'Type',
    cell: ({ row }) => {
      const bomType = row.getValue('bomType') as string;
      const typeColors = {
        MANUFACTURING: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        ENGINEERING: 'bg-green-100 text-green-800 hover:bg-green-200',
        SALES: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
        SERVICE: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      };
      return (
        <Badge className={`transition-colors ${typeColors[bomType as keyof typeof typeColors] || 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
          {bomType}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const statusColors = {
        DRAFT: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        ACTIVE: 'bg-green-100 text-green-800 hover:bg-green-200',
        INACTIVE: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        ARCHIVED: 'bg-red-100 text-red-800 hover:bg-red-200',
      };
      return (
        <Badge className={`transition-colors ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'version',
    header: 'Version',
    cell: ({ row }) => {
      const version = row.getValue('version') as string;
      return <div className="text-sm">{version}</div>;
    },
  },
  {
    accessorKey: 'totalMaterialCost',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Total Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const totalCost = row.getValue('totalMaterialCost') as number;
      const currency = row.original.items[0]?.currency || 'INR';
      return (
        <div className="font-medium">
          {formatCurrency(totalCost, currency)}
        </div>
      );
    },
  },
  {
    accessorKey: 'bomDate',
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={'sm'}
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          BOM Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const bomDate = row.getValue('bomDate') as string;
      return bomDate ? <div>{formatDate(new Date(bomDate))}</div> : 'NA';
    },
  },
  {
    accessorKey: 'createdBy',
    header: 'Created By',
    cell: ({ row }) => {
      const createdBy = row.getValue('createdBy') as string;
      return <div className="text-sm">{createdBy || 'NA'}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <ActionsCell bom={row.original} />,
  },
];

export default function BomsTable() {
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
  const [limit] = React.useState(100);
  
  // Add filter state
  const [filters, setFilters] = React.useState({
    productNameFilter: '',
    bomTypeFilter: '',
    statusFilter: '',
    costFrom: '',
    costTo: '',
  });

  const {
    data = { boms: [], total: 0, totalPages: 0 },
    isLoading,
    refetch: refetchBomData,
  } = useBoms({
    page: page + 1, 
    limit,
    searchQuery,
    productNameFilter: filters.productNameFilter,
    bomTypeFilter: filters.bomTypeFilter,
    statusFilter: filters.statusFilter,
    costFrom: filters.costFrom,
    costTo: filters.costTo,
  });
  
  const { boms, total, totalPages } = data || {};

  const fuseBomSearchKeys = [
    'bomName',
    'productName',
    'productCode',
    'bomNumber',
    'bomType',
    'status',
  ];

  // Fuse.js configuration
  const fuse = React.useMemo(() => {
    return new Fuse(boms ?? [], {
      keys: fuseBomSearchKeys,
      threshold: 0.1, // Adjust threshold for fuzzy matching
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boms]);

  const filteredBoms = React.useMemo(() => {
    if (!searchQuery) return boms;
    return fuse.search(searchQuery).map((result) => result.item);
  }, [searchQuery, fuse, boms]);

  // Client-side pagination for search results
  const paginatedBoms = React.useMemo(() => {
    if (!filteredBoms) return [];
    
    if (searchQuery) {
      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      return filteredBoms.slice(startIndex, endIndex);
    }
    
    return filteredBoms;
  }, [filteredBoms, page, limit, searchQuery]);

  // Calculate total pages based on filtered results
  const totalFilteredBoms = filteredBoms?.length || 0;
  const totalFilteredPages = Math.ceil(totalFilteredBoms / limit);

  // Use appropriate pagination values based on whether we're searching or not
  const displayedTotal = searchQuery ? totalFilteredBoms : total;
  const displayedTotalPages = searchQuery ? totalFilteredPages : (totalPages || 0);

  const table = useReactTable({
    data: searchQuery ? paginatedBoms : filteredBoms ?? [],
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

  const handleApplyFilters = (newFilters: {
    productNameFilter: string;
    bomTypeFilter: string;
    statusFilter: string;
    costFrom: string;
    costTo: string;
  }) => {
    setFilters(newFilters);
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Search BOMs..."
            value={searchInputValue}
            onChange={(event) => setSearchInputValue(event.target.value)}
            className="max-w-sm"
          />
          <BomFilters 
            onApplyFilters={handleApplyFilters} 
            currentFilters={filters}
          />
        </div>
        <Button variant="secondary" onClick={() => refetchBomData()}>
          <RefreshCwIcon className="size-4" /> Refresh Data
        </Button>
      </div>
      
      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <Loader text="Fetching BOMs data" />
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
                    <p>No BOMs to view</p>
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
            Page {page + 1} of {displayedTotalPages} (Total BOMs: {displayedTotal})
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
                Math.min(prev + 1, (displayedTotalPages || 1) - 1)
              )
            }
            disabled={page >= (displayedTotalPages || 1) - 1}
          >
            Next <ArrowLeft className="size-4 rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}