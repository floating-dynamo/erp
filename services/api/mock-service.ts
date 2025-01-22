import { IApiService } from "@/lib/types";
import { CUSTOMERS_MOCK_DATA } from "./mocks/customers";
import { Customer } from "@/features/customers/schemas";
import { Enquiry } from "@/features/enquiries/schemas";
import { ENQUIRIES_MOCK_DATA } from "./mocks/enquiries";
import axios from "axios";

const customers: Customer[] = CUSTOMERS_MOCK_DATA;
const enquiries: Enquiry[] = ENQUIRIES_MOCK_DATA;

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
  getCustomerById({ id }) {
    const customer = customers.find((customer) => customer.id === id) || null;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(customer);
      }, 1000);
    });
  },
  async getEnquiries() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          enquiries,
        });
      }, 1000);
    });
  },
  addEnquiry({ enquiry }) {
    enquiries.push(enquiry);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: "Enquiry added successfully",
          success: true,
        });
      }, 1000);
    });
  },
  async getCountries() {
    try {
      const countries = await axios.get("/api/countries");
      return countries.data;
    } catch (error) {
      console.error(error);
    }
  },
};

export default mockService;
