export interface Enquiry {
  id?: string;
  cusomterId: string;
  enquiryNumber: string;
  items: EnquiryItem[];
  isArchived?: boolean;
  totalItemsPrice?: number;
  totalItemsFinalPrice?: number;
  termsAndConditions?: string;
}

export interface EnquiryItem {
  itemCode: string;
  itemDescription: string;
}
