import React, { use } from 'react';
import CreatePurchaseOrderForm from '@/features/purchase-orders/components/create-purchase-order-form';

const EditPurchaseOrderPage = ({
  params,
}: {
  params: Promise<{ purchaseOrderId: string }>;
}) => {
  const { purchaseOrderId } = use(params);

  return <CreatePurchaseOrderForm isEdit purchaseOrderId={purchaseOrderId} />;
};

export default EditPurchaseOrderPage;
