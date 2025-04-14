import { SupplierDc } from '@/features/supplier-dc/schemas';

export interface GetSupplierDcsResponse {
  supplierDcs: SupplierDc[];
}

export interface AddSupplierDcResponse {
  message: string;
  success: boolean;
}
