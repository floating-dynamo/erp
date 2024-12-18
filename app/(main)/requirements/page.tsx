import { Button } from "@/components/ui/button";
import { EllipsisVertical, Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

const RequirementsPage = () => {
  return (
    <div className="w-full" data-test-id="requirements-page">
      <div className="absolute right-2 top-2 flex gap-2">
        <Button asChild>
          <Link href={"/requirements/create"}>
            <Plus /> New
          </Link>
        </Button>
        <Button variant={"outline"}>
          <EllipsisVertical />
        </Button>
      </div>
      <div>
        Requirements
      </div>
    </div>
  );
};

export default RequirementsPage;
