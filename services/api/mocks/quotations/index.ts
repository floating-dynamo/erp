import { Quotation } from '@/features/quotations/schemas'; // Assuming the mock data is in mockData.ts
import { CUSTOMERS_MOCK_DATA } from '../customers';
import { ENQUIRIES_MOCK_DATA } from '../enquiries';

const QUOTATIONS_MOCK_DATA: Quotation[] = [
  {
    id: '1',
    customerName:
      CUSTOMERS_MOCK_DATA.find(
        (customer) => customer.id === ENQUIRIES_MOCK_DATA[0].customerId
      )?.name || 'Unknown',
    customerId: ENQUIRIES_MOCK_DATA[0].customerId,
    enquiryNumber: ENQUIRIES_MOCK_DATA[0].enquiryNumber,
    quotationDate: '2025-02-09',
    quoteNumber: 'QUO/25/02/09/00001',
    items: [
      {
        itemCode: 9019201,
        itemDescription: 'Laptop',
        materialConsideration: 'High-end laptop with extra RAM',
        quantity: 2,
        uom: 'Piece',
        rate: 50000,
        currency: 'INR',
        amount: 100000,
        remarks: 'Fast delivery requested',
      },
      {
        itemCode: 912901,
        itemDescription: 'Mouse',
        quantity: 2,
        uom: 'Piece',
        rate: 1000,
        currency: 'INR',
        amount: 2000,
        remarks: 'Wireless mouse',
      },
    ],
    totalAmount: 102000,
    termsAndConditions: ENQUIRIES_MOCK_DATA[0].termsAndConditions,
    myCompanyGSTIN: '123456789012345',
    myCompanyPAN: 'ABCDE1234F',
    myCompanyName: 'Tech Solutions Pvt Ltd',
  },
  {
    id: '2',
    customerName:
      CUSTOMERS_MOCK_DATA.find(
        (customer) => customer.id === ENQUIRIES_MOCK_DATA[1].customerId
      )?.name || 'Unknown',
    customerId: ENQUIRIES_MOCK_DATA[1].customerId,
    enquiryNumber: ENQUIRIES_MOCK_DATA[1].enquiryNumber,
    quotationDate: '2025-02-10',
    quoteNumber: 'QUO/25/02/10/00002',
    items: [
      {
        itemCode: 912921,
        itemDescription: 'Office Chair',
        quantity: 5,
        uom: 'Piece',
        rate: 3000,
        currency: 'INR',
        amount: 15000,
        remarks: 'Ergonomic design',
      },
      {
        itemCode: 326722,
        itemDescription: 'Desk',
        quantity: 3,
        uom: 'Piece',
        rate: 8000,
        currency: 'INR',
        amount: 24000,
        remarks: 'Wooden desk with storage',
      },
    ],
    totalAmount: 39000,
    termsAndConditions: ENQUIRIES_MOCK_DATA[1].termsAndConditions,
    myCompanyGSTIN: '987654321098765',
    myCompanyPAN: 'XYZDC4321G',
    myCompanyName: 'Office Equipments Ltd.',
  },
  {
    id: '3',
    customerName:
      CUSTOMERS_MOCK_DATA.find(
        (customer) => customer.id === ENQUIRIES_MOCK_DATA[2].customerId
      )?.name || 'Unknown',
    customerId: ENQUIRIES_MOCK_DATA[2].customerId,
    enquiryNumber: ENQUIRIES_MOCK_DATA[2].enquiryNumber,
    quotationDate: '2025-02-11',
    quoteNumber: 'QUO/25/02/11/00003',
    items: [
      {
        itemCode: 2749305,
        itemDescription: 'Projector',
        materialConsideration: 'Full HD projector with remote',
        quantity: 1,
        uom: 'Piece',
        rate: 25000,
        currency: 'INR',
        amount: 25000,
        remarks: 'Includes installation',
      },
    ],
    totalAmount: 25000,
    termsAndConditions: ENQUIRIES_MOCK_DATA[2].termsAndConditions,
    myCompanyGSTIN: '654321098765432',
    myCompanyPAN: 'EFGHI5678J',
    myCompanyName: 'Vision Tech Ltd.',
  },
];

export default QUOTATIONS_MOCK_DATA;
