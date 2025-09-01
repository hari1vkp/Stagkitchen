"use client";

import { useState, useEffect } from 'react';
import { Calendar, Trash2, Eye, Printer, Target, Clock, ChefHat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import DailyMealPlanDisplay from './DailyMealPlanDisplay';
import type { DailyMealPlanOutput } from '@/ai/flows/generate-daily-meal-plan';

interface SavedMealPlan extends DailyMealPlanOutput {
  id: string;
  savedAt: string;
  title: string;
}

export default function SavedDailyMealPlans() {
  const [savedMealPlans, setSavedMealPlans] = useState<SavedMealPlan[]>([]);
  const [selectedMealPlan, setSelectedMealPlan] = useState<SavedMealPlan | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSavedMealPlans();
  }, []);

  const loadSavedMealPlans = () => {
    const saved = localStorage.getItem('saved_meal_plans');
    if (saved) {
      const plans = JSON.parse(saved);
      setSavedMealPlans(plans.sort((a: SavedMealPlan, b: SavedMealPlan) => 
        new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      ));
    }
  };

  const deleteMealPlan = (id: string) => {
    const updatedPlans = savedMealPlans.filter(plan => plan.id !== id);
    setSavedMealPlans(updatedPlans);
    localStorage.setItem('saved_meal_plans', JSON.stringify(updatedPlans));
    
    toast({
      title: "Meal Plan Deleted",
      description: "The meal plan has been removed from your saved plans.",
      variant: "default",
    });
  };

  const printMealPlan = (mealPlan: SavedMealPlan) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${mealPlan.title}</title>
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
            <h1>${mealPlan.title}</h1>
            <div class="date">Saved on ${new Date(mealPlan.savedAt).toLocaleDateString()}</div>
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (savedMealPlans.length === 0) {
    return (
      <Card className="finpay-card">
        <CardContent className="text-center py-12">
          <Calendar className="h-12 w-12 text-finpay-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-finpay-gray-600 dark:text-muted-foreground mb-2">
            No Saved Meal Plans
          </h3>
          <p className="text-finpay-gray-500 dark:text-muted-foreground">
            Generate and save your first daily meal plan to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold finpay-gradient-text mb-2">Saved Daily Meal Plans</h2>
        <p className="text-finpay-gray-600 dark:text-muted-foreground">
          {savedMealPlans.length} saved meal plan{savedMealPlans.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedMealPlans.map((mealPlan) => (
          <Card key={mealPlan.id} className="finpay-card finpay-card-hover hover-lift">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg font-bold text-finpay-gray-900 dark:text-foreground line-clamp-2">
                    {mealPlan.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-finpay-gray-500 dark:text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(mealPlan.savedAt)}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Nutrition Summary */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="space-y-1">
                  <div className="text-lg font-bold text-finpay-teal-600">
                    {mealPlan.dailyPlan.totalCalories}
                  </div>
                  <div className="text-xs text-finpay-gray-500 dark:text-muted-foreground">
                    Calories
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-finpay-blue-600">
                    {mealPlan.dailyPlan.totalProtein}g
                  </div>
                  <div className="text-xs text-finpay-gray-500 dark:text-muted-foreground">
                    Protein
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-lg font-bold text-finpay-purple-600">
                    {mealPlan.dailyPlan.totalCarbs}g
                  </div>
                  <div className="text-xs text-finpay-gray-500 dark:text-muted-foreground">
                    Carbs
                  </div>
                </div>
              </div>

              {/* Meals Preview */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-finpay-gray-700 dark:text-foreground">
                  Meals ({mealPlan.meals.length}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {mealPlan.meals.slice(0, 4).map((meal, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {meal.type}
                    </Badge>
                  ))}
                  {mealPlan.meals.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{mealPlan.meals.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Dialog modal={false}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      className="finpay-button-accent flex-1"
                      onClick={() => setSelectedMealPlan(mealPlan)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="flex flex-row items-center justify-between">
                      <DialogTitle>{mealPlan.title}</DialogTitle>
                      <DialogClose asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                          Close
                        </Button>
                      </DialogClose>
                    </DialogHeader>
                    {selectedMealPlan && (
                      <DailyMealPlanDisplay mealPlan={selectedMealPlan} />
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => printMealPlan(mealPlan)}
                  className="finpay-button-secondary"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => deleteMealPlan(mealPlan.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}