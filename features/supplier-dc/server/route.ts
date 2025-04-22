import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import SuppplierDcModel from '../model';
import { supplierDcSchema } from '../schemas';
import uuid4 from 'uuid4';

const app = new Hono()
  .get('/', async (c) => {
    try {
      await connectDB();
      const supplierDcs = await SuppplierDcModel.find().sort({ dcNo: -1 });
      return c.json({ supplierDcs });
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch supplierDcs' }, 500);
    }
  })
  .post('/', async (c) => {
    try {
      const body = await c.req.json();

      // Generate the dcNo explicitly
      const lastDc = await SuppplierDcModel.findOne().sort({ dcNo: -1 });
      const lastDcNumber = lastDc ? parseInt(lastDc.dcNo, 10) : 0;
      const newDcNumber = (lastDcNumber + 1).toString().padStart(4, '0');
      body.dcNo = newDcNumber;

      const parsedData = supplierDcSchema.parse(body);
      parsedData.id = uuid4();

      const newSupplierDc = new SuppplierDcModel(parsedData);
      await newSupplierDc.save();

      return c.json(
        { message: 'Supplier DC created successfully', success: true },
        201
      );
    } catch (error) {
      console.error(error);
      return c.json(
        { message: 'Error creating supplier DC', success: false, error },
        400
      );
    }
  })
  .get('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      await connectDB();
      const supplierDc = await SuppplierDcModel.findOne({ id });
      if (!supplierDc) {
        return c.json({ error: 'Supplier DC not found' }, 404);
      }
      return c.json(supplierDc);
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch supplier DC' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();

      const parsedData = supplierDcSchema.parse(body);
      await SuppplierDcModel.updateOne({ id }, { $set: parsedData });
      return c.json(
        { message: 'Supplier DC updated successfully', success: true },
        200
      );
    } catch (error) {
      console.error(error);
      return c.json(
        { message: 'Error updating supplier DC', success: false, error },
        400
      );
    }
  });

export default app;
