import { Home, Package, Truck, UserRound } from "lucide-react";

export const siteConfig = {
  brand: {
    logo: Truck,
    name: "ERP",
  },
  sidebar: {
    items: [
      {
        title: "Home",
        url: "/dashboard",
        icon: Home,
      },
      {
        title: "Customers",
        url: "/customers",
        icon: UserRound,
      },
      {
        title: "Requirements",
        url: "/requirements",
        icon: Package,
      },
      {
        title: "Quotations",
        url: "/quotations",
        icon: Package,
      },
      {
        title: "My Company",
        url: "/my-company",
        icon: Package,
      },
    ],
  },
};
