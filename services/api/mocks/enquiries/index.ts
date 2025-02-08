import { Enquiry } from "@/features/enquiries/schemas";

const mockEnquiries: Enquiry[] = [
  {
    id: "1e7b1d9e-1c4d-4b8e-8f1e-1e7b1d9e1c4d",
    customerId: "CUST001",
    customerName: "Acme Corporation",
    enquiryNumber: "ENQ001",
    totalItemsPrice: 1000,
    totalItemsFinalPrice: 1100,
    file: undefined,
    enquiryDate: "2023-01-01",
    quotationDueDate: "2023-01-15",
    items: [
      {
        itemCode: 101,
        itemDescription: "Item 1",
        quantity: 2,
      },
    ],
    termsAndConditions: "Terms 1",
    isQotationCreated: true,
  },
  {
    id: "2e7b1d9e-2c4d-4b8e-8f1e-2e7b1d9e2c4d",
    customerId: "CUST002",
    customerName: "Globex Inc.",
    enquiryNumber: "ENQ002",
    totalItemsPrice: 2000,
    totalItemsFinalPrice: 2200,
    file: undefined,
    enquiryDate: "2023-02-01",
    quotationDueDate: "2023-01-15",
    items: [
      {
        itemCode: 102,
        itemDescription: "Item 2",
        quantity: 4,
      },
    ],
    termsAndConditions: "Terms 2",
  },
  {
    id: "3e7b1d9e-3c4d-4b8e-8f1e-3e7b1d9e3c4d",
    customerId: "CUST003",
    customerName: "Initech",
    enquiryNumber: "ENQ003",
    totalItemsPrice: 1500,
    totalItemsFinalPrice: 1650,
    file: undefined,
    enquiryDate: "2023-03-01",
    quotationDueDate: "2025-02-10",
    items: [
      {
        itemCode: 103,
        itemDescription: "Item 3",
        quantity: 3,
      },
    ],
    termsAndConditions: "Terms 3",
  },
  {
    id: "4e7b1d9e-4c4d-4b8e-8f1e-4e7b1d9e4c4d",
    customerId: "CUST004",
    customerName: "Umbrella Corporation",
    enquiryNumber: "ENQ004",
    totalItemsPrice: 2500,
    totalItemsFinalPrice: 2750,
    file: undefined,
    enquiryDate: "2023-04-01",
    quotationDueDate: "2025-02-15",
    items: [
      {
        itemCode: 104,
        itemDescription: "Item 4",
        quantity: 5,
      },
    ],
    termsAndConditions: "Terms 4",
    isQotationCreated: true,
  },
  {
    id: "5e7b1d9e-5c4d-4b8e-8f1e-5e7b1d9e5c4d",
    customerId: "CUST005",
    customerName: "Hooli",
    enquiryNumber: "ENQ005",
    totalItemsPrice: 3000,
    totalItemsFinalPrice: 3300,
    file: undefined,
    enquiryDate: "2023-05-01",
    quotationDueDate: "2023-01-15",
    items: [
      {
        itemCode: 105,
        itemDescription: "Item 5",
        quantity: 6,
      },
    ],
    termsAndConditions: "Terms 5",
  },
];

export const ENQUIRIES_MOCK_DATA = mockEnquiries;
