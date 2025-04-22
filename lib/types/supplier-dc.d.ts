import { SupplierDc } from '@/features/supplier-dc/schemas';

export interface GetSupplierDcsResponse {
  supplierDcs: SupplierDc[];
}

export interface AddSupplierDcResponse {
  message: string;
  success: boolean;
}

export interface EditSupplierDcResponse {
  message: string;
  success: boolean;
}
