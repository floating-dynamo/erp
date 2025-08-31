import WorkOrderDetails from '@/features/work-orders/components/work-order-details';

interface WorkOrderDetailsPageProps {
  params: Promise<{ workOrderId: string }>;
}

export default async function StandaloneWorkOrderDetailsPage({
  params,
}: WorkOrderDetailsPageProps) {
  const { workOrderId } = await params;
  
  return <WorkOrderDetails workOrderId={workOrderId} />;
}
