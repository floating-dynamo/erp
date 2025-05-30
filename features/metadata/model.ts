import { connectDB } from '@/lib/db';
import { MetaDataType } from '@/lib/types';
import { Currency, UOM } from './schemas';
import { CURRENCIES_MOCK_DATA, UOMS_MOCK_DATA } from './model/mock-data';

// Model for handling metadata operations
export class MetadataModel {
  // Get metadata by type (UOM, Currency, or both)
  static async getMetadata(type?: MetaDataType) {
    try {
      await connectDB();
      
      // Initialize response structure
      const response: { uoms: UOM[]; currencies: Currency[] } = {
        uoms: [],
        currencies: [],
      };

      // If type is UOM or not specified, fetch UOMs
      if (!type || type === MetaDataType.UOM) {
        // In a production environment, you would fetch from MongoDB
        // const uoms = await mongoose.connection.collection('uoms').find({ isActive: true }).toArray();
        
        // Using mock data for development
        response.uoms = UOMS_MOCK_DATA;
      }

      // If type is Currency or not specified, fetch Currencies
      if (!type || type === MetaDataType.CURRENCY) {
        // In a production environment, you would fetch from MongoDB
        // const currencies = await mongoose.connection.collection('currencies').find({ isActive: true }).toArray();
        
        // Using mock data for development
        response.currencies = CURRENCIES_MOCK_DATA;
      }

      return response;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      throw error;
    }
  }

  /**
   * Create or update UOM
   * @param uom UOM data to upsert
   * @returns Success response
   */
  static async upsertUOM(uom: UOM) {
    try {
      await connectDB();
      
      if (uom.id) {
        // Update existing UOM in mock data
        const index = UOMS_MOCK_DATA.findIndex(u => u.id === uom.id);
        if (index !== -1) {
          UOMS_MOCK_DATA[index] = { ...UOMS_MOCK_DATA[index], ...uom };
        }
        return { message: 'UOM updated successfully', success: true };
      } else {
        // Create new UOM in mock data
        const newUOM = { ...uom, id: `uom-${Date.now()}` };
        UOMS_MOCK_DATA.push(newUOM);
        return { message: 'UOM created successfully', success: true };
      }
    } catch (error) {
      console.error('Error upserting UOM:', error);
      throw error;
    }
  }

  /**
   * Create or update Currency
   * @param currency Currency data to upsert
   * @returns Success response
   */
  static async upsertCurrency(currency: Currency) {
    try {
      await connectDB();
      
      if (currency.id) {
        // Update existing Currency in mock data
        const index = CURRENCIES_MOCK_DATA.findIndex(c => c.id === currency.id);
        if (index !== -1) {
          CURRENCIES_MOCK_DATA[index] = { ...CURRENCIES_MOCK_DATA[index], ...currency };
        }
        return { message: 'Currency updated successfully', success: true };
      } else {
        // Create new Currency in mock data
        const newCurrency = { ...currency, id: `curr-${Date.now()}` };
        CURRENCIES_MOCK_DATA.push(newCurrency);
        return { message: 'Currency created successfully', success: true };
      }
    } catch (error) {
      console.error('Error upserting Currency:', error);
      throw error;
    }
  }
}