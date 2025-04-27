'use client';
import React from 'react';
import { Suspense } from 'react';
import CreatePurchaseOrderForm from '@/features/purchase-orders/components/create-purchase-order-form';

const CreatePurchaseOrderPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full lg:max-w-4xl">
        <CreatePurchaseOrderForm />
      </div>
    </Suspense>
  );
};

export default CreatePurchaseOrderPage;
