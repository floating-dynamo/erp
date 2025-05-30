import { UOMS_MOCK_DATA, CURRENCIES_MOCK_DATA } from './mock-data';
import { MetaDataType } from '@/lib/types';
import { UOM, Currency } from '../schemas';

export class MetadataModel {
  /**
   * Get metadata based on type filter
   * @param type Optional filter for specific metadata type
   * @returns Object containing filtered metadata
   */
  static async getMetadata(type?: MetaDataType) {
    const response = {
      currencies: [] as typeof CURRENCIES_MOCK_DATA,
      uoms: [] as typeof UOMS_MOCK_DATA,
    };

    // If type is UOM or not specified, return UOMs
    if (!type || type === MetaDataType.UOM) {
      response.uoms = UOMS_MOCK_DATA;
    }

    // If type is CURRENCY or not specified, return Currencies
    if (!type || type === MetaDataType.CURRENCY) {
      response.currencies = CURRENCIES_MOCK_DATA;
    }

    return response;
  }

  /**
   * Create or update UOM
   * @param uom UOM data to upsert
   * @returns Success response
   */
  static async upsertUOM(uom: UOM) {
    if (uom.id) {
      // Update existing UOM
      const index = UOMS_MOCK_DATA.findIndex(u => u.id === uom.id);
      if (index !== -1) {
        UOMS_MOCK_DATA[index] = { ...UOMS_MOCK_DATA[index], ...uom };
      }
      return { success: true, message: 'UOM updated successfully' };
    } else {
      // Create new UOM
      const newUOM = { ...uom, id: `uom-${Date.now()}` };
      UOMS_MOCK_DATA.push(newUOM);
      return { success: true, message: 'UOM created successfully' };
    }
  }

  /**
   * Create or update Currency
   * @param currency Currency data to upsert
   * @returns Success response
   */
  static async upsertCurrency(currency: Currency) {
    if (currency.id) {
      // Update existing Currency
      const index = CURRENCIES_MOCK_DATA.findIndex(c => c.id === currency.id);
      if (index !== -1) {
        CURRENCIES_MOCK_DATA[index] = { ...CURRENCIES_MOCK_DATA[index], ...currency };
      }
      return { success: true, message: 'Currency updated successfully' };
    } else {
      // Create new Currency
      const newCurrency = { ...currency, id: `curr-${Date.now()}` };
      CURRENCIES_MOCK_DATA.push(newCurrency);
      return { success: true, message: 'Currency created successfully' };
    }
  }
}