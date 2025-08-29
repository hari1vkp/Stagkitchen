"use client";

import { Clock, Target, ShoppingCart, Lightbulb, ChefHat, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { DailyMealPlanOutput } from '@/ai/flows/generate-daily-meal-plan';

interface DailyMealPlanDisplayProps {
  mealPlan: DailyMealPlanOutput;
}

const getMealTypeColor = (type: string) => {
  switch (type) {
    case 'breakfast': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
    case 'lunch': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
    case 'dinner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
    case 'snack': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
    case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
  }
};

export default function DailyMealPlanDisplay({ mealPlan }: DailyMealPlanDisplayProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Daily Summary Card */}
      <Card className="finpay-card finpay-card-hover">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold finpay-gradient-text flex items-center justify-center gap-2">
            <Target className="h-6 w-6" />
            Daily Nutrition Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-finpay-teal-600">{mealPlan.dailyPlan.totalCalories}</div>
              <div className="text-sm text-finpay-gray-600 dark:text-muted-foreground">Calories</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-finpay-blue-600">{mealPlan.dailyPlan.totalProtein}g</div>
              <div className="text-sm text-finpay-gray-600 dark:text-muted-foreground">Protein</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-finpay-purple-600">{mealPlan.dailyPlan.totalCarbs}g</div>
              <div className="text-sm text-finpay-gray-600 dark:text-muted-foreground">Carbs</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-finpay-pink-600">{mealPlan.dailyPlan.totalFat}g</div>
              <div className="text-sm text-finpay-gray-600 dark:text-muted-foreground">Fat</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-finpay-green-600">{mealPlan.dailyPlan.totalFiber}g</div>
              <div className="text-sm text-finpay-gray-600 dark:text-muted-foreground">Fiber</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center finpay-gradient-text">Your Daily Meals</h2>
        {mealPlan.meals.map((meal, index) => (
          <Card key={index} className="finpay-card finpay-card-hover hover-lift">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-finpay-gray-900 dark:text-foreground">{meal.name}</h3>
                    <Badge className={getMealTypeColor(meal.type)}>
                      {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-finpay-gray-600 dark:text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      {meal.calories} cal
                    </div>
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      {meal.prepTime + meal.cookTime} min
                    </div>
                    <Badge className={getDifficultyColor(meal.difficulty)}>
                      {meal.difficulty.charAt(0).toUpperCase() + meal.difficulty.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-finpay-gray-900 dark:text-foreground mb-2">Ingredients:</h4>
                <p className="text-finpay-gray-700 dark:text-foreground/80">{meal.ingredients}</p>
              </div>
              <div>
                <h4 className="font-semibold text-finpay-gray-900 dark:text-foreground mb-2">Instructions:</h4>
                <p className="text-finpay-gray-700 dark:text-foreground/80">{meal.instructions}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shopping List */}
      {mealPlan.shoppingList.length > 0 && (
        <Card className="finpay-card finpay-card-hover">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-finpay-gray-900 dark:text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {mealPlan.shoppingList.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-finpay-gray-700 dark:text-foreground/80">
                  <div className="w-2 h-2 bg-finpay-teal-500 rounded-full"></div>
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      {mealPlan.tips.length > 0 && (
        <Card className="finpay-card finpay-card-hover">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-finpay-gray-900 dark:text-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Meal Prep Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mealPlan.tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 text-finpay-gray-700 dark:text-foreground/80">
                  <div className="w-2 h-2 bg-finpay-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
