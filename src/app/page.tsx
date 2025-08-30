"use client";

import { useState } from "react";
import { ChefHat, BookOpen, Calendar, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import RecipeForm from "@/components/forms/RecipeForm";
import RecipeDisplay from "@/components/recipe/RecipeDisplay";
import NoRecipeGenerated from "@/components/recipe/NoRecipeGenerated";
import DailyMealPlanForm from "@/components/forms/DailyMealPlanForm";
import DailyMealPlanDisplay from "@/components/recipe/DailyMealPlanDisplay";
import SavedRecipesClient from "@/components/recipe/SavedRecipesClient";
import SavedDailyMealPlans from "@/components/recipe/SavedDailyMealPlans";
import type { Recipe } from "@/types/recipe";
import type { DailyMealPlanInput, DailyMealPlanOutput } from "@/ai/flows/generate-daily-meal-plan";

export default function Home() {
  const [activeTab, setActiveTab] = useState("generator");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [mealPlan, setMealPlan] = useState<DailyMealPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshSavedRecipes, setRefreshSavedRecipes] = useState(0);
  const { toast } = useToast();

  const handleRecipeSubmit = async (data: any) => {
    console.log('Submitting recipe data:', {
      ...data,
      images: data.images ? `${data.images.length} images` : 'no images'
    });
    
    setIsLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const response = await fetch("/api/recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Recipe generation successful');
      setRecipe(result);
    } catch (err) {
      console.error('Recipe generation error:', err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMealPlanSubmit = async (data: DailyMealPlanInput) => {
    setIsLoading(true);
    setError(null);
    setMealPlan(null);

    try {
      const response = await fetch("/api/daily-meal-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setMealPlan(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = () => {
    if (recipe) {
      const savedRecipes = JSON.parse(
        localStorage.getItem("saved_recipes_snap") || "[]"
      );
      
      // Check if recipe already exists
      const existingRecipe = savedRecipes.find((r: any) => r.recipeName === recipe.recipeName);
      if (existingRecipe) {
        toast({
          title: "Recipe Already Saved",
          description: `"${recipe.recipeName}" is already in your saved recipes.`,
          variant: "default",
        });
        return;
      }
      
      const recipeWithId = { ...recipe, id: Date.now().toString() };
      savedRecipes.push(recipeWithId);
      localStorage.setItem("saved_recipes_snap", JSON.stringify(savedRecipes));
      
      // Trigger refresh of saved recipes
      setRefreshSavedRecipes(prev => prev + 1);
      
      toast({
        title: "Recipe Saved!",
        description: `"${recipe.recipeName}" has been added to your saved recipes.`,
        variant: "default",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-finpay-gray-50 via-white to-finpay-purple-50/50 dark:from-background dark:via-background dark:to-muted/20">
      {/* Welcome Section */}
      <div className="text-center py-8 md:py-12 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 finpay-gradient-text" style={{lineHeight: '1.1', paddingBottom: '0.05em'}}>
          Welcome to StagKitchen
        </h1>
        <p className="text-lg sm:text-xl text-finpay-gray-600 dark:text-muted-foreground max-w-3xl mx-auto px-2">
          Your AI-powered kitchen companion for creating delicious recipes and planning nutritious meals
        </p>
      </div>

      {/* Recipe Balance Card */}
      <div className="max-w-4xl mx-auto px-4 mb-6 md:mb-8">
        <Card className="finpay-card finpay-card-hover bg-gradient-to-r from-finpay-teal-50/50 to-finpay-blue-50/50 dark:from-muted/30 dark:to-muted/20 border-finpay-teal-200/30 dark:border-border">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-2 md:p-3 rounded-xl">
                  <ChefHat className="text-white h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-finpay-gray-900 dark:text-foreground">
                    Recipe Balance
                  </h3>
                  <p className="text-sm md:text-base text-finpay-gray-600 dark:text-muted-foreground">
                    Generate recipes or plan your entire day
                  </p>
                </div>
              </div>
              <Badge className="bg-finpay-teal-100 text-finpay-teal-800 dark:bg-finpay-teal-900/20 dark:text-finpay-teal-200 text-xs md:text-sm">
                AI Powered
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 md:mb-8 bg-white dark:bg-card border border-finpay-gray-200 dark:border-border rounded-xl p-1 shadow-md h-auto md:h-14">
            <TabsTrigger
              value="generator"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-finpay-teal-500 data-[state=active]:to-finpay-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-xs sm:text-sm md:text-base h-full px-2 md:px-4"
            >
              <ChefHat className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
              <span className="hidden sm:inline font-medium text-center">Recipe Generator</span>
              <span className="sm:hidden font-medium text-center">Recipe</span>
            </TabsTrigger>
            <TabsTrigger
              value="daily-plan"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-finpay-teal-500 data-[state=active]:to-finpay-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-xs sm:text-sm md:text-base h-full px-2 md:px-4"
            >
              <Calendar className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
              <span className="hidden sm:inline font-medium text-center">Daily Meal Plan</span>
              <span className="sm:hidden font-medium text-center">Daily Plan</span>
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-finpay-teal-500 data-[state=active]:to-finpay-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-xs sm:text-sm md:text-base h-full px-2 md:px-4"
            >
              <BookOpen className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
              <span className="hidden sm:inline font-medium text-center">Saved Recipes</span>
              <span className="sm:hidden font-medium text-center">Recipes</span>
            </TabsTrigger>
            <TabsTrigger
              value="saved-meals"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-finpay-teal-500 data-[state=active]:to-finpay-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-xs sm:text-sm md:text-base h-full px-2 md:px-4"
            >
              <Calendar className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
              <span className="hidden sm:inline font-medium text-center">Saved Meal Plans</span>
              <span className="sm:hidden font-medium text-center">Meal Plans</span>
            </TabsTrigger>
          </TabsList>

          {/* Recipe Generator Tab */}
          <TabsContent value="generator" className="space-y-8">
            {!recipe && !isLoading && !error && (
              <RecipeForm onSubmit={handleRecipeSubmit} isLoading={isLoading} />
            )}

            {isLoading && (
              <div className="text-center py-8 md:py-12">
                <LoadingSpinner />
                <p className="mt-4 text-base md:text-lg text-finpay-gray-600 dark:text-muted-foreground px-4">
                  Cooking up something delicious...
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-8 md:py-12 px-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 md:p-6 max-w-md mx-auto">
                  <p className="text-red-800 dark:text-red-200 font-semibold text-sm md:text-base">
                    Error Generating Recipe
                  </p>
                  <p className="text-red-600 dark:text-red-300 mt-2 text-sm md:text-base">{error}</p>
                </div>
              </div>
            )}

            {recipe && (
              <div className="space-y-4 md:space-y-6">
                <RecipeDisplay recipe={recipe} />
                <div className="text-center px-4">
                  <Button
                    onClick={handleSaveRecipe}
                    className="finpay-button-primary w-full sm:w-auto"
                    size="lg"
                  >
                    Save Recipe
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Daily Meal Plan Tab */}
          <TabsContent value="daily-plan" className="space-y-6 md:space-y-8">
            {!mealPlan && !isLoading && !error && (
              <DailyMealPlanForm onSubmit={handleMealPlanSubmit} isLoading={isLoading} />
            )}

            {isLoading && (
              <div className="text-center py-8 md:py-12">
                <LoadingSpinner />
                <p className="mt-4 text-base md:text-lg text-finpay-gray-600 dark:text-muted-foreground px-4">
                  Planning your perfect day...
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-8 md:py-12 px-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 md:p-6 max-w-md mx-auto">
                  <p className="text-red-800 dark:text-red-200 font-semibold text-sm md:text-base">
                    Error Generating Meal Plan
                  </p>
                  <p className="text-red-600 dark:text-red-300 mt-2 text-sm md:text-base">{error}</p>
                </div>
              </div>
            )}

            {mealPlan && (
              <div className="space-y-4 md:space-y-6">
                <DailyMealPlanDisplay mealPlan={mealPlan} />
                <div className="text-center px-4">
                  <Button
                    onClick={() => setMealPlan(null)}
                    className="finpay-button-secondary w-full sm:w-auto"
                    size="lg"
                  >
                    Plan Another Day
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Saved Recipes Tab */}
          <TabsContent value="saved" className="space-y-6 md:space-y-8">
            <SavedRecipesClient refreshTrigger={refreshSavedRecipes} />
          </TabsContent>

          {/* Saved Meal Plans Tab */}
          <TabsContent value="saved-meals" className="space-y-6 md:space-y-8">
            <SavedDailyMealPlans />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
