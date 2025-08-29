"use client";

import { useState } from "react";
import { ChefHat, BookOpen, Calendar, Target } from "lucide-react";
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
import type { Recipe } from "@/types/recipe";
import type { DailyMealPlanInput, DailyMealPlanOutput } from "@/ai/flows/generate-daily-meal-plan";

export default function Home() {
  const [activeTab, setActiveTab] = useState("generator");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [mealPlan, setMealPlan] = useState<DailyMealPlanOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecipeSubmit = async (data: any) => {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setRecipe(result);
    } catch (err) {
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
      const recipeWithId = { ...recipe, id: Date.now().toString() };
      savedRecipes.push(recipeWithId);
      localStorage.setItem("saved_recipes_snap", JSON.stringify(savedRecipes));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-finpay-gray-50 via-white to-finpay-purple-50/50 dark:from-background dark:via-background dark:to-muted/20">
      {/* Welcome Section */}
      <div className="text-center py-12 px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 finpay-gradient-text">
          Welcome to StagKitchen
        </h1>
        <p className="text-xl text-finpay-gray-600 dark:text-muted-foreground max-w-3xl mx-auto">
          Your AI-powered kitchen companion for creating delicious recipes and planning nutritious meals
        </p>
      </div>

      {/* Recipe Balance Card */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <Card className="finpay-card finpay-card-hover bg-gradient-to-r from-finpay-teal-50/50 to-finpay-blue-50/50 dark:from-muted/30 dark:to-muted/20 border-finpay-teal-200/30 dark:border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-3 rounded-xl">
                  <ChefHat className="text-white h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-finpay-gray-900 dark:text-foreground">
                    Recipe Balance
                  </h3>
                  <p className="text-finpay-gray-600 dark:text-muted-foreground">
                    Generate recipes or plan your entire day
                  </p>
                </div>
              </div>
              <Badge className="bg-finpay-teal-100 text-finpay-teal-800 dark:bg-finpay-teal-900/20 dark:text-finpay-teal-200">
                AI Powered
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white dark:bg-card border border-finpay-gray-200 dark:border-border rounded-xl p-1 shadow-md">
            <TabsTrigger
              value="generator"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-finpay-teal-500 data-[state=active]:to-finpay-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              Recipe Generator
            </TabsTrigger>
            <TabsTrigger
              value="daily-plan"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-finpay-teal-500 data-[state=active]:to-finpay-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Daily Meal Plan
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-finpay-teal-500 data-[state=active]:to-finpay-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Saved Recipes
            </TabsTrigger>
          </TabsList>

          {/* Recipe Generator Tab */}
          <TabsContent value="generator" className="space-y-8">
            {!recipe && !isLoading && !error && (
              <RecipeForm onSubmit={handleRecipeSubmit} isLoading={isLoading} />
            )}

            {isLoading && (
              <div className="text-center py-12">
                <LoadingSpinner />
                <p className="mt-4 text-lg text-finpay-gray-600 dark:text-muted-foreground">
                  Cooking up something delicious...
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
                  <p className="text-red-800 dark:text-red-200 font-semibold">
                    Error Generating Recipe
                  </p>
                  <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
                </div>
              </div>
            )}

            {recipe && (
              <div className="space-y-6">
                <RecipeDisplay recipe={recipe} />
                <div className="text-center">
                  <Button
                    onClick={handleSaveRecipe}
                    className="finpay-button-primary"
                    size="lg"
                  >
                    Save Recipe
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Daily Meal Plan Tab */}
          <TabsContent value="daily-plan" className="space-y-8">
            {!mealPlan && !isLoading && !error && (
              <DailyMealPlanForm onSubmit={handleMealPlanSubmit} isLoading={isLoading} />
            )}

            {isLoading && (
              <div className="text-center py-12">
                <LoadingSpinner />
                <p className="mt-4 text-lg text-finpay-gray-600 dark:text-muted-foreground">
                  Planning your perfect day...
                </p>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 max-w-md mx-auto">
                  <p className="text-red-800 dark:text-red-200 font-semibold">
                    Error Generating Meal Plan
                  </p>
                  <p className="text-red-600 dark:text-red-300 mt-2">{error}</p>
                </div>
              </div>
            )}

            {mealPlan && (
              <div className="space-y-6">
                <DailyMealPlanDisplay mealPlan={mealPlan} />
                <div className="text-center">
                  <Button
                    onClick={() => setMealPlan(null)}
                    className="finpay-button-secondary"
                    size="lg"
                  >
                    Plan Another Day
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Saved Recipes Tab */}
          <TabsContent value="saved" className="space-y-8">
            <div className="text-center py-12">
              <div className="bg-finpay-purple-50/50 dark:bg-muted/30 border border-finpay-purple-200/30 dark:border-border rounded-xl p-8 max-w-md mx-auto">
                <BookOpen className="h-16 w-16 text-finpay-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-finpay-gray-900 dark:text-foreground mb-2">
                  Ready to Cook
                </h3>
                <p className="text-finpay-gray-600 dark:text-muted-foreground mb-4">
                  Your saved recipes will appear here. Generate a recipe first to get started!
                </p>
                <Button
                  onClick={() => setActiveTab("generator")}
                  className="finpay-button-primary"
                >
                  Generate Recipe
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
