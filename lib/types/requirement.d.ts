import { Enquiry } from "@/features/enquiries/schemas";

export interface EnquiryItem {
  itemCode: string;
  itemDescription: string;
}

export interface GetEnquiriesResponse {
  enquiries: Enquiry[];
}

export interface AddEnquiryResponse {
  message: string;
  success: boolean;
}
