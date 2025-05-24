import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import EnquiryModel from '../model';
import CustomerModel from '@/features/customers/model';
import { createEnquirySchema } from '../schemas';
import uuid4 from 'uuid4';

const app = new Hono()
  .get('/', async (c) => {
    try {
      await connectDB();
      const { customerId } = c.req.query();
      const query = customerId ? { customerId } : {};

      const enquiries = await EnquiryModel.find(query);
      const customerIds = enquiries.map((enquiry) => enquiry.customerId);
      const customers = await CustomerModel.find({ id: { $in: customerIds } });

      // Transform the data to include customer details
      const transformedEnquiries = enquiries.map((enquiry) => {
        const { customerId, ...doc } = enquiry.toObject();
        const customer = customers.find((c) => c.id === customerId);

        return {
          ...doc,
          enquiryDate: doc.enquiryDate.toISOString(),
          quotationDueDate: doc.quotationDueDate.toISOString(),
          customer: {
            id: customer?.id || customerId,
            name: customer?.name || 'Unknown Customer',
          },
        };
      });

      return c.json({ enquiries: transformedEnquiries });
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch enquiries' }, 500);
    }
  })
  .get('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const enquiry = await EnquiryModel.findOne({ id });

      if (!enquiry) {
        return c.json({ error: 'Enquiry not found' }, 404);
      }

      // Fetch customer data
      const customer = await CustomerModel.findOne({ id: enquiry.customerId });

      // Transform the data
      const doc = enquiry.toObject();
      const transformedEnquiry = {
        ...doc,
        enquiryDate: doc.enquiryDate.toISOString(),
        quotationDueDate: doc.quotationDueDate.toISOString(),
        customer: {
          id: customer?.id || doc.customerId,
          name: customer?.name || 'Unknown Customer',
        },
      };

      return c.json(transformedEnquiry);
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch enquiry' }, 500);
    }
  })
  .post('/', async (c) => {
    try {
      const body = await c.req.json();
      const parsedData = createEnquirySchema.parse(body);

      // Verify customer exists
      const customer = await CustomerModel.findOne({
        id: parsedData.customerId,
      });
      if (!customer) {
        return c.json({ error: 'Customer not found' }, 404);
      }

      const newEnquiry = new EnquiryModel({
        ...parsedData,
        id: uuid4(),
        customer: {
          id: customer.id,
          name: customer.name,
        },
      });
      await newEnquiry.save();

      return c.json(
        {
          success: true,
          message: 'Enquiry added successfully',
        },
        201
      );
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to add enquiry' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();
      const parsedData = createEnquirySchema.parse(body);

      // Verify customer exists if customer is being updated
      if (parsedData.customerId) {
        const customer = await CustomerModel.findOne({
          id: parsedData.customerId,
        });
        if (!customer) {
          return c.json({ error: 'Customer not found' }, 404);
        }
      }

      const updatedEnquiry = await EnquiryModel.findOneAndUpdate(
        { id },
        parsedData,
        { new: true }
      );

      if (!updatedEnquiry) {
        return c.json({ error: 'Enquiry not found' }, 404);
      }

      return c.json({
        success: true,
        message: 'Enquiry updated successfully',
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to update enquiry' }, 500);
    }
  });

export default app;
