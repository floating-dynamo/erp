"use client";
import React from "react";

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
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  CheckIcon,
  CirclePlusIcon,
  CopyIcon,
  EyeIcon,
  MoreHorizontal,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Enquiry } from "../schemas";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEnquiries } from "../api/use-enquiries";
import Loader from "@/components/loader";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

const ActionsCell = ({ enquiry }: { enquiry: Enquiry }) => {
  const { toast } = useToast();

  const handleCopyEnquiryId = () => {
    navigator.clipboard.writeText(enquiry.id!);
    toast({
      title: "Enquiry ID copied",
      description: enquiry.id,
    });
  };

  const handleCopyCustomerId = () => {
    navigator.clipboard.writeText(enquiry.customerId!);
    toast({
      title: "Customer ID copied",
      description: enquiry.customerId,
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
          className="cursor-pointer text-xs sm:text-sm"
          onClick={() => redirect(`/quotations/create?enquiry=${enquiry?.id}`)}
        >
          <CirclePlusIcon className="size-4" /> Create Quotation
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => redirect(`enquiries/${enquiry?.id}`)}
        >
          <EyeIcon className="size-3" /> View enquiry
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleCopyEnquiryId}
        >
          <CopyIcon className="size-3" /> Copy enquiry ID
        </DropdownMenuItem>
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

const columns: ColumnDef<Enquiry>[] = [
  {
    accessorKey: "customerId",
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={"sm"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4">{row.getValue("customerName")}</div>
    ),
  },
  {
    accessorKey: "enquiryNumber",
    header: "Enquiry Number",
    cell: ({ row }) => (
      <div className="ml-4">{row.getValue("enquiryNumber")}</div>
    ),
  },
  {
    accessorKey: "enquiryDate",
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={"sm"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Enquiry Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4">{formatDate(row.getValue("enquiryDate"))}</div>
    ),
  },
  {
    accessorKey: "quotationDueDate",
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={"sm"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quotation Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4">{formatDate(row.getValue("quotationDueDate"))}</div>
    ),
  },
  {
    accessorKey: "isQotationCreated",
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={"sm"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quotation Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="ml-4">
        {row.getValue("isQotationCreated") ? (
          <CheckIcon className="size-4 text-green-700" />
        ) : (
          <XIcon className="size-4 text-red-500" />
        )}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell enquiry={row.original} />,
  },
];

const EnquiriesTable: React.FC = () => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      customerId: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const { data: enquiries, isLoading } = useEnquiries({});

  const table = useReactTable({
    data: enquiries!,
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
    return <Loader text="Fetching all enquiries" />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search Enquiries by Customer Name"
          value={
            (table.getColumn("customerName")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("customerName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
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
                  data-state={row.getIsSelected() && "selected"}
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
                  <p>Could not find the enquiry</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EnquiriesTable;
