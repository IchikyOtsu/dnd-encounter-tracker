import { NextResponse } from 'next/server';
import { getRollHistory, createRoll, clearRollHistory } from '@/lib/dice-operations';

export async function GET() {
  try {
    const rolls = await getRollHistory();
    return NextResponse.json(rolls);
  } catch (error) {
    console.error('Error fetching roll history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roll history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { formula, label } = await request.json();
    
    if (!formula) {
      return NextResponse.json(
        { error: 'Formula is required' },
        { status: 400 }
      );
    }

    const roll = await createRoll(formula, label);
    return NextResponse.json(roll, { status: 201 });
  } catch (error: any) {
    console.error('Error creating roll:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create roll' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await clearRollHistory();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing roll history:', error);
    return NextResponse.json(
      { error: 'Failed to clear roll history' },
      { status: 500 }
    );
  }
}
