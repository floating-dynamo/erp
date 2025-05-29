import { Currency, UOM } from '../schemas';

// Mock data for Units of Measurement (UOMs)
export const UOMS_MOCK_DATA: UOM[] = [
  {
    id: 'uom-001',
    code: 'PCS',
    name: 'Pieces',
    description: 'Individual units or pieces',
    isActive: true,
  },
  {
    id: 'uom-002',
    code: 'KG',
    name: 'Kilogram',
    description: 'Weight measurement in kilograms',
    isActive: true,
  },
  {
    id: 'uom-003',
    code: 'MTR',
    name: 'Meter',
    description: 'Length measurement in meters',
    isActive: true,
  },
  {
    id: 'uom-004',
    code: 'L',
    name: 'Liter',
    description: 'Volume measurement in liters',
    isActive: true,
  },
  {
    id: 'uom-005',
    code: 'BOX',
    name: 'Box',
    description: 'Standard packaging box',
    isActive: true,
  },
  {
    id: 'uom-006',
    code: 'SQM',
    name: 'Square Meter',
    description: 'Area measurement in square meters',
    isActive: true,
  },
];

// Mock data for Currencies
export const CURRENCIES_MOCK_DATA: Currency[] = [
  {
    id: 'curr-001',
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    exchangeRate: 1,
    isActive: true,
  },
  {
    id: 'curr-002',
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    exchangeRate: 0.012,
    isActive: true,
  },
  {
    id: 'curr-003',
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    exchangeRate: 0.011,
    isActive: true,
  },
  {
    id: 'curr-004',
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    exchangeRate: 0.0095,
    isActive: true,
  },
  {
    id: 'curr-005',
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    exchangeRate: 0.044,
    isActive: true,
  },
];