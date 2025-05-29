import { NextRequest, NextResponse } from 'next/server';
import { MetadataModel } from '../model';
import { MetaDataType } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') as MetaDataType | null;
    
    const metadata = await MetadataModel.getMetadata(type || undefined);
    
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error in metadata API handler:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}