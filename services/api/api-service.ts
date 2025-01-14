import { IApiService } from "@/lib/types";
import axios from "axios";

const apiService: IApiService = {
  async getCustomers() {
    try {
      const customers = await axios.get("api/customers");
      return customers.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async addCustomer({ customer }) {
    try {
      await axios.post("api/customers", customer);
      return {
        message: "Customer added successfully",
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        message: "Failed to add customer",
        success: false,
      };
    }
  },
};

export default apiService;
