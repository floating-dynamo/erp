/**
 * Types for Purchase Orders feature
 */

export interface PurchaseOrderFiltersParams {
  customerId?: string;
  buyerNameFilter?: string;
  enquiryId?: string;
  deliveryDateFrom?: string;
  deliveryDateTo?: string;
  totalValueFrom?: string | number;
  totalValueTo?: string | number;
}

export interface FilterDateRange {
  $gte?: string;
  $lte?: string;
}

export interface FilterValueRange {
  $gte?: number;
  $lte?: number;
}

export interface PurchaseOrderFilterCriteria {
  customerId?: string;
  enquiryId?: string;
  buyerName?: { $regex: string; $options: string };
  deliveryDate?: FilterDateRange;
  totalValue?: FilterValueRange;
}

export interface PurchaseOrderFilterFormValues {
  buyerNameFilter: string;
  enquiryId: string;
  deliveryDateFrom: string;
  deliveryDateTo: string;
  totalValueFrom: string;
  totalValueTo: string;
}