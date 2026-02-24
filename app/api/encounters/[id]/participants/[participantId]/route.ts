import { NextResponse } from 'next/server';
import { updateEncounterParticipant } from '@/lib/db-operations';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const params = await props.params;
    const updates = await request.json();
    await updateEncounterParticipant(params.id, params.participantId, updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}
