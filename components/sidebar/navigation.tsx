"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { FolderIcon, FolderOpenIcon, HomeIcon, UserIcon, UsersIcon } from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    activeIcon: HomeIcon,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: UserIcon,
    activeIcon: UsersIcon,
  },
  {
    label: "Enquiries",
    href: "/enquiries",
    icon: FolderIcon,
    activeIcon: FolderOpenIcon,
  },
];

const Navigation = () => {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col">
      {routes.map(({ label, href, icon, activeIcon }) => {
        const isActive = pathname === href;
        const Icon = isActive ? activeIcon : icon;

        return (
          <Link key={href} href={href}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <Icon className="size-5 text-neutral-500" />
              {label}
            </div>
          </Link>
        );
      })}
    </ul>
  );
};

export default Navigation;
