import CreateWorkOrderForm from '@/features/work-orders/components/create-work-order-form';

interface EditWorkOrderPageProps {
  params: Promise<{ workOrderId: string }>;
}

export default async function EditWorkOrderPage({
  params,
}: EditWorkOrderPageProps) {
  const { workOrderId } = await params;
  
  return <CreateWorkOrderForm isEdit={true} workOrderId={workOrderId} />;
}
