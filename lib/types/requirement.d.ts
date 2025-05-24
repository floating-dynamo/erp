import type { Enquiry } from "@/features/enquiries/schemas";

export interface EnquiryItem {
  itemCode: string;
  itemDescription: string;
}

export interface PopulatedCustomer {
  id: string;
  name: string;
}

export interface EnquiryWithPopulatedCustomer extends Omit<Enquiry, 'customerId'> {
  customer: PopulatedCustomer;
}

export interface GetEnquiriesResponse {
  enquiries: EnquiryWithPopulatedCustomer[];
}

export interface AddEnquiryResponse {
  message: string;
  success: boolean;
}

export interface EditEnquiryResponse {
  message: string;
  success: boolean;
}
