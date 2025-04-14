'use client';
import React, { Suspense } from 'react';
import CreateQuotationForm from '@/features/quotations/components/create-quotation-form';

const CreateQuotationsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full">
        <CreateQuotationForm />
      </div>
    </Suspense>
  );
};

export default CreateQuotationsPage;
