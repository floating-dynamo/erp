import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import PurchaseOrderModel from '../model';

const app = new Hono().get('/', async (c) => {
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
});

export default app;
