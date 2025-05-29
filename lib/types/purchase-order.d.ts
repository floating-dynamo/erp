import { PurchaseOrder } from '@/features/purchase-orders/schemas';

export interface GetPurchaseOrdersResponse {
  purchaseOrders: PurchaseOrder[];
  total: number;
  totalPages: number;
}

export interface AddPurchaseOrderResponse {
  message: string;
  success: boolean;
}

export interface GetPurchaseOrderDetailsResponse {
  purchaseOrder: PurchaseOrder;
}
