import { NextRequest, NextResponse } from 'next/server';
import { createItem, getItems } from '../../../features/items/server';
import mockService from '../../../services/api/mock-service';

export async function GET(request: NextRequest) {
  try {
    // Check if we're using mock API
    if (process.env.NEXT_PUBLIC_APP_MOCK_API === 'true') {
      const url = new URL(request.url);
      const queryParams = {
        page: parseInt(url.searchParams.get('page') || '1'),
        limit: parseInt(url.searchParams.get('limit') || '10'),
        searchQuery: url.searchParams.get('searchQuery') || '',
        categoryFilter: url.searchParams.get('categoryFilter') || '',
        isActiveFilter: url.searchParams.get('isActiveFilter') !== 'false',
      };
      
      // Use mock service for items API
      const result = await mockService.getItems(
        queryParams.searchQuery,
        queryParams.page,
        queryParams.limit,
        queryParams.isActiveFilter,
        queryParams.categoryFilter
      );
      return NextResponse.json(result, { status: 200 });
    }

    const result = await getItems(request);
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in items GET route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if we're using mock API
    if (process.env.NEXT_PUBLIC_APP_MOCK_API === 'true') {
      const body = await request.json();
      // Use mock service to create item
      const result = await mockService.createItem(body);
      return NextResponse.json(result, { status: 201 });
    }

    const body = await request.json();
    const result = await createItem(body);
    
    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error in items POST route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}