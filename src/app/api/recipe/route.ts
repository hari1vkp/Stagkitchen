import { NextRequest, NextResponse } from 'next/server';
import { generateRecipe } from '@/ai/flows/generate-recipe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body || (typeof body !== 'object')) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const result = await generateRecipe(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Error generating recipe:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
