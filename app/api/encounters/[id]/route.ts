import { NextResponse } from 'next/server';
import { getEncounter, updateEncounter, deleteEncounter } from '@/lib/db-operations';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const encounter = await getEncounter(params.id);
    if (!encounter) {
      return NextResponse.json(
        { error: 'Encounter not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(encounter);
  } catch (error) {
    console.error('Error fetching encounter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch encounter' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    await updateEncounter(params.id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating encounter:', error);
    return NextResponse.json(
      { error: 'Failed to update encounter' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteEncounter(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting encounter:', error);
    return NextResponse.json(
      { error: 'Failed to delete encounter' },
      { status: 500 }
    );
  }
}
