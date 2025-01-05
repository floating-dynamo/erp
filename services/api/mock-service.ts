import { IApiService } from "@/lib/types";
import { CUSTOMERS_MOCK_DATA } from "./mocks/customers";

const customers = CUSTOMERS_MOCK_DATA;

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
};

export default mockService;
