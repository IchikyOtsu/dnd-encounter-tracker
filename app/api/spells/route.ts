import { NextRequest, NextResponse } from 'next/server';
import { getSpells } from '@/lib/db-operations';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = searchParams.get('level');
    const school = searchParams.get('school');
    const classFilter = searchParams.get('class');

    const spells = await getSpells(
      level !== null ? parseInt(level) : undefined,
      school || undefined,
      classFilter || undefined
    );

    return NextResponse.json(spells);
  } catch (error) {
    console.error('Error fetching spells:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spells' },
      { status: 500 }
    );
  }
}
