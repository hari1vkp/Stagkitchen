import { NextRequest, NextResponse } from 'next/server';
import { generateRecipe } from '@/ai/flows/generate-recipe';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Recipe API received body:', {
      ...body,
      images: body.images ? `${body.images.length} images` : 'no images',
      imageType: body.imageType,
      inputType: body.inputType
    });

    // Basic validation
    if (!body || (typeof body !== 'object')) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Enhanced image validation
    if (body.images && Array.isArray(body.images)) {
      if (body.images.length > 5) {
        return NextResponse.json({ 
          error: 'Too many images. Maximum 5 images allowed.' 
        }, { status: 400 });
      }

      for (let i = 0; i < body.images.length; i++) {
        const image = body.images[i];
        
        if (typeof image !== 'string') {
          console.error(`Image at index ${i} is not a string:`, typeof image);
          return NextResponse.json({ 
            error: `Invalid image format at index ${i}. Expected string.` 
          }, { status: 400 });
        }

        if (!image.startsWith('data:image/')) {
          console.error(`Invalid image format at index ${i}:`, image.substring(0, 50));
          return NextResponse.json({ 
            error: `Invalid image format at index ${i}. Expected data URI format starting with 'data:image/'.` 
          }, { status: 400 });
        }

        // Check if the image has valid base64 data
        const [header, data] = image.split(',');
        if (!header || !data) {
          console.error(`Invalid image structure at index ${i}: missing header or data`);
          return NextResponse.json({ 
            error: `Invalid image structure at index ${i}. Missing header or data.` 
          }, { status: 400 });
        }

        // Validate MIME type
        const mimeMatch = header.match(/data:([^;]+);base64/);
        if (!mimeMatch || !mimeMatch[1].startsWith('image/')) {
          console.error(`Invalid MIME type at index ${i}:`, header);
          return NextResponse.json({ 
            error: `Invalid MIME type at index ${i}. Expected image/* format.` 
          }, { status: 400 });
        }

        // Check base64 data length (rough size check)
        const estimatedSize = (data.length * 3) / 4; // Base64 to bytes conversion
        if (estimatedSize > 10 * 1024 * 1024) { // 10MB limit
          console.error(`Image at index ${i} is too large: ${(estimatedSize / 1024 / 1024).toFixed(2)}MB`);
          return NextResponse.json({ 
            error: `Image at index ${i} is too large. Maximum size is 10MB.` 
          }, { status: 400 });
        }

        console.log(`Image ${i + 1} validated: ${mimeMatch[1]}, ~${(estimatedSize / 1024).toFixed(2)}KB`);
      }
    }

    // Validate that we have either ingredients or images
    const hasIngredients = body.ingredients && body.ingredients.trim().length > 0;
    const hasImages = body.images && body.images.length > 0;
    
    if (!hasIngredients && !hasImages) {
      return NextResponse.json({ 
        error: 'Please provide either ingredients/dish name or upload at least one image.' 
      }, { status: 400 });
    }

    console.log('Starting recipe generation with validated input');
    const result = await generateRecipe(body);
    console.log('Recipe generation completed successfully');
    return NextResponse.json(result);
  } catch (err) {
    console.error('Error generating recipe:', err);
    
    // More specific error handling
    if (err instanceof Error) {
      if (err.message.includes('quota') || err.message.includes('rate limit')) {
        return NextResponse.json({ 
          error: 'API quota exceeded. Please try again later.' 
        }, { status: 429 });
      }
      
      if (err.message.includes('invalid') || err.message.includes('format')) {
        return NextResponse.json({ 
          error: `Invalid input: ${err.message}` 
        }, { status: 400 });
      }
      
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
