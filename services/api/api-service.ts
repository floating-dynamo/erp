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
};

export default apiService;
