import { PurchaseOrder } from '@/features/purchase-orders/schemas';

export interface GetPurchaseOrdersResponse {
  purchaseOrders: PurchaseOrder[];
}
