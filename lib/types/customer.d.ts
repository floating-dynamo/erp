export interface ICustomer {
  id?: string;
  name: string;
  address?: CustomerAddress;
  contactDetails?: string;
  poc?: CustomerPOC[];
  gstNumber?: string;
  vendorId?: string;
  customerType?: string;
}

export interface CustomerAddress {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
}
export interface CustomerPOC {
  mobile?: number;
  email: string;
}

export interface GetCusomtersResponse {
  customers: Customer[];
}

export interface AddCustomerResponse {
  message: string;
  success: boolean;
}

export interface EditCustomerResponse {
  message: string;
  success: boolean;
}
