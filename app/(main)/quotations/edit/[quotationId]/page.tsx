'use client';
import React, { use } from 'react';
import CreateQuotationForm from '@/features/quotations/components/create-quotation-form';

interface EditQuotationPageProps {
  params: Promise<{ quotationId: string }>;
}

const EditQuotationPage = ({ params }: EditQuotationPageProps) => {
  const { quotationId } = use(params);

  return (
    <div>
      <CreateQuotationForm quotationId={quotationId} />
    </div>
  );
};

export default EditQuotationPage;