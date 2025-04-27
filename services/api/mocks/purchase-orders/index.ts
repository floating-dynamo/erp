import { PurchaseOrder } from '@/features/purchase-orders/schemas';

export const PURCHASE_ORDERS_MOCK_DATA: Partial<PurchaseOrder>[] = [
  {
    id: '9a09w12192i12',
    poNumber: '91918128',
    poDate: '2025-04-14T18:30:00.000+00:00',
    buyerName: 'Sridhar Maskeri',
    totalBasicValue: 27182,
    totalValue: 28500,
    customerId: 'f7dd5f22-4b2d-47ae-a533-045be18e7ac9',
  },
  {
    id: '129asdias9129i',
    poNumber: '00912810',
    poDate: '2025-04-26T18:30:00.000+00:00',
    buyerName: 'Nagraj Maskeri',
    totalBasicValue: 1000129,
    totalValue: 1002110,
    customerId: 'fb60cb4e-c6cc-4bbf-9709-6016c7e6b6cc',
  },
];
