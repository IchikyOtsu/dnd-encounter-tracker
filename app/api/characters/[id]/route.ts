import { NextResponse } from 'next/server';
import { updateCharacter, deleteCharacter } from '@/lib/db-operations';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    await updateCharacter(params.id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCharacter(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    );
  }
}
