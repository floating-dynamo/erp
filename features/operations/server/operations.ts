import { z } from 'zod';
import OperationModel from '../model';
import { createOperationSchema, updateOperationSchema } from '../schemas';
import { AddOperationResponse, UpdateOperationResponse, DeleteOperationResponse } from '../types';

/**
 * Create a new operation
 */
export async function createOperation(
  data: z.infer<typeof createOperationSchema>
): Promise<AddOperationResponse> {
  try {
    // Validate input data
    const validatedData = createOperationSchema.parse(data);
    
    // Create the operation
    const operation = new OperationModel(validatedData);
    await operation.save();
    
    return {
      success: true,
      message: 'Operation created successfully',
      operationId: operation._id?.toString(),
    };
  } catch (error) {
    console.error('Error creating operation:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation error: ' + error.errors.map(e => e.message).join(', '),
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create operation',
    };
  }
}

/**
 * Get all operations with pagination and filtering
 */
export async function getOperations(
  page: number = 1,
  limit: number = 20,
  searchTerm?: string,
  processFilter?: string,
  workCenterFilter?: string
) {
  try {
    const skip = (page - 1) * limit;
    
    // Build filter object
    type FilterType = {
      isActive: boolean;
      $or?: Array<{
        process?: { $regex: string; $options: string };
        workCenter?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
      }>;
      process?: string;
      workCenter?: string;
    };
    const filter: FilterType = { isActive: true };
    
    if (searchTerm) {
      filter.$or = [
        { process: { $regex: searchTerm, $options: 'i' } },
        { workCenter: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }
    
    if (processFilter) {
      filter.process = processFilter;
    }
    
    if (workCenterFilter) {
      filter.workCenter = workCenterFilter;
    }
    
    // Execute queries in parallel
    const [operations, totalCount] = await Promise.all([
      OperationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      OperationModel.countDocuments(filter)
    ]);
    
    return {
      operations,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    console.error('Error fetching operations:', error);
    throw new Error('Failed to fetch operations');
  }
}

/**
 * Get operation by ID
 */
export async function getOperationById(id: string) {
  try {
    const operation = await OperationModel.findById(id).lean();
    
    if (!operation) {
      return {
        success: false,
        message: 'Operation not found',
      };
    }
    
    return {
      success: true,
      operation,
    };
  } catch (error) {
    console.error('Error fetching operation:', error);
    return {
      success: false,
      message: 'Failed to fetch operation',
    };
  }
}

/**
 * Update operation
 */
export async function updateOperation(
  id: string,
  data: z.infer<typeof updateOperationSchema>
): Promise<UpdateOperationResponse> {
  try {
    // Validate input data
    const validatedData = updateOperationSchema.parse(data);
    
    // Update the operation
    const operation = await OperationModel.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );
    
    if (!operation) {
      return {
        success: false,
        message: 'Operation not found',
      };
    }
    
    return {
      success: true,
      message: 'Operation updated successfully',
      operationId: operation._id?.toString(),
    };
  } catch (error) {
    console.error('Error updating operation:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation error: ' + error.errors.map(e => e.message).join(', '),
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update operation',
    };
  }
}

/**
 * Delete operation (soft delete by setting isActive to false)
 */
export async function deleteOperation(id: string): Promise<DeleteOperationResponse> {
  try {
    const operation = await OperationModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    
    if (!operation) {
      return {
        success: false,
        message: 'Operation not found',
      };
    }
    
    return {
      success: true,
      message: 'Operation deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting operation:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete operation',
    };
  }
}

/**
 * Get unique processes for filtering
 */
export async function getUniqueProcesses() {
  try {
    const processes = await OperationModel.distinct('process', { isActive: true });
    return processes.sort();
  } catch (error) {
    console.error('Error fetching unique processes:', error);
    return [];
  }
}

/**
 * Get unique work centers for filtering
 */
export async function getUniqueWorkCenters() {
  try {
    const workCenters = await OperationModel.distinct('workCenter', { isActive: true });
    return workCenters.sort();
  } catch (error) {
    console.error('Error fetching unique work centers:', error);
    return [];
  }
}