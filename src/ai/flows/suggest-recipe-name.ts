// The file provides a Genkit flow for suggesting a recipe name using AI.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipeNameInputSchema = z.object({
  ingredients: z
    .string()
    .describe('The ingredients used in the recipe, comma separated.'),
  mealType: z.string().describe('The type of meal, e.g., breakfast, lunch, dinner.'),
  cuisine: z.string().describe('The cuisine of the recipe, e.g., Italian, Mexican, Indian.'),
});
export type SuggestRecipeNameInput = z.infer<typeof SuggestRecipeNameInputSchema>;

const SuggestRecipeNameOutputSchema = z.object({
  recipeName: z.string().describe('A creative and appealing name for the recipe.'),
});
export type SuggestRecipeNameOutput = z.infer<typeof SuggestRecipeNameOutputSchema>;

export async function suggestRecipeName(input: SuggestRecipeNameInput): Promise<SuggestRecipeNameOutput> {
  return suggestRecipeNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipeNamePrompt',
  input: {schema: SuggestRecipeNameInputSchema},
  output: {schema: SuggestRecipeNameOutputSchema},
  prompt: `You are a creative recipe name generator. Given the ingredients, meal type, and cuisine of a recipe, suggest a creative and appealing name for the recipe.

Ingredients: {{{ingredients}}}
Meal Type: {{{mealType}}}
Cuisine: {{{cuisine}}}

Recipe Name:`,
});

const suggestRecipeNameFlow = ai.defineFlow(
  {
    name: 'suggestRecipeNameFlow',
    inputSchema: SuggestRecipeNameInputSchema,
    outputSchema: SuggestRecipeNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
