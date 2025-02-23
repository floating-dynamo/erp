"use client";

import * as React from "react";
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
import { ArrowUpDown, CopyIcon, EyeIcon, MoreHorizontal } from "lucide-react";

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
import { Quotation } from "../schemas";
import { Input } from "@/components/ui/input";
import Loader from "@/components/loader";
import { useToast } from "@/hooks/use-toast";
import { useQuotations } from "../api/use-quotations";
import { redirect } from "next/navigation";

const ActionsCell = ({ quotation }: { quotation: Quotation }) => {
  const { toast } = useToast();

  const handleCopyCustomerId = () => {
    navigator.clipboard.writeText(quotation.customerId!);
    toast({
      title: "Customer ID copied",
      description: quotation.customerId,
    });
  };

  const handleCopyEnquiryNumber = () => {
    navigator.clipboard.writeText(quotation.enquiryNumber!);
    toast({
      title: "Enquiry Number copied",
      description: quotation?.enquiryNumber,
    });
  };

  const handleCopyQuotationId = () => {
    navigator.clipboard.writeText(quotation.id!);
    toast({
      title: "Quotation ID copied",
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
    cell: ({ row }) => <div>{row.getValue("customerName")}</div>,
  },
  {
    accessorKey: "enquiryNumber",
    header: "Enquiry Number",
    cell: ({ row }) => {
      const enquiryNumber = row.getValue("enquiryNumber") as string;
      return enquiryNumber ? <div>{enquiryNumber}</div> : "NA";
    },
  },
  {
    accessorKey: "quoteNumber",
    header: "Quote Number",
    cell: ({ row }) => {
      const quoteNumber = row.getValue("quoteNumber") as string;
      return quoteNumber ? <div>{quoteNumber}</div> : "NA";
    },
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="outline"
          size={"sm"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const totalAmount = row.getValue("totalAmount") as number;
      const currency = row.original.items[0].currency || "INR";
      return (
        <div>
          {currency} {totalAmount}
        </div>
      );
    },
  },
  {
    accessorKey: "id",
  },
  {
    id: "actions",
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
  const { data: quotations = [], isLoading } = useQuotations();

  const table = useReactTable({
    data: quotations ?? [],
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
    return <Loader text="Fetching all customers" />;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Search Customers by name"
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
                  <p>No Quotations to view</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
