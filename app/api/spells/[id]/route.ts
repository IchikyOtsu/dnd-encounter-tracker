import { NextRequest, NextResponse } from 'next/server';
import { getSpellById, updateSpell } from '@/lib/db-operations';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const spell = await getSpellById(params.id);

    if (!spell) {
      return NextResponse.json(
        { error: 'Spell not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(spell);
  } catch (error) {
    console.error('Error fetching spell:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spell' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();

    await updateSpell(params.id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating spell:', error);
    return NextResponse.json(
      { error: 'Failed to update spell' },
      { status: 500 }
    );
  }
}
