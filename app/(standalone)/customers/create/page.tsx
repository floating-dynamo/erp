"use client";
import React from "react";

import { CreateCustomerForm } from "@/features/customers/components/create-customer-form";
import { redirect } from "next/navigation";

const CreateCustomersPage = () => {
  return (
    <div className="w-full lg:max-w-4xl">
      <CreateCustomerForm
        onCancel={() => {
          redirect("/customers");
        }}
      />
    </div>
  );
};

export default CreateCustomersPage;
