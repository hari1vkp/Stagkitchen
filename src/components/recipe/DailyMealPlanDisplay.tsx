"use client";

import { Clock, Target, ShoppingCart, Lightbulb, ChefHat, Timer, Save, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();

  const handleSaveMealPlan = () => {
    const savedMealPlans = JSON.parse(localStorage.getItem('saved_meal_plans') || '[]');
    const newMealPlan = {
      ...mealPlan,
      id: Date.now().toString(),
      savedAt: new Date().toISOString(),
      title: `Daily Meal Plan - ${new Date().toLocaleDateString()}`
    };
    
    savedMealPlans.push(newMealPlan);
    localStorage.setItem('saved_meal_plans', JSON.stringify(savedMealPlans));
    
    toast({
      title: "Meal Plan Saved!",
      description: "Your daily meal plan has been saved successfully.",
      variant: "default",
    });
  };

  const handlePrintMealPlan = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Daily Meal Plan - ${new Date().toLocaleDateString()}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #0891b2; 
              padding-bottom: 20px;
            }
            h1 { 
              color: #0891b2; 
              margin: 0;
              font-size: 28px;
            }
            .date { 
              color: #6b7280; 
              font-size: 16px; 
              margin-top: 5px;
            }
            .nutrition-summary {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #e2e8f0;
            }
            .nutrition-grid {
              display: grid;
              grid-template-columns: repeat(5, 1fr);
              gap: 15px;
              text-align: center;
            }
            .nutrition-item {
              padding: 10px;
            }
            .nutrition-value {
              font-size: 24px;
              font-weight: bold;
              color: #0891b2;
            }
            .nutrition-label {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
            }
            .meal {
              margin: 25px 0;
              padding: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .meal-header {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 15px;
            }
            .meal-type {
              background: #0891b2;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              text-transform: uppercase;
            }
            .meal-info {
              display: flex;
              gap: 20px;
              margin: 10px 0;
              font-size: 14px;
              color: #6b7280;
            }
            .section {
              margin: 15px 0;
            }
            .section-title {
              font-weight: bold;
              color: #374151;
              margin-bottom: 8px;
            }
            .shopping-list {
              margin: 25px 0;
              padding: 20px;
              background: #f8fafc;
              border-radius: 8px;
            }
            .shopping-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 8px;
            }
            .shopping-item {
              padding: 5px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .tips {
              margin: 25px 0;
              padding: 20px;
              background: #fef3c7;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
            @media print {
              body { margin: 0; }
              .meal { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Daily Meal Plan</h1>
            <div class="date">Generated on ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="nutrition-summary">
            <h2 style="margin-top: 0; color: #374151;">Daily Nutrition Summary</h2>
            <div class="nutrition-grid">
              <div class="nutrition-item">
                <div class="nutrition-value">${mealPlan.dailyPlan.totalCalories}</div>
                <div class="nutrition-label">Calories</div>
              </div>
              <div class="nutrition-item">
                <div class="nutrition-value">${mealPlan.dailyPlan.totalProtein}g</div>
                <div class="nutrition-label">Protein</div>
              </div>
              <div class="nutrition-item">
                <div class="nutrition-value">${mealPlan.dailyPlan.totalCarbs}g</div>
                <div class="nutrition-label">Carbs</div>
              </div>
              <div class="nutrition-item">
                <div class="nutrition-value">${mealPlan.dailyPlan.totalFat}g</div>
                <div class="nutrition-label">Fat</div>
              </div>
              <div class="nutrition-item">
                <div class="nutrition-value">${mealPlan.dailyPlan.totalFiber}g</div>
                <div class="nutrition-label">Fiber</div>
              </div>
            </div>
          </div>

          <h2 style="color: #374151;">Your Daily Meals</h2>
          ${mealPlan.meals.map(meal => `
            <div class="meal">
              <div class="meal-header">
                <h3 style="margin: 0; color: #374151;">${meal.name}</h3>
                <span class="meal-type">${meal.type}</span>
              </div>
              <div class="meal-info">
                <span>🎯 ${meal.calories} cal</span>
                <span>⏱️ ${meal.prepTime + meal.cookTime} min</span>
                <span>📊 ${meal.difficulty}</span>
              </div>
              <div class="section">
                <div class="section-title">Ingredients:</div>
                <div>${meal.ingredients}</div>
              </div>
              <div class="section">
                <div class="section-title">Instructions:</div>
                <div>${meal.instructions}</div>
              </div>
            </div>
          `).join('')}

          ${mealPlan.shoppingList.length > 0 ? `
            <div class="shopping-list">
              <h2 style="margin-top: 0; color: #374151;">🛒 Shopping List</h2>
              <div class="shopping-grid">
                ${mealPlan.shoppingList.map(item => `
                  <div class="shopping-item">☐ ${item}</div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${mealPlan.tips.length > 0 ? `
            <div class="tips">
              <h2 style="margin-top: 0; color: #374151;">💡 Meal Prep Tips</h2>
              ${mealPlan.tips.map(tip => `
                <div style="margin: 8px 0;">• ${tip}</div>
              `).join('')}
            </div>
          ` : ''}
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button 
          onClick={handleSaveMealPlan}
          className="finpay-button-accent flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Meal Plan
        </Button>
        <Button 
          onClick={handlePrintMealPlan}
          variant="outline"
          className="finpay-button-secondary flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Print Meal Plan
        </Button>
      </div>

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
