"use client";

import { useState } from "react";
import { ChefHat, BookOpen, Calendar } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ScrollTextAnimation from "@/components/ui/scroll-text-animation";
import RecipeForm from "@/components/forms/RecipeForm";
import RecipeDisplay from "@/components/recipe/RecipeDisplay";
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



  return (
    <div className="min-h-screen bg-gradient-to-br from-finpay-gray-50 via-white to-finpay-purple-50/50 dark:from-background dark:via-background dark:to-muted/20">
      {/* Welcome Section */}
      <div className="text-center py-8 md:py-12 px-4">
        <ScrollTextAnimation animation="fadeInUp" duration={1.2}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 finpay-gradient-text" style={{ lineHeight: '1.1', paddingBottom: '0.05em' }}>
            Welcome to StagKitchen
          </h1>
        </ScrollTextAnimation>
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
          <TabsList className="flex flex-col md:grid md:grid-cols-4 w-full mb-6 md:mb-8 bg-white dark:bg-card border border-finpay-gray-200 dark:border-border rounded-xl p-1 shadow-md h-auto md:h-14 gap-1 md:gap-0">
            <TabsTrigger
              value="generator"
              className="flex items-center justify-start md:justify-center gap-3 md:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-finpay-teal-500 data-[state=active]:to-finpay-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-sm md:text-base h-12 md:h-full px-4 md:px-2 w-full"
            >
              <ChefHat className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="font-medium text-left md:text-center">Recipe Generator</span>
            </TabsTrigger>
            <TabsTrigger
              value="daily-plan"
              className="flex items-center justify-start md:justify-center gap-3 md:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-finpay-teal-500 data-[state=active]:to-finpay-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-sm md:text-base h-12 md:h-full px-4 md:px-2 w-full"
            >
              <Calendar className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="font-medium text-left md:text-center">Daily Meal Plan</span>
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="flex items-center justify-start md:justify-center gap-3 md:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-finpay-teal-500 data-[state=active]:to-finpay-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-sm md:text-base h-12 md:h-full px-4 md:px-2 w-full"
            >
              <BookOpen className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="font-medium text-left md:text-center">Saved Recipes</span>
            </TabsTrigger>
            <TabsTrigger
              value="saved-meals"
              className="flex items-center justify-start md:justify-center gap-3 md:gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-finpay-teal-500 data-[state=active]:to-finpay-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-300 text-sm md:text-base h-12 md:h-full px-4 md:px-2 w-full"
            >
              <Calendar className="h-5 w-5 md:h-4 md:w-4 flex-shrink-0" />
              <span className="font-medium text-left md:text-center">Saved Meal Plans</span>
            </TabsTrigger>
          </TabsList>

          {/* Recipe Generator Tab */}
          <TabsContent value="generator" className="space-y-8">
            {/* Always show the form */}
            <RecipeForm onSubmit={handleRecipeSubmit} isLoading={isLoading} />

            {/* Show loading state below form */}
            {isLoading && (
              <div className="text-center py-8 md:py-12">
                <LoadingSpinner />
                <p className="mt-4 text-base md:text-lg text-finpay-gray-600 dark:text-muted-foreground px-4">
                  Cooking up something delicious...
                </p>
              </div>
            )}

            {/* Show error below form */}
            {error && (
              <div className="text-center py-8 md:py-12 px-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 md:p-6 max-w-md mx-auto">
                  <p className="text-red-800 dark:text-red-200 font-semibold text-sm md:text-base">
                    Error Generating Recipe
                  </p>
                  <p className="text-red-600 dark:text-red-300 mt-2 text-sm md:text-base">{error}</p>
                  <div className="mt-4">
                    <Button
                      onClick={() => setError(null)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Show recipe results below form */}
            {recipe && (
              <div className="space-y-4 md:space-y-6">
                <div className="border-t border-finpay-gray-200 dark:border-border pt-6 md:pt-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold finpay-gradient-text">
                      Your Generated Recipe
                    </h2>
                    <p className="text-finpay-gray-600 dark:text-muted-foreground mt-2">
                      Here's your AI-crafted culinary creation
                    </p>
                  </div>
                  <RecipeDisplay recipe={recipe} />
                </div>
                <div className="text-center px-4">
                  <Button
                    onClick={() => setRecipe(null)}
                    variant="outline"
                    className="finpay-button-secondary w-full sm:w-auto"
                    size="lg"
                  >
                    Generate New Recipe
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Daily Meal Plan Tab */}
          <TabsContent value="daily-plan" className="space-y-6 md:space-y-8">
            {/* Always show the form */}
            <DailyMealPlanForm onSubmit={handleMealPlanSubmit} isLoading={isLoading} />

            {/* Show loading state below form */}
            {isLoading && (
              <div className="text-center py-8 md:py-12">
                <LoadingSpinner />
                <p className="mt-4 text-base md:text-lg text-finpay-gray-600 dark:text-muted-foreground px-4">
                  Planning your perfect day...
                </p>
              </div>
            )}

            {/* Show error below form */}
            {error && (
              <div className="text-center py-8 md:py-12 px-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 md:p-6 max-w-md mx-auto">
                  <p className="text-red-800 dark:text-red-200 font-semibold text-sm md:text-base">
                    Error Generating Meal Plan
                  </p>
                  <p className="text-red-600 dark:text-red-300 mt-2 text-sm md:text-base">{error}</p>
                  <div className="mt-4">
                    <Button
                      onClick={() => setError(null)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Show meal plan results below form */}
            {mealPlan && (
              <div className="space-y-4 md:space-y-6">
                <div className="border-t border-finpay-gray-200 dark:border-border pt-6 md:pt-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold finpay-gradient-text">
                      Your Daily Meal Plan
                    </h2>
                    <p className="text-finpay-gray-600 dark:text-muted-foreground mt-2">
                      Here's your personalized meal plan for the day
                    </p>
                  </div>
                  <DailyMealPlanDisplay mealPlan={mealPlan} />
                </div>
                <div className="text-center px-4">
                  <Button
                    onClick={() => setMealPlan(null)}
                    variant="outline"
                    className="finpay-button-secondary w-full sm:w-auto"
                    size="lg"
                  >
                    Generate New Plan
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Saved Recipes Tab */}
          <TabsContent value="saved" className="space-y-6 md:space-y-8">
            <SavedRecipesClient />
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
