import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Separator } from "@/components/ui/separator";
import { ProfilePopover } from "@/components/profile-popover";
import Navigation from "./navigation";

const Sidebar = () => {
  return (
    <aside className="h-full bg-neutral-100 p-4 w-full flex flex-col">
      <div className="flex-1">
        <Link href="/">
          <Image src="/logo.svg" alt="logo" width={164} height={48} />
        </Link>
        <Separator className="my-4" />
        <Navigation />
      </div>

      {/* Profile section at the bottom */}
      <div className="mt-auto pt-4">
        <Separator className="mb-4" />
        <ProfilePopover />
      </div>
    </aside>
  );
};

export default Sidebar;
