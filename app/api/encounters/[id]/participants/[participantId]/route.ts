import { NextResponse } from 'next/server';
import { updateEncounterParticipant } from '@/lib/db-operations';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; participantId: string } }
) {
  try {
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
