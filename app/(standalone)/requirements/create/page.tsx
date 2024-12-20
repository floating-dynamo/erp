"use client";
import { CreateRequirementForm } from "@/features/requirements/components/create-requirement-form";
import { redirect } from "next/navigation";
import React from "react";

const CreateRequirementsPage = () => {
  return (
    <div className="w-full lg:max-w-3xl">
      <CreateRequirementForm
        onCancel={() => {
          redirect("/dashboard");
        }}
      />
    </div>
  );
};

export default CreateRequirementsPage;
