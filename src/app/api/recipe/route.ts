import { NextRequest, NextResponse } from 'next/server';
import { generateRecipe } from '@/ai/flows/generate-recipe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Recipe API received body:', {
      ...body,
      images: body.images ? `${body.images.length} images` : 'no images'
    });

    // Basic validation
    if (!body || (typeof body !== 'object')) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Validate images if present
    if (body.images && Array.isArray(body.images)) {
      for (let i = 0; i < body.images.length; i++) {
        const image = body.images[i];
        if (typeof image !== 'string' || !image.startsWith('data:image/')) {
          console.error(`Invalid image format at index ${i}:`, image.substring(0, 50));
          return NextResponse.json({ 
            error: `Invalid image format at index ${i}. Expected data URI format.` 
          }, { status: 400 });
        }
      }
    }

    const result = await generateRecipe(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Error generating recipe:', err);
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
