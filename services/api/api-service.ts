import { IApiService } from "@/lib/types";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "api",
});

const apiService: IApiService = {
  // Customer Endpoints
  async getCustomers() {
    try {
      const customers = await axios.get("/api/customers");
      return customers.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async addCustomer({ customer }) {
    try {
      await axios.post("/api/customers", customer);
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
  async getCustomerById({ id }) {
    try {
      const customer = await axios.get(`/api/customers/${id}`);
      return customer.data;
    } catch (error) {
      console.error(error);
    }
  },
  // Enquiry Endpoints
  async getEnquiries() {
    try {
      const enquiries = await axiosInstance.get("/enquiries");
      return enquiries.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async addEnquiry({ enquiry }) {
    try {
      await axiosInstance.post("/enquiries", enquiry);
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
  async getEnquiryById({ id }) {
    try {
      const enquiry = await axiosInstance.get(`/enquiries/${id}`);
      return enquiry.data;
    } catch (error) {
      console.error(error);
    }
  },
  // Quotation Endpoints
  async getQuotations() {
    try {
      const quotations = await axiosInstance.get("/quotations");
      return quotations.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async addQuotation({ quotation }) {
    try {
      const { data } = await axiosInstance.post("/quotations", quotation);
      return {
        message: "Quotation added successfully",
        success: true,
        quoteNumber: data?.quoteNumber,
      };
    } catch (error) {
      console.error(error);
      return {
        message: "Something went wrong",
        success: false,
        quoteNumber: "",
      };
    }
  },
  async getQuotationById({ id }) {
    try {
      const quotation = await axiosInstance.get(`/quotations/${id}`);
      return quotation.data;
    } catch (error) {
      console.error(error);
    }
  },
  // Misc Endpoints
  async getCountries() {
    console.log("GET COUNTRIES WAS CALLED");
    try {
      const countries = await axios.get("/api/countries");
      return countries.data;
    } catch (error) {
      console.error(error);
    }
  },
};

export default apiService;
