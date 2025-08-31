import { Hono } from 'hono';
import uuid4 from 'uuid4';
import { connectDB } from '@/lib/db';
import WorkOrderModel from '../model';
import { 
  createWorkOrderSchema, 
  updateWorkOrderStatusSchema,
  updateOperationSchema,
  updateResourceConsumptionSchema
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
        workOrderTypeFilter,
        statusFilter,
        priorityFilter,
        customerIdFilter,
        departmentFilter,
        workCenterFilter,
        startDateFrom,
        startDateTo,
        dueDateFrom,
        dueDateTo,
        costFrom,
        costTo,
      } = c.req.query();

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter object
      const filter: WorkOrderFilter = {};

      if (searchQuery) {
        filter.$or = [
          { workOrderName: { $regex: searchQuery, $options: 'i' } },
          { workOrderNumber: { $regex: searchQuery, $options: 'i' } },
          { productName: { $regex: searchQuery, $options: 'i' } },
          { productCode: { $regex: searchQuery, $options: 'i' } },
          { customerName: { $regex: searchQuery, $options: 'i' } },
        ];
      }

      if (workOrderTypeFilter && workOrderTypeFilter !== 'all') {
        filter.workOrderType = workOrderTypeFilter;
      }

      if (statusFilter && statusFilter !== 'all') {
        filter.status = statusFilter;
      }

      if (priorityFilter && priorityFilter !== 'all') {
        filter.priority = priorityFilter;
      }

      if (customerIdFilter && customerIdFilter !== 'all') {
        filter.customerId = customerIdFilter;
      }

      if (departmentFilter && departmentFilter !== 'all') {
        filter.department = departmentFilter;
      }

      if (workCenterFilter && workCenterFilter !== 'all') {
        filter.workCenter = workCenterFilter;
      }

      // Date filters
      if (startDateFrom || startDateTo) {
        filter.plannedStartDate = {};
        if (startDateFrom) {
          filter.plannedStartDate.$gte = startDateFrom;
        }
        if (startDateTo) {
          filter.plannedStartDate.$lte = startDateTo;
        }
      }

      if (dueDateFrom || dueDateTo) {
        filter.dueDate = {};
        if (dueDateFrom) {
          filter.dueDate.$gte = dueDateFrom;
        }
        if (dueDateTo) {
          filter.dueDate.$lte = dueDateTo;
        }
      }

      // Cost filters
      if (costFrom || costTo) {
        filter.plannedCost = {};
        if (costFrom) {
          filter.plannedCost.$gte = parseFloat(costFrom);
        }
        if (costTo) {
          filter.plannedCost.$lte = parseFloat(costTo);
        }
      }

      const [workOrders, total] = await Promise.all([
        WorkOrderModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        WorkOrderModel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return c.json({
        workOrders,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      });
    } catch (error) {
      console.error('Error fetching work orders:', error);
      return c.json({ error: 'Failed to fetch work orders' }, 500);
    }
  })
  .post('/', async (c) => {
    try {
      const body = await c.req.json();
      const parsedData = createWorkOrderSchema.parse(body);
      
      await connectDB();
      
      // Generate work order number
      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().slice(-2);
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      
      const countToday = await WorkOrderModel.countDocuments({
        createdAt: {
          $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
          $lt: new Date(currentDate.setHours(23, 59, 59, 999)),
        },
      });
      
      const sequence = (countToday + 1).toString().padStart(5, '0');
      const workOrderNumber = `WO/${year}/${month}/${day}/${sequence}`;
      
      parsedData.id = uuid4();
      parsedData.workOrderNumber = workOrderNumber;
      
      // Calculate total planned cost if not provided
      if (!parsedData.plannedCost) {
        let totalCost = 0;
        
        // Sum resource costs
        if (parsedData.resources) {
          totalCost += parsedData.resources.reduce((sum, resource) => {
            return sum + (resource.plannedQuantity * resource.standardCost);
          }, 0);
        }
        
        parsedData.plannedCost = totalCost;
      }

      const workOrder = new WorkOrderModel(parsedData);
      await workOrder.save();
      
      return c.json(
        { 
          message: 'Work Order created successfully', 
          success: true,
          workOrderNumber 
        },
        201
      );
    } catch (error) {
      console.error('Error creating work order:', error);
      return c.json(
        { message: 'Error creating Work Order', success: false, error },
        400
      );
    }
  })
  .get('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      await connectDB();
      
      const workOrder = await WorkOrderModel.findOne({ id }).lean();

      if (!workOrder) {
        return c.json({ error: 'Work Order not found' }, 404);
      }

      return c.json(workOrder);
    } catch (error) {
      console.error('Error fetching work order details:', error);
      return c.json({ error: 'Failed to fetch work order details' }, 500);
    }
  })
  .patch('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();

      await connectDB();
      
      const parsedData = createWorkOrderSchema.parse(body);
      
      // Recalculate total planned cost if resources changed
      if (parsedData.resources && parsedData.resources.length > 0) {
        const totalCost = parsedData.resources.reduce((sum, resource) => {
          return sum + (resource.plannedQuantity * resource.standardCost);
        }, 0);
        parsedData.plannedCost = totalCost;
      }
      
      const updatedWorkOrder = await WorkOrderModel.findOneAndUpdate(
        { id }, 
        { $set: parsedData },
        { new: true }
      );

      if (!updatedWorkOrder) {
        return c.json({ error: 'Work Order not found' }, 404);
      }

      return c.json(
        { message: 'Work Order updated successfully', success: true },
        200
      );
    } catch (error) {
      console.error('Error updating work order:', error);
      return c.json(
        { message: 'Error updating Work Order', success: false, error },
        400
      );
    }
  })
  .delete('/:id', async (c) => {
    try {
      const { id } = c.req.param();
      await connectDB();

      const deletedWorkOrder = await WorkOrderModel.findOneAndDelete({ id });

      if (!deletedWorkOrder) {
        return c.json({ error: 'Work Order not found' }, 404);
      }

      return c.json({ message: 'Work Order deleted successfully', success: true });
    } catch (error) {
      console.error('Error deleting work order:', error);
      return c.json({ error: 'Failed to delete work order' }, 500);
    }
  })
  .patch('/:id/status', async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json();
      
      await connectDB();
      
      const parsedData = updateWorkOrderStatusSchema.parse({ ...body, id });
      
      const updateData: Record<string, unknown> = {
        status: parsedData.status,
        updatedAt: new Date(),
      };
      
      // Set actual dates based on status
      if (parsedData.status === 'STARTED' && !body.actualStartDate) {
        updateData.actualStartDate = new Date();
      }
      
      if (parsedData.status === 'COMPLETED' && !body.actualEndDate) {
        updateData.actualEndDate = new Date();
        updateData.progressPercentage = 100;
      }
      
      if (parsedData.status === 'CANCELLED' || parsedData.status === 'CLOSED') {
        updateData.closedDate = new Date();
        if (parsedData.updatedBy) {
          updateData.closedBy = parsedData.updatedBy;
        }
      }
      
      const updatedWorkOrder = await WorkOrderModel.findOneAndUpdate(
        { id },
        { $set: updateData },
        { new: true }
      );

      if (!updatedWorkOrder) {
        return c.json({ error: 'Work Order not found' }, 404);
      }

      return c.json({
        message: `Work Order status updated to ${parsedData.status}`,
        success: true
      });
    } catch (error) {
      console.error('Error updating work order status:', error);
      return c.json(
        { message: 'Error updating Work Order status', success: false, error },
        400
      );
    }
  })
  .patch('/:id/operations/:sequence', async (c) => {
    try {
      const { id, sequence } = c.req.param();
      const body = await c.req.json();
      
      await connectDB();
      
      const parsedData = updateOperationSchema.parse({
        ...body,
        workOrderId: id,
        operationSequence: parseInt(sequence, 10)
      });
      
      const workOrder = await WorkOrderModel.findOne({ id });
      
      if (!workOrder) {
        return c.json({ error: 'Work Order not found' }, 404);
      }
      
      const operationIndex = workOrder.operations.findIndex(
        (op: { operationSequence: number }) => op.operationSequence === parsedData.operationSequence
      );
      
      if (operationIndex === -1) {
        return c.json({ error: 'Operation not found' }, 404);
      }
      
      // Update operation
      const updatePath = `operations.${operationIndex}`;
      const updateData: Record<string, unknown> = {};
      
      if (parsedData.status) updateData[`${updatePath}.status`] = parsedData.status;
      if (parsedData.actualTime !== undefined) updateData[`${updatePath}.actualTime`] = parsedData.actualTime;
      if (parsedData.operator) updateData[`${updatePath}.operator`] = parsedData.operator;
      if (parsedData.startDateTime) updateData[`${updatePath}.startDateTime`] = new Date(parsedData.startDateTime);
      if (parsedData.endDateTime) updateData[`${updatePath}.endDateTime`] = new Date(parsedData.endDateTime);
      if (parsedData.notes) updateData[`${updatePath}.notes`] = parsedData.notes;
      if (parsedData.qualityChecks) updateData[`${updatePath}.qualityChecks`] = parsedData.qualityChecks;
      
      await WorkOrderModel.updateOne({ id }, { $set: updateData });
      
      return c.json({
        message: 'Operation updated successfully',
        success: true
      });
    } catch (error) {
      console.error('Error updating operation:', error);
      return c.json(
        { message: 'Error updating operation', success: false, error },
        400
      );
    }
  })
  .patch('/:id/resources/:index', async (c) => {
    try {
      const { id, index } = c.req.param();
      const body = await c.req.json();
      
      await connectDB();
      
      const parsedData = updateResourceConsumptionSchema.parse({
        ...body,
        workOrderId: id,
        resourceIndex: parseInt(index, 10)
      });
      
      const workOrder = await WorkOrderModel.findOne({ id });
      
      if (!workOrder) {
        return c.json({ error: 'Work Order not found' }, 404);
      }
      
      if (parsedData.resourceIndex >= workOrder.resources.length) {
        return c.json({ error: 'Resource not found' }, 404);
      }
      
      // Update resource
      const updatePath = `resources.${parsedData.resourceIndex}`;
      const updateData: Record<string, unknown> = {};
      
      if (parsedData.actualQuantity !== undefined) updateData[`${updatePath}.actualQuantity`] = parsedData.actualQuantity;
      if (parsedData.actualCost !== undefined) updateData[`${updatePath}.actualCost`] = parsedData.actualCost;
      if (parsedData.status) updateData[`${updatePath}.status`] = parsedData.status;
      if (parsedData.remarks) updateData[`${updatePath}.remarks`] = parsedData.remarks;
      
      await WorkOrderModel.updateOne({ id }, { $set: updateData });
      
      return c.json({
        message: 'Resource consumption updated successfully',
        success: true
      });
    } catch (error) {
      console.error('Error updating resource consumption:', error);
      return c.json(
        { message: 'Error updating resource consumption', success: false, error },
        400
      );
    }
  })
  .get('/stats/dashboard', async (c) => {
    try {
      await connectDB();
      
      const [
        totalWorkOrders,
        plannedWorkOrders,
        inProgressWorkOrders,
        completedWorkOrders,
        overdueWorkOrders,
        costStats
      ] = await Promise.all([
        WorkOrderModel.countDocuments({}),
        WorkOrderModel.countDocuments({ status: 'PLANNED' }),
        WorkOrderModel.countDocuments({ status: { $in: ['RELEASED', 'STARTED'] } }),
        WorkOrderModel.countDocuments({ status: 'COMPLETED' }),
        WorkOrderModel.countDocuments({ 
          dueDate: { $lt: new Date() },
          status: { $nin: ['COMPLETED', 'CANCELLED', 'CLOSED'] }
        }),
        WorkOrderModel.aggregate([
          {
            $group: {
              _id: null,
              totalPlannedCost: { $sum: '$plannedCost' },
              totalActualCost: { $sum: '$actualCost' }
            }
          }
        ])
      ]);
      
      const stats = {
        totalWorkOrders,
        plannedWorkOrders,
        inProgressWorkOrders,
        completedWorkOrders,
        overdueWorkOrders,
        totalPlannedCost: costStats[0]?.totalPlannedCost || 0,
        totalActualCost: costStats[0]?.totalActualCost || 0,
        averageCompletionTime: 0, // This would require more complex calculation
        efficiencyPercentage: totalWorkOrders > 0 ? Math.round((completedWorkOrders / totalWorkOrders) * 100) : 0
      };
      
      return c.json(stats);
    } catch (error) {
      console.error('Error fetching work order stats:', error);
      return c.json({ error: 'Failed to fetch work order statistics' }, 500);
    }
  });

export default app;
