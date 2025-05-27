import { PurchaseOrder } from '@/features/purchase-orders/schemas';

export interface GetPurchaseOrdersResponse {
  purchaseOrders: PurchaseOrder[];
}

export interface AddPurchaseOrderResponse {
  message: string;
  success: boolean;
}

export interface GetPurchaseOrderDetailsResponse {
  purchaseOrder: PurchaseOrder;
}
