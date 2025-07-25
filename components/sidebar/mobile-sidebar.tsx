"use client";
import { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Sidebar from "./index";

export const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Sheet modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="lg:hidden" variant="secondary">
          <MenuIcon className="size-4 text-neutral-500" />
        </Button>
      </SheetTrigger>
      <SheetContent side={"left"} className="p-0">
        <SheetTitle>{/* Just for accessbility */}</SheetTitle>
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
