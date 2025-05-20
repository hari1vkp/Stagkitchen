import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';

export type Recipe = GenerateRecipeOutput;

export type SavedRecipe = Recipe & {
  id: string;
};
