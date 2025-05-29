import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import PurchaseOrderModel from '../model';
import uuid4 from 'uuid4';
import { createPurchaseOrderSchema } from '../schemas';
import { PurchaseOrderFilterCriteria } from '../types';

const app = new Hono()
  .get('/', async (c) => {
    try {
      await connectDB();
      const customerId = c.req.query('customerId');
      const buyerNameFilter = c.req.query('buyerNameFilter');
      const enquiryId = c.req.query('enquiryId');
      const deliveryDateFrom = c.req.query('deliveryDateFrom');
      const deliveryDateTo = c.req.query('deliveryDateTo');
      const totalValueFrom = c.req.query('totalValueFrom');
      const totalValueTo = c.req.query('totalValueTo');

      // Build filter criteria
      const filter: PurchaseOrderFilterCriteria = {};

      if (customerId) {
        filter.customerId = customerId;
      }

      if (enquiryId) {
        filter.enquiryId = enquiryId;
      }

      if (buyerNameFilter) {
        filter.buyerName = { $regex: buyerNameFilter, $options: 'i' };
      }

      // Date range filtering
      if (deliveryDateFrom || deliveryDateTo) {
        filter.deliveryDate = {};
        if (deliveryDateFrom) {
          filter.deliveryDate.$gte = deliveryDateFrom;
        }
        if (deliveryDateTo) {
          filter.deliveryDate.$lte = deliveryDateTo;
        }
      }

      // Total value range filtering
      if (totalValueFrom || totalValueTo) {
        filter.totalValue = {};
        if (totalValueFrom) {
          filter.totalValue.$gte = Number(totalValueFrom);
        }
        if (totalValueTo) {
          filter.totalValue.$lte = Number(totalValueTo);
        }
      }

      const purchaseOrders = await PurchaseOrderModel.find(filter);
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
  })
  .get('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      await connectDB();
      const purchaseOrder = ((await PurchaseOrderModel.find({ id })) || [])[0];

      if (!purchaseOrder) {
        return c.json({ error: 'Purchase Order not found' }, 404);
      }

      return c.json(purchaseOrder);
    } catch (error) {
      console.error('Error fetching purchase order details:', error);
      return c.json({ error: 'Failed to fetch purchase order details' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();

      const parsedData = createPurchaseOrderSchema.parse(body);
      await PurchaseOrderModel.updateOne({ id }, { $set: parsedData });

      return c.json(
        { message: 'Purchase Order updated successfully', success: true },
        200
      );
    } catch (error) {
      console.error('Error updating purchase order:', error);
      return c.json(
        { message: 'Error updating Purchase Order', success: false, error },
        400
      );
    }
  });

export default app;
