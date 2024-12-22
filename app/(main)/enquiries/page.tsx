import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

const RequirementsPage = () => {
  return (
    <div className="w-full" data-testid="requirements-page">
      <div className="absolute right-4 top-4 flex gap-2">
        <Button asChild>
          <Link href={"/enquiries/create"}>
            <Plus /> Add new Enquiry
          </Link>
        </Button>
      </div>
      <div>Enquiries</div>
    </div>
  );
};

export default RequirementsPage;
