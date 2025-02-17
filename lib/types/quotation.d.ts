import { Quotation } from "@/features/quotations/schemas";

export interface GetQuotationsResponse {
  quotations: Quotation[];
}

export interface AddQuotationResponse {
  message: string;
  success: boolean;
  quoteNumber: string;
}
