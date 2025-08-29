import { NextRequest, NextResponse } from 'next/server';
import { generateDailyMealPlan } from '@/ai/flows/generate-daily-meal-plan';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.ingredients || !body.targetCalories) {
      return NextResponse.json(
        { error: 'Missing required fields: ingredients and targetCalories' },
        { status: 400 }
      );
    }

    // Validate calorie range
    if (body.targetCalories < 800 || body.targetCalories > 5000) {
      return NextResponse.json(
        { error: 'Target calories must be between 800 and 5000' },
        { status: 400 }
      );
    }

    // Validate meal count
    if (body.mealCount && (body.mealCount < 3 || body.mealCount > 6)) {
      return NextResponse.json(
        { error: 'Meal count must be between 3 and 6' },
        { status: 400 }
      );
    }

    const result = await generateDailyMealPlan(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating daily meal plan:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
