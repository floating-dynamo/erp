import { Enquiry } from "@/features/enquiries/schemas";
import { convertItemToReference } from '../item-mapping';

const mockEnquiries: Enquiry[] = [
  {
    id: "1e7b1d9e-1c4d-4b8e-8f1e-1e7b1d9e1c4d",
    customerId: "f7dd5f22-4b2d-47ae-a533-045be18e7ac9",
    customerName: "Tech Solutions",
    enquiryNumber: "ENQ001",
    totalItemsPrice: 1000,
    totalItemsFinalPrice: 1100,
    file: undefined,
    enquiryDate: "2023-01-01",
    quotationDueDate: "2023-01-15",
    items: [
      convertItemToReference({
        itemCode: 101,
        itemDescription: "Laptop",
        quantity: 2,
      }),
    ],
    termsAndConditions: "Terms 1",
    isQotationCreated: true,
    attachments: [],
  },
  {
    id: "2e7b1d9e-2c4d-4b8e-8f1e-2e7b1d9e2c4d",
    customerId: "f7dd5f22-4b2d-47ae-a533-045be18e7ac9",
    customerName: "Tech Solutions",
    enquiryNumber: "ENQ002",
    totalItemsPrice: 2000,
    totalItemsFinalPrice: 2200,
    file: undefined,
    enquiryDate: "2023-02-01",
    quotationDueDate: "2023-01-15",
    items: [
      convertItemToReference({
        itemCode: 102,
        itemDescription: "Mouse",
        quantity: 4,
      }),
    ],
    termsAndConditions: "Terms 2",
    isQotationCreated: false,
    attachments: [],
  },
  {
    id: "3e7b1d9e-3c4d-4b8e-8f1e-3e7b1d9e3c4d",
    customerId: "fb60cb4e-c6cc-4bbf-9709-6016c7e6b6cc",
    customerName: "Global Ventures",
    enquiryNumber: "ENQ003",
    totalItemsPrice: 1500,
    totalItemsFinalPrice: 1650,
    file: undefined,
    enquiryDate: "2023-03-01",
    quotationDueDate: "2025-02-10",
    items: [
      convertItemToReference({
        itemCode: 103,
        itemDescription: "Office Chair",
        quantity: 3,
      }),
    ],
    termsAndConditions: "Terms 3",
    isQotationCreated: false,
    attachments: [],
  },
  {
    id: "4e7b1d9e-4c4d-4b8e-8f1e-4e7b1d9e4c4d",
    customerId: "d500bca1-9d8d-4417-826f-551b5b7b3f6d",
    customerName: "Urban Essentials",
    enquiryNumber: "ENQ004",
    totalItemsPrice: 2500,
    totalItemsFinalPrice: 2750,
    file: undefined,
    enquiryDate: "2023-04-01",
    quotationDueDate: "2025-02-15",
    items: [
      convertItemToReference({
        itemCode: 104,
        itemDescription: "Steel Rods",
        quantity: 5,
      }),
    ],
    termsAndConditions: "Terms 4",
    isQotationCreated: true,
    attachments: [],
  },
  {
    id: "5e7b1d9e-5c4d-4b8e-8f1e-5e7b1d9e5c4d",
    customerId: "61925677-4e1e-42c2-a600-53b7f133a6e1",
    customerName: "Innovatech",
    enquiryNumber: "ENQ005",
    totalItemsPrice: 3000,
    totalItemsFinalPrice: 3300,
    file: undefined,
    enquiryDate: "2023-05-01",
    quotationDueDate: "2023-01-15",
    items: [
      convertItemToReference({
        itemCode: 105,
        itemDescription: "Welding Rods",
        quantity: 6,
      }),
    ],
    termsAndConditions: "Terms 5",
    isQotationCreated: false,
    attachments: [],
  },
];

export const ENQUIRIES_MOCK_DATA = mockEnquiries;
