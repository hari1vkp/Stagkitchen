"use client";

import { useState } from 'react';
import RecipeForm from '@/components/forms/RecipeForm';
import RecipeDisplay from '@/components/recipe/RecipeDisplay';
import NoRecipeGenerated from '@/components/recipe/NoRecipeGenerated';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

import { generateRecipe, type GenerateRecipeInput, type GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import type { Recipe } from '@/types/recipe';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const handleGenerateRecipe = async (data: GenerateRecipeInput) => {
    setIsLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const result: GenerateRecipeOutput = await generateRecipe(data);
      setRecipe(result);
    } catch (err) {
      console.error("Error generating recipe:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <RecipeForm onSubmit={handleGenerateRecipe} isLoading={isLoading} />

      {isLoading && (
        <div className="mt-12">
          <LoadingSpinner size={64} />
          <p className="text-center text-lg text-muted-foreground mt-4">Generating your masterpiece...</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-8">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Generating Recipe</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && recipe && (
        <div className="mt-8">
          <RecipeDisplay recipe={recipe} />
        </div>
      )}

      {!isLoading && !error && !recipe && (
        <div className="mt-8">
          <NoRecipeGenerated />
        </div>
      )}
    </div>
  );
}
