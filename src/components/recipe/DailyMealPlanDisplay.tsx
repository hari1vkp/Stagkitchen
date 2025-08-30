"use client";

import { useState } from 'react';
import { Clock, Target, ShoppingCart, Lightbulb, ChefHat, Timer, Save, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const [openSections, setOpenSections] = useState({
    meals: false,
    shopping: false,
    tips: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {/* Meals Section */}
        <Collapsible open={openSections.meals} onOpenChange={() => toggleSection('meals')}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between p-4 h-auto text-left finpay-card-hover border-finpay-blue-200/50 dark:border-border hover:bg-finpay-blue-50/50 dark:hover:bg-muted/60"
            >
              <div className="flex items-center gap-3">
                <div className="bg-finpay-blue-100 dark:bg-finpay-blue-900/20 p-2 rounded-lg">
                  <ChefHat size={20} className="text-finpay-blue-600 dark:text-finpay-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-finpay-blue-600 dark:text-finpay-blue-400">
                    Daily Meals
                  </h3>
                  <p className="text-sm text-finpay-gray-600 dark:text-muted-foreground">
                    {mealPlan.meals.length} meals planned
                  </p>
                </div>
              </div>
              {openSections.meals ? (
                <ChevronUp className="h-5 w-5 text-finpay-blue-600 dark:text-finpay-blue-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-finpay-blue-600 dark:text-finpay-blue-400" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="space-y-4">
              {mealPlan.meals.map((meal, index) => (
                <Card key={index} className="finpay-card finpay-card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold text-finpay-gray-900 dark:text-foreground">{meal.name}</h3>
                          <Badge className={getMealTypeColor(meal.type)}>
                            {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-finpay-gray-600 dark:text-muted-foreground flex-wrap">
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
                  <CardContent className="space-y-4 pt-0">
                    <div>
                      <h4 className="font-semibold text-finpay-gray-900 dark:text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-finpay-blue-500 rounded-full"></div>
                        Ingredients:
                      </h4>
                      <p className="text-sm md:text-base text-finpay-gray-700 dark:text-foreground/80 bg-finpay-blue-50/50 dark:bg-muted/40 p-3 rounded-lg border border-finpay-blue-200/30 dark:border-border">
                        {meal.ingredients}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-finpay-gray-900 dark:text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-finpay-purple-500 rounded-full"></div>
                        Instructions:
                      </h4>
                      <p className="text-sm md:text-base text-finpay-gray-700 dark:text-foreground/80 bg-finpay-purple-50/50 dark:bg-muted/40 p-3 rounded-lg border border-finpay-purple-200/30 dark:border-border">
                        {meal.instructions}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Shopping List Section */}
        {mealPlan.shoppingList.length > 0 && (
          <Collapsible open={openSections.shopping} onOpenChange={() => toggleSection('shopping')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between p-4 h-auto text-left finpay-card-hover border-finpay-green-200/50 dark:border-border hover:bg-finpay-green-50/50 dark:hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-finpay-green-100 dark:bg-finpay-green-900/20 p-2 rounded-lg">
                    <ShoppingCart size={20} className="text-finpay-green-600 dark:text-finpay-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-finpay-green-600 dark:text-finpay-green-400">
                      Shopping List
                    </h3>
                    <p className="text-sm text-finpay-gray-600 dark:text-muted-foreground">
                      {mealPlan.shoppingList.length} items needed
                    </p>
                  </div>
                </div>
                {openSections.shopping ? (
                  <ChevronUp className="h-5 w-5 text-finpay-green-600 dark:text-finpay-green-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-finpay-green-600 dark:text-finpay-green-400" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card className="finpay-card border-finpay-green-200/30 dark:border-border">
                <CardContent className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {mealPlan.shoppingList.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm md:text-base text-finpay-gray-700 dark:text-foreground/80 bg-finpay-green-50/50 dark:bg-muted/40 p-2 md:p-3 rounded-lg border border-finpay-green-200/30 dark:border-border">
                        <div className="w-2 h-2 bg-finpay-green-500 rounded-full flex-shrink-0"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Tips Section */}
        {mealPlan.tips.length > 0 && (
          <Collapsible open={openSections.tips} onOpenChange={() => toggleSection('tips')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between p-4 h-auto text-left finpay-card-hover border-finpay-yellow-200/50 dark:border-border hover:bg-finpay-yellow-50/50 dark:hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-finpay-yellow-100 dark:bg-finpay-yellow-900/20 p-2 rounded-lg">
                    <Lightbulb size={20} className="text-finpay-yellow-600 dark:text-finpay-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-finpay-yellow-600 dark:text-finpay-yellow-400">
                      Meal Prep Tips
                    </h3>
                    <p className="text-sm text-finpay-gray-600 dark:text-muted-foreground">
                      {mealPlan.tips.length} helpful tips
                    </p>
                  </div>
                </div>
                {openSections.tips ? (
                  <ChevronUp className="h-5 w-5 text-finpay-yellow-600 dark:text-finpay-yellow-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-finpay-yellow-600 dark:text-finpay-yellow-400" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card className="finpay-card border-finpay-yellow-200/30 dark:border-border">
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-3">
                    {mealPlan.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-3 text-sm md:text-base text-finpay-gray-700 dark:text-foreground/80 bg-finpay-yellow-50/50 dark:bg-muted/40 p-3 rounded-lg border border-finpay-yellow-200/30 dark:border-border">
                        <div className="w-2 h-2 bg-finpay-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p>{tip}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}
