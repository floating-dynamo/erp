"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { capitalizeFirstLetter } from "@/lib/utils";

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageName = capitalizeFirstLetter(pathname.split("/")[1]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <div className="flex items-center space-x-2 pt-2">
          <SidebarTrigger />
          <Separator orientation="vertical" />
          <p className="font-medium text-primary">{pageName}</p>
        </div>
        <div className="w-full">{children}</div>
      </main>
    </SidebarProvider>
  );
}
