'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyMealPlanInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available for use in the meal plan.'),
  targetCalories: z
    .number()
    .min(800)
    .max(5000)
    .describe('Target daily calorie intake for the meal plan.'),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('Any dietary restrictions or preferences, e.g., vegetarian, gluten-free, low-carb.'),
  fitnessGoal: z
    .string()
    .optional()
    .describe('Fitness goal: bulking (muscle gain), cutting (fat loss), recomposition (build muscle & lose fat), or maintenance.'),
  mealCount: z
    .number()
    .min(3)
    .max(6)
    .default(4)
    .describe('Number of meals per day (3-6, default 4: breakfast, lunch, dinner, snack).'),
  images: z
    .array(z.string())
    .optional()
    .describe('An array of Base64 encoded image data URIs of ingredients.'),
});

export type DailyMealPlanInput = z.infer<typeof DailyMealPlanInputSchema>;

const MealSchema = z.object({
  name: z.string().describe('The name of the meal.'),
  type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).describe('The type of meal.'),
  calories: z.number().describe('Estimated calories for this meal.'),
  ingredients: z.string().describe('List of ingredients with quantities.'),
  instructions: z.string().describe('Step-by-step cooking instructions.'),
  prepTime: z.number().describe('Preparation time in minutes.'),
  cookTime: z.number().describe('Cooking time in minutes.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level of the recipe.'),
});

const DailyMealPlanOutputSchema = z.object({
  dailyPlan: z.object({
    totalCalories: z.number().describe('Total calories for the day.'),
    totalProtein: z.number().describe('Total protein in grams.'),
    totalCarbs: z.number().describe('Total carbohydrates in grams.'),
    totalFat: z.number().describe('Total fat in grams.'),
    totalFiber: z.number().describe('Total fiber in grams.'),
  }),
  meals: z.array(MealSchema).describe('Array of meals for the day.'),
  shoppingList: z.array(z.string()).describe('Additional ingredients needed beyond what was provided.'),
  tips: z.array(z.string()).describe('Helpful tips for meal prep and planning.'),
});

export type DailyMealPlanOutput = z.infer<typeof DailyMealPlanOutputSchema>;

export async function generateDailyMealPlan(input: DailyMealPlanInput): Promise<DailyMealPlanOutput> {
  return generateDailyMealPlanFlow(input);
}

const generateDailyMealPlanPrompt = ai.definePrompt({
  name: 'generateDailyMealPlanPrompt',
  input: {schema: DailyMealPlanInputSchema},
  output: {schema: DailyMealPlanOutputSchema},
  prompt: `You are a professional nutritionist and meal planner. Create a complete daily meal plan using the provided ingredients and respecting the calorie target.

Available ingredients: {{{ingredients}}}
Target daily calories: {{{targetCalories}}} calories
Number of meals: {{{mealCount}}}
{{#if dietaryPreferences}}
Dietary preferences: {{{dietaryPreferences}}}
{{/if}}
{{#if fitnessGoal}}
Fitness goal: {{{fitnessGoal}}}
{{/if}}

{{#if images}}
You have been provided with images of ingredients. Consider these when planning meals.
{{{images}}}
{{/if}}

Create a balanced daily meal plan that:
1. Uses the provided ingredients as much as possible
2. Meets the target calorie goal ({{targetCalories}} calories)
3. Includes {{mealCount}} meals throughout the day
4. Provides balanced nutrition (protein, carbs, fat, fiber)
5. Respects any dietary preferences
6. Is practical and easy to prepare

{{#if fitnessGoal}}
Special considerations for fitness goal "{{fitnessGoal}}":
- If bulking: Higher protein and calorie-dense foods for muscle building
- If cutting: High protein, lower calories, filling foods for fat loss
- If recomposition: Balanced macros with strategic nutrient timing
- If maintenance: Sustainable balanced nutrition
{{/if}}

For each meal, provide:
- Creative name
- Meal type (breakfast/lunch/dinner/snack)
- Calorie count
- Ingredients with quantities
- Simple cooking instructions
- Prep and cook time
- Difficulty level

Also provide:
- Daily nutritional totals
- Shopping list for additional ingredients needed
- Meal prep tips

Format the response as a structured meal plan with clear sections for each meal.`,
});

const generateDailyMealPlanFlow = ai.defineFlow(
  {
    name: 'generateDailyMealPlanFlow',
    inputSchema: DailyMealPlanInputSchema,
    outputSchema: DailyMealPlanOutputSchema,
  },
  async input => {
    const promptParts: any[] = [];
    if (input.images && input.images.length > 0) {
      input.images.forEach(imageDataUri => {
        const [header, data] = imageDataUri.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        if (mimeType && data) {
          promptParts.push({inlineData: {data, mimeType}});
        }
      });
    }

    const result = await generateDailyMealPlanPrompt({
      ...input,
      images: promptParts.length > 0 ? promptParts : undefined,
    });

    if (!result.output) {
      throw new Error('Failed to generate daily meal plan');
    }

    return result.output;
  }
);
