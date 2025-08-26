"use client";

import { useState } from 'react';
import RecipeForm from '@/components/forms/RecipeForm';
import RecipeDisplay from '@/components/recipe/RecipeDisplay';
import NoRecipeGenerated from '@/components/recipe/NoRecipeGenerated';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ChefHat, TrendingUp, Clock, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { generateRecipe, type GenerateRecipeInput, type GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import type { Recipe } from '@/types/recipe';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'saved'>('form');

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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold finpay-gradient-text">
          AI-Powered Recipe Generator
        </h1>
        <p className="text-xl text-finpay-gray-600 dark:text-muted-foreground max-w-2xl mx-auto">
          Transform your ingredients into culinary masterpieces with the power of artificial intelligence
        </p>
      </div>

      {/* Balance Card - Styled like Finpay */}
      <div className="finpay-card finpay-card-hover">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-finpay-gray-500 dark:text-muted-foreground uppercase tracking-wide">YOUR RECIPE BALANCE</h2>
            <p className="text-3xl md:text-4xl font-bold finpay-gradient-text mt-1">∞ Unlimited</p>
            <p className="text-finpay-gray-600 dark:text-muted-foreground mt-2">AI-Powered • No Limits • Instant Generation</p>
          </div>
          <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-4 rounded-2xl">
            <ChefHat size={48} className="text-white" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-finpay-gray-100 dark:bg-muted p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'form'
              ? 'bg-white dark:bg-card text-finpay-teal-600 dark:text-foreground shadow-md'
              : 'text-finpay-gray-600 dark:text-muted-foreground hover:text-finpay-gray-800 dark:hover:text-foreground'
          }`}
        >
          RECIPE GENERATOR
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
            activeTab === 'saved'
              ? 'bg-white dark:bg-card text-finpay-teal-600 dark:text-foreground shadow-md'
              : 'text-finpay-gray-600 dark:text-muted-foreground hover:text-finpay-gray-800 dark:hover:text-foreground'
          }`}
        >
          SAVED RECIPES
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'form' ? (
        <div className="space-y-8">
          <RecipeForm onSubmit={handleGenerateRecipe} isLoading={isLoading} />

          {isLoading && (
            <div className="finpay-card text-center">
              <LoadingSpinner size={64} />
              <p className="text-lg text-finpay-gray-600 dark:text-muted-foreground mt-4">Generating your masterpiece...</p>
            </div>
          )}

          {error && (
            <div className="finpay-card border-l-4 border-red-500 bg-red-50 dark:bg-destructive/10">
              <Alert variant="destructive" className="border-0 bg-transparent">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Generating Recipe</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {!isLoading && !error && recipe && (
            <RecipeDisplay recipe={recipe} />
          )}

          {!isLoading && !error && !recipe && (
            <NoRecipeGenerated />
          )}
        </div>
      ) : (
        <div className="finpay-card text-center">
          <div className="bg-gradient-to-r from-finpay-purple-100 to-finpay-pink-100 dark:from-muted dark:to-muted p-8 rounded-2xl">
            <Bookmark size={64} className="text-finpay-purple-500 dark:text-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-finpay-gray-900 dark:text-foreground mb-2">Saved Recipes</h3>
            <p className="text-finpay-gray-600 dark:text-muted-foreground mb-6">Your favorite recipes will appear here</p>
            <Button 
              onClick={() => setActiveTab('form')}
              className="finpay-button-primary"
            >
              Generate New Recipe
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
