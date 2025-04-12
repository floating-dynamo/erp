import React from "react";
import { EditQuotationForm } from "@/features/quotations/components/edit-quotation-form";

interface EditQuotationPageProps {
  params: { quotationId: string };
}

const EditQuotationPage: React.FC<EditQuotationPageProps> = ({ params }) => {
  const { quotationId } = params;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Quotation</h1>
      <EditQuotationForm quotationId={quotationId} />
    </div>
  );
};

export default EditQuotationPage;