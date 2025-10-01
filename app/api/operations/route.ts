import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import {
  createOperation,
  getOperations,
  getOperationById,
  updateOperation,
  deleteOperation,
} from '@/features/operations/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const searchTerm = searchParams.get('searchTerm') || undefined;
    const processFilter = searchParams.get('processFilter') || undefined;
    const workCenterFilter = searchParams.get('workCenterFilter') || undefined;
    const id = searchParams.get('id');

    if (id) {
      // Get single operation
      const result = await getOperationById(id);
      return NextResponse.json(result);
    }

    // Get operations list
    const result = await getOperations(
      page,
      limit,
      searchTerm,
      processFilter,
      workCenterFilter
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/operations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch operations' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { operation } = body;

    if (!operation) {
      return NextResponse.json(
        { success: false, message: 'Operation data is required' },
        { status: 400 }
      );
    }

    const result = await createOperation(operation);
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    console.error('Error in POST /api/operations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create operation' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id, data } = body;

    if (!id || !data) {
      return NextResponse.json(
        { success: false, message: 'Operation ID and data are required' },
        { status: 400 }
      );
    }

    const result = await updateOperation(id, data);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('Error in PUT /api/operations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update operation' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Operation ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteOperation(id);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error('Error in DELETE /api/operations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete operation' 
      },
      { status: 500 }
    );
  }
}