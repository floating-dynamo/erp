import { IApiService } from "@/lib/types";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "api",
});

const apiService: IApiService = {
  async getCustomers() {
    try {
      const customers = await axiosInstance.get("customers");
      return customers.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async addCustomer({ customer }) {
    try {
      await axiosInstance.post("customers", customer);
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
      const enquiries = await axiosInstance.get("enquiries");
      return enquiries.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async addEnquiry({ enquiry }) {
    try {
      await axiosInstance.post("enquiries", enquiry);
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
      const customer = await axiosInstance.get(`customers/${id}`);
      return customer.data;
    } catch (error) {
      console.error(error);
    }
  },
  async getCountries() {
    try {
      const countries = await axiosInstance.get("countries");
      return countries.data;
    } catch (error) {
      console.error(error);
    }
  },
};

export default apiService;
