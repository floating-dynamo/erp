import { Enquiry } from "@/features/enquiries/schemas";

const mockEnquiries: Enquiry[] = [
  {
    customerId: "CUST001",
    enquiryNumber: "ENQ001",
    totalItemsPrice: 1000,
    totalItemsFinalPrice: 1100,
    file: undefined,
    enquiryDate: "2023-01-01",
    items: [
      {
        itemCode: 101,
        itemDescription: "Item 1",
        quantity: 2,
        unitPrice: 500,
        unitTax: 50,
      },
    ],
    termsAndConditions: "Terms 1",
  },
  {
    customerId: "CUST002",
    enquiryNumber: "ENQ002",
    totalItemsPrice: 2000,
    totalItemsFinalPrice: 2200,
    file: undefined,
    enquiryDate: "2023-02-01",
    items: [
      {
        itemCode: 102,
        itemDescription: "Item 2",
        quantity: 4,
        unitPrice: 500,
        unitTax: 50,
      },
    ],
    termsAndConditions: "Terms 2",
  },
  {
    customerId: "CUST003",
    enquiryNumber: "ENQ003",
    totalItemsPrice: 1500,
    totalItemsFinalPrice: 1650,
    file: undefined,
    enquiryDate: "2023-03-01",
    items: [
      {
        itemCode: 103,
        itemDescription: "Item 3",
        quantity: 3,
        unitPrice: 500,
        unitTax: 50,
      },
    ],
    termsAndConditions: "Terms 3",
  },
  {
    customerId: "CUST004",
    enquiryNumber: "ENQ004",
    totalItemsPrice: 2500,
    totalItemsFinalPrice: 2750,
    file: undefined,
    enquiryDate: "2023-04-01",
    items: [
      {
        itemCode: 104,
        itemDescription: "Item 4",
        quantity: 5,
        unitPrice: 500,
        unitTax: 50,
      },
    ],
    termsAndConditions: "Terms 4",
  },
  {
    customerId: "CUST005",
    enquiryNumber: "ENQ005",
    totalItemsPrice: 3000,
    totalItemsFinalPrice: 3300,
    file: undefined,
    enquiryDate: "2023-05-01",
    items: [
      {
        itemCode: 105,
        itemDescription: "Item 5",
        quantity: 6,
        unitPrice: 500,
        unitTax: 50,
      },
    ],
    termsAndConditions: "Terms 5",
  },
];

export const ENQUIRIES_MOCK_DATA = mockEnquiries;
