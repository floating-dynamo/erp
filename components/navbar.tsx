import React from "react";

import { MobileSidebar } from "./sidebar/mobile-sidebar";

const Navbar = () => {
  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor all your customer data here
        </p>
      </div>
      <MobileSidebar />
    </nav>
  );
};

export default Navbar;
