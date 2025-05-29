import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import EnquiryModel from '../model';
import { createEnquirySchema } from '../schemas';
import uuid4 from 'uuid4';

const app = new Hono()
  .get('/', async (c) => {
    try {
      await connectDB();
      const customerId = c.req.query('customerId');
      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');
      const searchQuery = c.req.query('searchQuery') || '';

      let query = {};
      if (customerId) {
        query = { customerId };
      }

      const skip = (page - 1) * limit;

      // If there's a search query, we'll need to handle it differently
      // For now, let's implement basic server-side filtering
      let enquiries;
      let total;

      if (searchQuery) {
        // For search, return all matching records for client-side pagination
        const searchRegex = new RegExp(searchQuery, 'i');
        const searchFilter = {
          ...query,
          $or: [
            { customerName: searchRegex },
            { enquiryNumber: searchRegex },
            { customerId: searchRegex },
          ],
        };
        enquiries = await EnquiryModel.find(searchFilter);
        total = enquiries.length;
      } else {
        // For normal pagination, use server-side pagination
        enquiries = await EnquiryModel.find(query).skip(skip).limit(limit);
        total = await EnquiryModel.countDocuments(query);
      }

      const totalPages = Math.ceil(total / limit);

      return c.json({
        enquiries,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch enquiries' }, 500);
    }
  })
  .post('/', async (c) => {
    try {
      const body = await c.req.json();

      const parsedData = createEnquirySchema.parse(body);
      parsedData.id = uuid4();

      const newEnquiry = new EnquiryModel(parsedData);
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
      return c.json(
        {
          success: false,
          message: 'Error adding enquiry',
        },
        400
      );
    }
  })
  .get('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const enquiry = ((await EnquiryModel.find({ id })) || [])[0];
      if (!enquiry) {
        return c.json({ error: 'Enquiry not found' }, 404);
      }
      return c.json(enquiry);
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to fetch enquiry' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();

      const parsedData = createEnquirySchema.parse(body);

      const enquiry = ((await EnquiryModel.find({ id })) || [])[0];
      if (!enquiry) {
        return c.json({ error: 'Enquiry not found' }, 404);
      }
      await EnquiryModel.updateOne({ id }, { $set: parsedData });
      return c.json({ success: true, message: 'Enquiry updated successfully' });
    } catch (error) {
      console.log(error);
      return c.json({ error: 'Failed to update enquiry' }, 500);
    }
  });
export default app;
