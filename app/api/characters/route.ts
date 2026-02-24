import { NextResponse } from 'next/server';
import { getCharacters, createCharacter } from '@/lib/db-operations';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const characters = await getCharacters();
    return NextResponse.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const character = {
      ...data,
      id: uuidv4(),
    };
    
    await createCharacter(character);
    return NextResponse.json(character, { status: 201 });
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json(
      { error: 'Failed to create character' },
      { status: 500 }
    );
  }
}
