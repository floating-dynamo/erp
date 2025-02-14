"use client";
import { CreateEnquiryForm } from "@/features/enquiries/components/create-enquiry-form";
import { redirect } from "next/navigation";
import React from "react";

const CreateRequirementsPage = () => {
  return (
    <div className="w-full lg:max-w-4xl">
      <CreateEnquiryForm
        onCancel={() => {
          redirect("/enquiries");
        }}
      />
    </div>
  );
};

export default CreateRequirementsPage;
