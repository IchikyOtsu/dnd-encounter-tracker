import { NextResponse } from 'next/server';
import { getFlavorTexts } from '@/lib/db-operations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const actionType = searchParams.get('actionType');
    const damageType = searchParams.get('damageType');
    const resultType = searchParams.get('resultType');

    if (!actionType || !damageType || !resultType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const flavorTexts = await getFlavorTexts(actionType, damageType, resultType);
    return NextResponse.json(flavorTexts);
  } catch (error) {
    console.error('Error fetching flavor texts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flavor texts' },
      { status: 500 }
    );
  }
}
