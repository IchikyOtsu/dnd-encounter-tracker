import { NextResponse } from 'next/server';
import { getEncounters, createEncounter } from '@/lib/db-operations';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const encounters = await getEncounters();
    return NextResponse.json(encounters);
  } catch (error) {
    console.error('Error fetching encounters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch encounters' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const encounter = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    };
    
    await createEncounter(encounter);
    return NextResponse.json(encounter, { status: 201 });
  } catch (error) {
    console.error('Error creating encounter:', error);
    return NextResponse.json(
      { error: 'Failed to create encounter' },
      { status: 500 }
    );
  }
}
