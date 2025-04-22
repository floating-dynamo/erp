'use client';
import React, { use } from 'react';
import { CreateSupplierDcForm } from '@/features/supplier-dc/components/create-supplier-dc-form';

interface EditSupplierDcPageProps {
  params: Promise<{ supplierDcId: string }>;
}

const EditSupplierDcPage = ({ params }: EditSupplierDcPageProps) => {
  const { supplierDcId } = use(params);

  return (
    <div>
      <CreateSupplierDcForm supplierDcId={supplierDcId} />
    </div>
  );
};

export default EditSupplierDcPage;
