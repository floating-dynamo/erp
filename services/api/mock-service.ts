import { IApiService } from "@/lib/types";
import { CUSTOMERS_MOCK_DATA } from "./mocks/customers";
import { Customer } from "@/features/customers/schemas";

const customers: Customer[] = CUSTOMERS_MOCK_DATA;

const mockService: IApiService = {
  async getCustomers() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          customers,
        });
      }, 1000);
    });
  },
  async addCustomer({ customer }) {
    customers.push(customer);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: "Customer added successfully",
          success: true,
        });
      }, 1000);
    });
  },
};

export default mockService;
