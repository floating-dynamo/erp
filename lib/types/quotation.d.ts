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
  quotation?: Quotation; // Optional quotation object with ID for file upload
}

export interface EditQuotationResponse {
  message: string;
  success: boolean;
}