import { Hono } from 'hono';
import { MetadataModel } from '../model';

const app = new Hono()
  // Get metadata (existing endpoint)
  .get('/', async (c) => {
    try {
      const { type } = c.req.query();
      const metadata = await MetadataModel.getMetadata(type as any);
      
      return c.json({
        success: true,
        ...metadata,
      });
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
  
  // Create or update UOM
  .post('/uom', async (c) => {
    try {
      const body = await c.req.json();
      const { uom } = body;
      
      if (!uom) {
        return c.json(
          { 
            success: false, 
            message: 'UOM data is required' 
          }, 
          400
        );
      }
      
      const result = await MetadataModel.upsertUOM(uom);
      
      return c.json(result, 200);
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
  
  // Create or update Currency
  .post('/currency', async (c) => {
    try {
      const body = await c.req.json();
      const { currency } = body;
      
      if (!currency) {
        return c.json(
          { 
            success: false, 
            message: 'Currency data is required' 
          }, 
          400
        );
      }
      
      const result = await MetadataModel.upsertCurrency(currency);
      
      return c.json(result, 200);
    } catch (error) {
      console.error('Error upserting Currency:', error);
      return c.json(
        { 
          success: false, 
          message: 'Error saving Currency' 
        }, 
        400
      );
    }
  });

export default app;