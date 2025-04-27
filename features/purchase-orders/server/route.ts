import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import PurchaseOrderModel from '../model';
import uuid4 from 'uuid4';
import { createPurchaseOrderSchema } from '../schemas';

const app = new Hono()
  .get('/', async (c) => {
    try {
      await connectDB();
      const customerId = c.req.query('customerId');
      let purchaseOrders;

      if (customerId) {
        purchaseOrders = await PurchaseOrderModel.find({ customerId });
      } else {
        purchaseOrders = await PurchaseOrderModel.find();
      }

      return c.json({ purchaseOrders });
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch purchase orders' }, 500);
    }
  })
  .post('/', async (c) => {
    try {
      const body = await c.req.json();
      const parsedData = createPurchaseOrderSchema.parse(body);
      parsedData.id = uuid4();

      const purchaseOrder = new PurchaseOrderModel(parsedData);
      await purchaseOrder.save();
      return c.json(
        { message: 'Purchase Order created successfully', success: true },
        201
      );
    } catch (error) {
      console.error(error);
      return c.json(
        { message: 'Error creating Purchase Order', success: false, error },
        400
      );
    }
  });

export default app;
