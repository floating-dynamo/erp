import { Hono } from 'hono';
import uuid4 from 'uuid4';
import { connectDB } from '@/lib/db';
import WorkOrderModel from '../model';
import { 
  createWorkOrderSchema, 
  updateWorkOrderStatusSchema,
  editWorkOrderSchema
} from '../schemas';
import { WorkOrderFilter } from '../types';

const app = new Hono()
  .get('/', async (c) => {
    try {
      await connectDB();
      
      const {
        page = 1,
        limit = 10,
        searchQuery = '',
        statusFilter,
        orderTypeFilter,
        customerId,
        startDate,
        endDate,
      } = c.req.query();

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter object
      const filter: WorkOrderFilter = {};

      if (searchQuery) {
        filter.$or = [
          { workOrderId: { $regex: searchQuery, $options: 'i' } },
          { projectName: { $regex: searchQuery, $options: 'i' } },
          { customerId: { $regex: searchQuery, $options: 'i' } },
          { customerName: { $regex: searchQuery, $options: 'i' } },
        ];
      }

      if (statusFilter) {
        filter.status = statusFilter;
      }

      if (orderTypeFilter) {
        filter.orderType = orderTypeFilter;
      }

      if (customerId) {
        filter.customerId = customerId;
      }

      if (startDate || endDate) {
        filter.targetDate = {};
        if (startDate) filter.targetDate.$gte = startDate;
        if (endDate) filter.targetDate.$lte = endDate;
      }

      const workOrders = await WorkOrderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await WorkOrderModel.countDocuments(filter);
      const totalPages = Math.ceil(total / limitNum);

      return c.json({
        workOrders,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      });
    } catch (error: any) {
      console.error('Error fetching work orders:', error);
      return c.json({ error: 'Failed to fetch work orders' }, 500);
    }
  })

  .post('/', async (c) => {
    try {
      await connectDB();
      
      const body = await c.req.json();
      const validatedData = createWorkOrderSchema.parse(body);

      const workOrderData = {
        ...validatedData,
        id: uuid4(),
        createdBy: validatedData.createdBy || 'system',
      };

      const workOrder = new WorkOrderModel(workOrderData);
      await workOrder.save();

      return c.json({
        success: true,
        message: 'Work order created successfully',
        workOrderId: workOrder.workOrderId,
        id: workOrder.id,
      }, 201);
    } catch (error: any) {
      console.error('Error creating work order:', error);
      if (error.name === 'ZodError') {
        return c.json({ 
          error: 'Validation failed', 
          details: error.errors 
        }, 400);
      }
      return c.json({ error: 'Failed to create work order' }, 500);
    }
  })

  .get('/:id', async (c) => {
    try {
      await connectDB();
      
      const { id } = c.req.param();
      
      const workOrder = await WorkOrderModel.findOne({ id }).lean();
      
      if (!workOrder) {
        return c.json({ error: 'Work order not found' }, 404);
      }

      return c.json(workOrder);
    } catch (error: any) {
      console.error('Error fetching work order:', error);
      return c.json({ error: 'Failed to fetch work order' }, 500);
    }
  })

  .put('/:id', async (c) => {
    try {
      await connectDB();
      
      const { id } = c.req.param();
      const body = await c.req.json();
      
      const validatedData = editWorkOrderSchema.parse(body);

      const workOrder = await WorkOrderModel.findOneAndUpdate(
        { id },
        { 
          ...validatedData,
          updatedBy: validatedData.updatedBy || 'system',
        },
        { new: true, runValidators: true }
      );

      if (!workOrder) {
        return c.json({ error: 'Work order not found' }, 404);
      }

      return c.json({
        success: true,
        message: 'Work order updated successfully',
        workOrder,
      });
    } catch (error: any) {
      console.error('Error updating work order:', error);
      if (error.name === 'ZodError') {
        return c.json({ 
          error: 'Validation failed', 
          details: error.errors 
        }, 400);
      }
      return c.json({ error: 'Failed to update work order' }, 500);
    }
  })

  .delete('/:id', async (c) => {
    try {
      await connectDB();
      
      const { id } = c.req.param();
      
      const workOrder = await WorkOrderModel.findOneAndDelete({ id });
      
      if (!workOrder) {
        return c.json({ error: 'Work order not found' }, 404);
      }

      return c.json({
        success: true,
        message: 'Work order deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting work order:', error);
      return c.json({ error: 'Failed to delete work order' }, 500);
    }
  })

  .patch('/:id/status', async (c) => {
    try {
      await connectDB();
      
      const { id } = c.req.param();
      const body = await c.req.json();
      
      const validatedData = updateWorkOrderStatusSchema.parse({
        id,
        ...body,
      });

      const workOrder = await WorkOrderModel.findOneAndUpdate(
        { id },
        { 
          status: validatedData.status,
          updatedBy: validatedData.updatedBy || 'system',
        },
        { new: true }
      );

      if (!workOrder) {
        return c.json({ error: 'Work order not found' }, 404);
      }

      return c.json({
        success: true,
        message: 'Work order status updated successfully',
        workOrder,
      });
    } catch (error: any) {
      console.error('Error updating work order status:', error);
      if (error.name === 'ZodError') {
        return c.json({ 
          error: 'Validation failed', 
          details: error.errors 
        }, 400);
      }
      return c.json({ error: 'Failed to update work order status' }, 500);
    }
  })

  .get('/stats/overview', async (c) => {
    try {
      await connectDB();
      
      const totalWorkOrders = await WorkOrderModel.countDocuments();
      const openWorkOrders = await WorkOrderModel.countDocuments({ status: 'Open' });
      const closedWorkOrders = await WorkOrderModel.countDocuments({ status: 'Closed' });
      const onHoldWorkOrders = await WorkOrderModel.countDocuments({ status: 'On Hold' });
      const shortClosedWorkOrders = await WorkOrderModel.countDocuments({ status: 'Short Closed' });

      // Calculate average progress
      const progressAgg = await WorkOrderModel.aggregate([
        {
          $group: {
            _id: null,
            averageProgress: { $avg: "$progress" },
            totalPlannedQty: { $sum: "$totalPlannedQty" },
            totalCompletedQty: { $sum: "$completedQty" }
          }
        }
      ]);

      const stats = progressAgg[0] || {
        averageProgress: 0,
        totalPlannedQty: 0,
        totalCompletedQty: 0
      };

      return c.json({
        totalWorkOrders,
        openWorkOrders,
        closedWorkOrders,
        onHoldWorkOrders,
        shortClosedWorkOrders,
        averageProgress: Math.round(stats.averageProgress || 0),
        totalPlannedQty: stats.totalPlannedQty || 0,
        totalCompletedQty: stats.totalCompletedQty || 0,
        pendingWorkOrders: openWorkOrders + onHoldWorkOrders,
      });
    } catch (error: any) {
      console.error('Error fetching work order stats:', error);
      return c.json({ error: 'Failed to fetch work order statistics' }, 500);
    }
  });

export default app;
