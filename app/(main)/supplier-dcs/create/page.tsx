import { CreateSupplierDcForm } from '@/features/supplier-dc/components/create-supplier-dc-form';
import React, { Suspense } from 'react';

const CreateSupplierDcPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full lg:max-w-4xl">
        <CreateSupplierDcForm />
      </div>
    </Suspense>
  );
};

export default CreateSupplierDcPage;
