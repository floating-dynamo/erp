import { Home, Package, Sparkles, UserRound } from "lucide-react";

export const siteConfig = {
  brand: {
    logo: Sparkles,
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
    ],
  },
};
