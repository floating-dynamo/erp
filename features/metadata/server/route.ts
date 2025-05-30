import { Hono } from 'hono';
import { MetadataModel } from '../model';
import { UOMSchema, CurrencySchema } from '../schemas';

const app = new Hono()
  // Get metadata (UOMs, Currencies, or both)
  .get('/', async (c) => {
    try {
      const type = c.req.query('type');
      const metadata = await MetadataModel.getMetadata(type as any);
      
      return c.json(metadata);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return c.json(
        { 
          success: false, 
          message: 'Error fetching metadata' 
        }, 
        500
      );
    }
  })
  
  // Upsert UOM
  .post('/uom', async (c) => {
    try {
      const body = await c.req.json();
      const parsedData = UOMSchema.parse(body);
      
      const result = await MetadataModel.upsertUOM(parsedData);
      
      return c.json(result, 201);
    } catch (error) {
      console.error('Error upserting UOM:', error);
      return c.json(
        { 
          success: false, 
          message: 'Error saving UOM' 
        }, 
        400
      );
    }
  })
  
  // Upsert Currency
  .post('/currency', async (c) => {
    try {
      const body = await c.req.json();
      const parsedData = CurrencySchema.parse(body);
      
      const result = await MetadataModel.upsertCurrency(parsedData);
      
      return c.json(result, 201);
    } catch (error) {
      console.error('Error upserting Currency:', error);
      return c.json(
        { 
          success: false, 
          message: 'Error saving currency' 
        }, 
        400
      );
    }
  });

export default app;