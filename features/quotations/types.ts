/**
 * MongoDB filter interface for Quotation queries
 */
export interface QuotationFilter {
  customerId?: string;
  enquiryNumber?: string;
  totalAmount?: {
    $gte?: number;
    $lte?: number;
  };
}