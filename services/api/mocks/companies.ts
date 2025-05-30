import { Company } from '@/features/companies/schemas';
import { MyCompany } from '@/lib/types';

export const COMPANIES_MOCK_DATA: Company[] = [
  {
    name: 'Tech Solutions',
    city: 'San Francisco',
    state: 'California',
    gstNumber: 'GST123456',
    pinCode: 94103,
    contact: 1234567890,
    email: 'info@techsolutions.com',
  },
  {
    name: 'Innovatech',
    city: 'New York',
    state: 'New York',
    gstNumber: 'GST654321',
    pinCode: 10001,
    contact: 9876543210,
    email: 'contact@innovatech.com',
  },
];

// My Companies data for settings management
export const MY_COMPANIES_MOCK_DATA: MyCompany[] = [
  {
    id: 'my-comp-001',
    name: 'Vision Tech Ltd.',
    city: 'Mumbai',
    state: 'Maharashtra',
    gstNumber: 'GST27ABCDE1234F1Z5',
    pinCode: 400001,
    contact: 9876543210,
    email: 'contact@visiontech.com',
    isActive: true,
    pan: 'ABCDE1234F',
    address: '123 Business Park, Andheri East, Mumbai',
  },
  {
    id: 'my-comp-002',
    name: 'Tech Solutions Pvt Ltd',
    city: 'Pune',
    state: 'Maharashtra',
    gstNumber: 'GST27FGHIJ5678K2L6',
    pinCode: 411001,
    contact: 8765432109,
    email: 'info@techsolutions.com',
    isActive: false,
    pan: 'FGHIJ5678K',
    address: '456 IT Park, Hinjewadi, Pune',
  },
  {
    id: 'my-comp-003',
    name: 'Digital Innovations Inc',
    city: 'Bangalore',
    state: 'Karnataka',
    gstNumber: 'GST29MNOPQ9012R3S7',
    pinCode: 560001,
    contact: 7654321098,
    email: 'hello@digitalinnovations.com',
    isActive: false,
    pan: 'MNOPQ9012R',
    address: '789 Tech Hub, Electronic City, Bangalore',
  },
];