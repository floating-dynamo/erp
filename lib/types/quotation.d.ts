import { Quotation } from "@/features/quotations/schemas";

export interface GetQuotationsResponse {
  quotations: Quotation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddQuotationResponse {
  message: string;
  success: boolean;
  quoteNumber: string;
}

export interface EditQuotationResponse {
  message: string;
  success: boolean;
}