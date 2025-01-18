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
        message: "Something went wrong",
        success: false,
      };
    }
  },
  async getEnquiries() {
    try {
      const enquiries = await axios.get("api/enquiries");
      return enquiries.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async addEnquiry({ enquiry }) {
    try {
      await axios.post("api/enquiries", enquiry);
      return {
        message: "Enquiry added successfully",
        success: true,
      };
    } catch (error) {
      console.error(error);
      return {
        message: "Something went wrong",
        success: false,
      };
    }
  },
  async getCustomerById({ id }) {
    try {
      const customer = await axios.get(`api/customers/${id}`);
      return customer.data;
    } catch (error) {
      console.error(error);
    }
  },
};

export default apiService;
