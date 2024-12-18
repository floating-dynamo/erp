import React from "react";
import { FileTextIcon, UsersIcon } from "lucide-react";
import { GoHome, GoHomeFill } from "react-icons/go";
import Link from "next/link";
import { cn } from "@/lib/utils";

const routes = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: GoHome,
    activeIcon: GoHomeFill,
  },
  {
    label: "Customers",
    href: "/customers",
    icon: UsersIcon,
    activeIcon: UsersIcon,
  },
  {
    label: "Requirements",
    href: "/requirements",
    icon: FileTextIcon,
    activeIcon: FileTextIcon,
  },
];

const Navigation = () => {
  return (
    <ul className="flex flex-col">
      {routes.map(({ label, href, icon, activeIcon }) => {
        const isActive = false;
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
