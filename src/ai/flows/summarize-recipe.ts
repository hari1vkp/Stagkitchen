'use server';
/**
 * @fileOverview Summarizes the recipe details including total cooking time and steps.
 *
 * - summarizeRecipe - A function that summarizes the recipe details.
 * - SummarizeRecipeInput - The input type for the summarizeRecipe function.
 * - SummarizeRecipeOutput - The return type for the summarizeRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRecipeInputSchema = z.object({
  ingredients: z.string().describe('A list of ingredients for the recipe.'),
  instructions: z.string().describe('Step-by-step cooking instructions.'),
  totalTime: z.string().describe('The total cooking time for the recipe.'),
  recipeName: z.string().describe('The name of the recipe.'),
});
export type SummarizeRecipeInput = z.infer<typeof SummarizeRecipeInputSchema>;

const SummarizeRecipeOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the recipe, including total cooking time and key steps.'),
});
export type SummarizeRecipeOutput = z.infer<typeof SummarizeRecipeOutputSchema>;

export async function summarizeRecipe(input: SummarizeRecipeInput): Promise<SummarizeRecipeOutput> {
  return summarizeRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRecipePrompt',
  input: {schema: SummarizeRecipeInputSchema},
  output: {schema: SummarizeRecipeOutputSchema},
  prompt: `Summarize the following recipe details, including the total cooking time and the most important steps.  Be concise and focus on what a user needs to quickly assess if the recipe suits their schedule.\n\nRecipe Name: {{{recipeName}}}\nIngredients: {{{ingredients}}}\nInstructions: {{{instructions}}}\nTotal Cooking Time: {{{totalTime}}}`,
});

const summarizeRecipeFlow = ai.defineFlow(
  {
    name: 'summarizeRecipeFlow',
    inputSchema: SummarizeRecipeInputSchema,
    outputSchema: SummarizeRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
