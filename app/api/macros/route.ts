import { NextResponse } from 'next/server';
import { getDiceMacros, createMacro } from '@/lib/dice-operations';

export async function GET() {
  try {
    const macros = await getDiceMacros();
    return NextResponse.json(macros);
  } catch (error) {
    console.error('Error fetching macros:', error);
    return NextResponse.json(
      { error: 'Failed to fetch macros' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.name || !data.formula) {
      return NextResponse.json(
        { error: 'Name and formula are required' },
        { status: 400 }
      );
    }

    const macro = await createMacro(data);
    return NextResponse.json(macro, { status: 201 });
  } catch (error: any) {
    console.error('Error creating macro:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create macro' },
      { status: 500 }
    );
  }
}
