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

  // Create or update UOM
  static async upsertUOM(uom: UOM) {
    try {
      await connectDB();
      
      if (uom.id) {
        // In a production environment, you would update in MongoDB
        // await mongoose.connection.collection('uoms').updateOne(
        //   { _id: uom.id },
        //   { $set: uom }
        // );
        
        // For now, just return success
        return { message: 'UOM updated successfully', success: true };
      } else {
        // In a production environment, you would insert into MongoDB
        // await mongoose.connection.collection('uoms').insertOne(uom);
        
        // For now, just return success
        return { message: 'UOM created successfully', success: true };
      }
    } catch (error) {
      console.error('Error upserting UOM:', error);
      throw error;
    }
  }

  // Create or update Currency
  static async upsertCurrency(currency: Currency) {
    try {
      await connectDB();
      
      if (currency.id) {
        // In a production environment, you would update in MongoDB
        // await mongoose.connection.collection('currencies').updateOne(
        //   { _id: currency.id },
        //   { $set: currency }
        // );
        
        // For now, just return success
        return { message: 'Currency updated successfully', success: true };
      } else {
        // In a production environment, you would insert into MongoDB
        // await mongoose.connection.collection('currencies').insertOne(currency);
        
        // For now, just return success
        return { message: 'Currency created successfully', success: true };
      }
    } catch (error) {
      console.error('Error upserting Currency:', error);
      throw error;
    }
  }
}