import { NextResponse } from 'next/server';
import { updateMacro, deleteMacro } from '@/lib/dice-operations';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const updates = await request.json();
    await updateMacro(params.id, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating macro:', error);
    return NextResponse.json(
      { error: 'Failed to update macro' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    await deleteMacro(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting macro:', error);
    return NextResponse.json(
      { error: 'Failed to delete macro' },
      { status: 500 }
    );
  }
}
