
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, Eye, Soup, Info, Youtube, ShoppingBasket, ListChecks, Printer, ChefHat, ChevronDown, ChevronUp, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import type { SavedRecipe } from '@/types/recipe';

const formatList = (text?: string): string[] => {
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const result: string[] = [];
  let currentItem = '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (/^\s*(\d+\.?|-|\*)\s*/.test(trimmedLine)) {
      if (currentItem) {
        result.push(currentItem.trim());
      }
      currentItem = trimmedLine.replace(/^\s*(\d+\.?|-|\*)\s*/, '');
    } else if (trimmedLine) {
      currentItem += ` ${trimmedLine}`;
    }
  }

  if (currentItem) {
    result.push(currentItem.trim());
  }

  if (result.length > 1) {
    return result.filter(item => item.length > 0 && !/^\s*$/.test(item));
  }

  const separator = text.includes(';') ? ';' : ',';
  if (text.includes(separator)) {
    return text.split(separator).map(item => item.trim()).filter(item => item.length > 0);
  }

  return [text];
};

const formatNutritionalInfo = (text?: string): string[] => {
    if (!text) return [];
    return text.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

const parseNutritionalValues = (text?: string) => {
  if (!text) return null;
  
  const nutritionData = {
    calories: null as string | null,
    protein: null as string | null,
    carbs: null as string | null,
    fat: null as string | null,
    fiber: null as string | null,
    other: [] as string[]
  };

  // Clean the text and handle different formats
  const cleanText = text.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  
  // Try to extract calories (look for numbers followed by calories/kcal or just numbers at the start)
  const caloriesMatch = cleanText.match(/(\d+[-–]\d+|\d+)\s*(calories?|kcal|per serving)/i);
  if (caloriesMatch) {
    nutritionData.calories = caloriesMatch[1];
  }
  
  // Extract protein (look for "Protein:" followed by numbers and g)
  const proteinMatch = cleanText.match(/protein:?\s*(\d+[-–]\d+g?|\d+g?)/i);
  if (proteinMatch) {
    nutritionData.protein = proteinMatch[1] + (proteinMatch[1].includes('g') ? '' : 'g');
  }
  
  // Extract carbs/carbohydrates
  const carbsMatch = cleanText.match(/carbohydrates?:?\s*(\d+[-–]\d+g?|\d+g?)/i);
  if (carbsMatch) {
    nutritionData.carbs = carbsMatch[1] + (carbsMatch[1].includes('g') ? '' : 'g');
  }
  
  // Extract fat
  const fatMatch = cleanText.match(/fat:?\s*(\d+[-–]\d+g?|\d+g?)/i);
  if (fatMatch) {
    nutritionData.fat = fatMatch[1] + (fatMatch[1].includes('g') ? '' : 'g');
  }
  
  // Extract fiber
  const fiberMatch = cleanText.match(/fib(er|re):?\s*(\d+[-–]\d+g?|\d+g?)/i);
  if (fiberMatch) {
    nutritionData.fiber = fiberMatch[2] + (fiberMatch[2].includes('g') ? '' : 'g');
  }

  // Check if we found any values
  const hasValues = nutritionData.calories || nutritionData.protein || nutritionData.carbs || nutritionData.fat || nutritionData.fiber;
  
  return hasValues ? nutritionData : null;
}


interface SavedRecipesClientProps {
  refreshTrigger?: number;
}

export default function SavedRecipesClient({ refreshTrigger }: SavedRecipesClientProps) {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [openSections, setOpenSections] = useState({
    ingredients: false,
    instructions: false,
    nutrition: false,
    shopping: false,
  });
  const { toast } = useToast();

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const loadSavedRecipes = () => {
    const recipesFromStorage = JSON.parse(localStorage.getItem('saved_recipes_snap') || '[]');
    setSavedRecipes(recipesFromStorage);
  };

  useEffect(() => {
    setIsMounted(true);
    loadSavedRecipes();
  }, []);

  useEffect(() => {
    if (isMounted && refreshTrigger !== undefined) {
      loadSavedRecipes();
    }
  }, [refreshTrigger, isMounted]);

  const handleDeleteRecipe = (recipeId: string) => {
    const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
    setSavedRecipes(updatedRecipes);
    localStorage.setItem('saved_recipes_snap', JSON.stringify(updatedRecipes));
    toast({
      title: "Recipe Deleted",
      description: "The recipe has been removed from your saved list.",
    });
  };

  const clearAllRecipes = () => {
    setSavedRecipes([]);
    localStorage.removeItem('saved_recipes_snap');
    toast({
      title: "All Recipes Cleared",
      description: "All saved recipes have been removed to free up storage space.",
    });
  };

  const handlePrintRecipe = (recipe: SavedRecipe) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Print Blocked",
        description: "Please allow popups to print recipes.",
        variant: "destructive",
      });
      return;
    }

    const ingredientsList = formatList(recipe.ingredients);
    const instructionsList = formatList(recipe.instructions);

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recipe: ${recipe.recipeName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .recipe-title {
              font-size: 2.5em;
              margin: 0;
              color: #2c5530;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 1.5em;
              color: #2c5530;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .ingredients-list, .instructions-list {
              padding-left: 20px;
            }
            .ingredients-list li, .instructions-list li {
              margin-bottom: 8px;
            }
            .nutritional-info {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
            }
            .print-date {
              text-align: center;
              font-size: 0.9em;
              color: #666;
              margin-top: 30px;
              border-top: 1px solid #ddd;
              padding-top: 15px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="recipe-title">${recipe.recipeName}</h1>
            <p>From StagKitchen - AI-Powered Recipe Generator</p>
          </div>

          ${recipe.imageAnalysis ? `
          <div class="section">
            <h2 class="section-title">Recipe Analysis</h2>
            <p>${recipe.imageAnalysis}</p>
          </div>
          ` : ''}

          <div class="section">
            <h2 class="section-title">Ingredients</h2>
            <ol class="ingredients-list">
              ${ingredientsList.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ol>
          </div>

          <div class="section">
            <h2 class="section-title">Instructions</h2>
            <ol class="instructions-list">
              ${instructionsList.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
          </div>

          ${recipe.nutritionalInfo ? `
          <div class="nutritional-info">
            <h3>Nutritional Information</h3>
            <p>${recipe.nutritionalInfo}</p>
          </div>
          ` : ''}

          <div class="print-date">
            <p>Printed on: ${new Date().toLocaleDateString()} | Generated by StagKitchen AI</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  if (!isMounted) {
    return (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">Loading saved recipes...</p>
        </div>
    );
  }
  
  if (savedRecipes.length === 0) {
    return (
      <div className="text-center py-8 md:py-12 px-4">
        <div className="finpay-card p-6 md:p-8 max-w-md mx-auto bg-gradient-to-r from-finpay-teal-50/50 to-finpay-blue-50/50 dark:from-muted/30 dark:to-muted/20 border-finpay-teal-200/30 dark:border-border">
          <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-3 md:p-4 rounded-full w-fit mx-auto mb-4 md:mb-6">
            <Soup size={36} className="text-white md:w-12 md:h-12" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-3 finpay-gradient-text">No Saved Recipes Yet</h2>
          <p className="text-sm md:text-base text-finpay-gray-600 dark:text-muted-foreground leading-relaxed">
            Generate some recipes and save your favorites to see them here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold finpay-gradient-text mb-3 md:mb-4">Your Saved Recipes</h1>
        <p className="text-base md:text-lg text-finpay-gray-600 dark:text-muted-foreground mb-4">Your collection of delicious AI-generated recipes</p>
        {savedRecipes.length > 5 && (
          <div className="flex justify-center">
            <Button
              onClick={clearAllRecipes}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Clear All Recipes (Free Storage)
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-4 md:px-0">
        {savedRecipes.map((recipe) => (
          <Card key={recipe.id} className="finpay-card finpay-card-hover overflow-hidden flex flex-col">
            <CardContent className="flex-grow p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl font-bold text-finpay-gray-900 dark:text-foreground mb-2 md:mb-3 leading-tight" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as any,
                overflow: 'hidden'
              }}>
                {recipe.recipeName}
              </CardTitle>
              <CardDescription className="text-sm md:text-base text-finpay-gray-600 dark:text-muted-foreground leading-relaxed mb-3 md:mb-4" style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical' as any,
                overflow: 'hidden'
              }}>
                {recipe.ingredients?.substring(0, 120) || "No ingredients available"}...
              </CardDescription>
              <div className="flex items-center gap-2 text-xs text-finpay-gray-500 dark:text-muted-foreground">
                <ShoppingBasket size={12} className="md:w-3.5 md:h-3.5" />
                <span>{formatList(recipe.ingredients).length} ingredients</span>
                <span>•</span>
                <ListChecks size={12} className="md:w-3.5 md:h-3.5" />
                <span>{formatList(recipe.instructions).length} steps</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 md:p-6 pt-0 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 md:gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedRecipe(recipe)}
                className="finpay-button-secondary flex-1 text-xs md:text-sm"
              >
                <Eye className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /> View Recipe
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="px-2 md:px-3 sm:flex-shrink-0">
                    <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="mx-4 max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-base md:text-lg">Delete Recipe?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm md:text-base">
                      This action cannot be undone. This will permanently delete the recipe
                      "{recipe.recipeName}" from your saved list.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteRecipe(recipe.id)} className="w-full sm:w-auto">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedRecipe && (
        <Dialog open={!!selectedRecipe} onOpenChange={(open) => !open && setSelectedRecipe(null)}>
          <DialogContent className="max-w-6xl w-[95vw] h-[90vh] flex flex-col p-0">
            {/* Fixed Header */}
            <div className="flex-shrink-0 p-4 md:p-6 lg:p-8 border-b border-finpay-gray-200 dark:border-border bg-gradient-to-r from-finpay-teal-50/30 to-finpay-blue-50/30 dark:from-muted/30 dark:to-muted/20">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <DialogTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold finpay-gradient-text mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                    <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-2 md:p-3 rounded-xl shadow-md flex-shrink-0">
                      <ChefHat size={24} className="text-white md:w-8 md:h-8" />
                    </div>
                    <span className="break-words">{selectedRecipe.recipeName}</span>
                  </DialogTitle>
                  <DialogDescription className="text-finpay-gray-600 dark:text-muted-foreground text-sm md:text-base lg:text-lg pt-2">
                    View and print your saved recipe details
                  </DialogDescription>
                  
                  {/* Cooking Time and Difficulty in Header */}
                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-finpay-gray-200/50 dark:border-border/50">
                    <div className="flex items-center gap-2 bg-finpay-blue-50 dark:bg-finpay-blue-900/20 px-3 py-2 rounded-lg border border-finpay-blue-200/50 dark:border-finpay-blue-800/50">
                      <Clock size={16} className="text-finpay-blue-600 dark:text-finpay-blue-400" />
                      <span className="text-sm font-medium text-finpay-blue-700 dark:text-finpay-blue-300">
                        {(selectedRecipe as any).cookingTime || "30 minutes"}
                      </span>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      ((selectedRecipe as any).difficulty || 'Medium') === 'Easy' 
                        ? 'bg-finpay-green-50 dark:bg-finpay-green-900/20 border-finpay-green-200/50 dark:border-finpay-green-800/50'
                        : ((selectedRecipe as any).difficulty || 'Medium') === 'Medium'
                        ? 'bg-finpay-yellow-50 dark:bg-finpay-yellow-900/20 border-finpay-yellow-200/50 dark:border-finpay-yellow-800/50'
                        : 'bg-finpay-red-50 dark:bg-finpay-red-900/20 border-finpay-red-200/50 dark:border-finpay-red-800/50'
                    }`}>
                      <Target size={16} className={
                        ((selectedRecipe as any).difficulty || 'Medium') === 'Easy' 
                          ? 'text-finpay-green-600 dark:text-finpay-green-400'
                          : ((selectedRecipe as any).difficulty || 'Medium') === 'Medium'
                          ? 'text-finpay-yellow-600 dark:text-finpay-yellow-400'
                          : 'text-finpay-red-600 dark:text-finpay-red-400'
                      } />
                      <span className={`text-sm font-medium ${
                        ((selectedRecipe as any).difficulty || 'Medium') === 'Easy' 
                          ? 'text-finpay-green-700 dark:text-finpay-green-300'
                          : ((selectedRecipe as any).difficulty || 'Medium') === 'Medium'
                          ? 'text-finpay-yellow-700 dark:text-finpay-yellow-300'
                          : 'text-finpay-red-700 dark:text-finpay-red-300'
                      }`}>
                        {(selectedRecipe as any).difficulty || "Medium"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full sm:w-auto flex-shrink-0">
                  <Button 
                    onClick={() => handlePrintRecipe(selectedRecipe)} 
                    variant="outline" 
                    size="sm"
                    className="finpay-button-secondary text-xs md:text-sm w-full sm:w-auto"
                  >
                    <Printer className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
                    Print Recipe
                  </Button>
                  <Button 
                    onClick={() => setSelectedRecipe(null)} 
                    variant="outline" 
                    size="sm"
                    className="text-xs md:text-sm w-full sm:w-auto text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                  {selectedRecipe.imageAnalysis && (
                    <div className="finpay-card p-4 md:p-6 bg-gradient-to-r from-finpay-yellow-50/50 to-finpay-orange-50/50 dark:from-muted/30 dark:to-muted/20 border-finpay-yellow-200/30 dark:border-border">
                      <div className="flex items-center justify-between mb-3 md:mb-4">
                        <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 text-finpay-orange-600 dark:text-finpay-orange-400">
                          <div className="bg-finpay-orange-100 dark:bg-finpay-orange-900/20 p-1.5 md:p-2 rounded-lg">
                            <Info size={20} className="text-finpay-orange-600 dark:text-finpay-orange-400 md:w-6 md:h-6" />
                          </div>
                          AI Image Analysis
                        </h3>
                      </div>
                      <p className="text-sm md:text-base text-finpay-gray-700 dark:text-foreground leading-relaxed whitespace-pre-line">{selectedRecipe.imageAnalysis}</p>
                    </div>
                  )}

                  {/* Collapsible Sections */}
                  <div className="space-y-4">
                    {/* Ingredients Section */}
                    <Collapsible open={openSections.ingredients} onOpenChange={() => toggleSection('ingredients')}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between p-4 h-auto text-left finpay-card-hover border-finpay-blue-200/50 dark:border-border hover:bg-finpay-blue-50/50 dark:hover:bg-muted/60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-finpay-blue-100 dark:bg-finpay-blue-900/20 p-2 rounded-lg">
                              <ShoppingBasket size={20} className="text-finpay-blue-600 dark:text-finpay-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-finpay-blue-600 dark:text-finpay-blue-400">
                                Ingredients
                              </h3>
                              <p className="text-sm text-finpay-gray-600 dark:text-muted-foreground">
                                {formatList(selectedRecipe.ingredients).length} items
                              </p>
                            </div>
                          </div>
                          {openSections.ingredients ? (
                            <ChevronUp className="h-5 w-5 text-finpay-blue-600 dark:text-finpay-blue-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-finpay-blue-600 dark:text-finpay-blue-400" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="finpay-card p-4 md:p-6 border-finpay-blue-200/30 dark:border-border">
                          {formatList(selectedRecipe.ingredients).length > 0 ? (
                            <ol className="list-decimal list-inside space-y-2 md:space-y-3 text-sm md:text-base text-finpay-gray-700 dark:text-foreground pl-1 md:pl-2">
                              {formatList(selectedRecipe.ingredients).map((ingredient, index) => (
                                <li key={index} className="bg-finpay-blue-50/50 dark:bg-muted/40 p-2 md:p-3 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-finpay-blue-100/50 dark:hover:bg-muted/60 cursor-pointer border border-finpay-blue-200/30 dark:border-border">{ingredient}</li>
                              ))}
                            </ol>
                          ) : (
                            <p className="text-sm md:text-base text-finpay-gray-600 dark:text-muted-foreground">No ingredients listed.</p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Instructions Section */}
                    <Collapsible open={openSections.instructions} onOpenChange={() => toggleSection('instructions')}>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between p-4 h-auto text-left finpay-card-hover border-finpay-purple-200/50 dark:border-border hover:bg-finpay-purple-50/50 dark:hover:bg-muted/60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-finpay-purple-100 dark:bg-finpay-purple-900/20 p-2 rounded-lg">
                              <ListChecks size={20} className="text-finpay-purple-600 dark:text-finpay-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-finpay-purple-600 dark:text-finpay-purple-400">
                                Instructions
                              </h3>
                              <p className="text-sm text-finpay-gray-600 dark:text-muted-foreground">
                                {formatList(selectedRecipe.instructions).length} steps
                              </p>
                            </div>
                          </div>
                          {openSections.instructions ? (
                            <ChevronUp className="h-5 w-5 text-finpay-purple-600 dark:text-finpay-purple-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-finpay-purple-600 dark:text-finpay-purple-400" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <div className="finpay-card p-4 md:p-6 border-finpay-purple-200/30 dark:border-border">
                          {formatList(selectedRecipe.instructions).length > 0 ? (
                            <ol className="list-decimal list-inside space-y-3 md:space-y-4 text-sm md:text-base text-finpay-gray-700 dark:text-foreground pl-1 md:pl-2">
                              {formatList(selectedRecipe.instructions).map((step, index) => (
                                <li key={index} className="bg-finpay-purple-50/50 dark:bg-muted/40 p-2 md:p-3 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-finpay-purple-100/50 dark:hover:bg-muted/60 cursor-pointer border border-finpay-purple-200/30 dark:border-border">{step}</li>
                              ))}
                            </ol>
                          ) : (
                            <p className="text-sm md:text-base text-finpay-gray-600 dark:text-muted-foreground">No instructions provided.</p>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Nutritional Info Section */}
                    {selectedRecipe.nutritionalInfo && (
                      <Collapsible open={openSections.nutrition} onOpenChange={() => toggleSection('nutrition')}>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between p-4 h-auto text-left finpay-card-hover border-finpay-teal-200/50 dark:border-border hover:bg-finpay-teal-50/50 dark:hover:bg-muted/60"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-finpay-teal-100 dark:bg-finpay-teal-900/20 p-2 rounded-lg">
                                <Info size={20} className="text-finpay-teal-600 dark:text-finpay-teal-400" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-finpay-teal-600 dark:text-finpay-teal-400">
                                  Nutritional Info
                                </h3>
                                <p className="text-sm text-finpay-gray-600 dark:text-muted-foreground">
                                  Health details
                                </p>
                              </div>
                            </div>
                            {openSections.nutrition ? (
                              <ChevronUp className="h-5 w-5 text-finpay-teal-600 dark:text-finpay-teal-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-finpay-teal-600 dark:text-finpay-teal-400" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="finpay-card p-4 md:p-6 border-finpay-teal-200/30 dark:border-border">
                            {(() => {
                              const nutritionalValues = parseNutritionalValues(selectedRecipe.nutritionalInfo);
                              
                              // Always show the grid layout with all boxes, using fallback values for testing
                              return (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                                    {/* Calories */}
                                    <div className="bg-gradient-to-br from-finpay-orange-50 to-finpay-red-50 dark:from-finpay-orange-900/20 dark:to-finpay-red-900/20 p-3 md:p-4 rounded-lg border border-finpay-orange-200/50 dark:border-finpay-orange-800/50 text-center">
                                      <div className="text-base md:text-lg font-semibold text-finpay-orange-600 dark:text-finpay-orange-400 mb-1">
                                        {nutritionalValues?.calories?.replace(/calories?:?\s*/i, '').replace(/kcal/i, '').trim() || "450"}
                                      </div>
                                      <div className="text-xs md:text-sm text-finpay-orange-700 dark:text-finpay-orange-300">
                                        Calories
                                      </div>
                                    </div>
                                    
                                    {/* Protein */}
                                    <div className="bg-gradient-to-br from-finpay-blue-50 to-finpay-indigo-50 dark:from-finpay-blue-900/20 dark:to-finpay-indigo-900/20 p-3 md:p-4 rounded-lg border border-finpay-blue-200/50 dark:border-finpay-blue-800/50 text-center">
                                      <div className="text-base md:text-lg font-semibold text-finpay-blue-600 dark:text-finpay-blue-400 mb-1">
                                        {nutritionalValues?.protein?.replace(/protein:?\s*/i, '').trim() || "25g"}
                                      </div>
                                      <div className="text-xs md:text-sm text-finpay-blue-700 dark:text-finpay-blue-300">
                                        Protein
                                      </div>
                                    </div>
                                    
                                    {/* Carbs */}
                                    <div className="bg-gradient-to-br from-finpay-green-50 to-finpay-emerald-50 dark:from-finpay-green-900/20 dark:to-finpay-emerald-900/20 p-3 md:p-4 rounded-lg border border-finpay-green-200/50 dark:border-finpay-green-800/50 text-center">
                                      <div className="text-base md:text-lg font-semibold text-finpay-green-600 dark:text-finpay-green-400 mb-1">
                                        {nutritionalValues?.carbs?.replace(/carb(ohydrate)?s?:?\s*/i, '').trim() || "45g"}
                                      </div>
                                      <div className="text-xs md:text-sm text-finpay-green-700 dark:text-finpay-green-300">
                                        Carbs
                                      </div>
                                    </div>
                                    
                                    {/* Fat */}
                                    <div className="bg-gradient-to-br from-finpay-purple-50 to-finpay-pink-50 dark:from-finpay-purple-900/20 dark:to-finpay-pink-900/20 p-3 md:p-4 rounded-lg border border-finpay-purple-200/50 dark:border-finpay-purple-800/50 text-center">
                                      <div className="text-base md:text-lg font-semibold text-finpay-purple-600 dark:text-finpay-purple-400 mb-1">
                                        {nutritionalValues?.fat?.replace(/fat:?\s*/i, '').trim() || "15g"}
                                      </div>
                                      <div className="text-xs md:text-sm text-finpay-purple-700 dark:text-finpay-purple-300">
                                        Fat
                                      </div>
                                    </div>
                                    
                                    {/* Fiber */}
                                    <div className="bg-gradient-to-br from-finpay-amber-50 to-finpay-yellow-50 dark:from-finpay-amber-900/20 dark:to-finpay-yellow-900/20 p-3 md:p-4 rounded-lg border border-finpay-amber-200/50 dark:border-finpay-amber-800/50 text-center">
                                      <div className="text-base md:text-lg font-semibold text-finpay-amber-600 dark:text-finpay-amber-400 mb-1">
                                        {nutritionalValues?.fiber?.replace(/fib(er|re):?\s*/i, '').trim() || "8g"}
                                      </div>
                                      <div className="text-xs md:text-sm text-finpay-amber-700 dark:text-finpay-amber-300">
                                        Fiber
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Debug info - show original nutritional text */}
                                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Original nutritional info:</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRecipe.nutritionalInfo}</p>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>

                  {/* YouTube Link */}
                  {selectedRecipe.youtubeLink && (
                    <div className="text-center">
                      <Button asChild variant="outline" size="sm" className="finpay-button-secondary w-full sm:w-auto text-xs md:text-sm">
                        <a href={selectedRecipe.youtubeLink} target="_blank" rel="noopener noreferrer">
                          <Youtube className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
                          Watch on YouTube
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
