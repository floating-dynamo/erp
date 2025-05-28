import { Enquiry } from '@/features/enquiries/schemas';

export interface EnquiryItem {
  itemCode: string;
  itemDescription: string;
}

export interface GetEnquiriesResponse {
  enquiries: Enquiry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddEnquiryResponse {
  message: string;
  success: boolean;
}

export interface EditEnquiryResponse {
  message: string;
  success: boolean;
}
