import { Button } from "@/components/ui/button";
import EnquiriesTable from "@/features/enquiries/components/enquiries-table";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

const QuotationsPage = () => {
  return (
    <div className="w-full" data-testid="requirements-page">
      <div className="absolute right-4 top-4 flex gap-2">
        <Button asChild>
          <Link href={"/quotations/create"}>
            <Plus /> Add new Quotation
          </Link>
        </Button>
      </div>
      <div>
        <h3 className="font-bold text-xl">Quotations Listing</h3>
        <EnquiriesTable />
      </div>
    </div>
  );
};

export default QuotationsPage;
