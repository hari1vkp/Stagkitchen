
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Save, ShoppingBasket, ListChecks, ChefHat, Info, Youtube, ChevronDown, ChevronUp, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Recipe, SavedRecipe } from '@/types/recipe'; // Using defined types
import { useToast } from '@/hooks/use-toast';
import ShoppingList from './ShoppingList';

interface RecipeDisplayProps {
  recipe: Recipe;
}

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


export default function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState({
    ingredients: false,
    instructions: false,
    nutrition: false,
    shopping: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSaveRecipe = () => {
    try {
      const savedRecipes: SavedRecipe[] = JSON.parse(localStorage.getItem('saved_recipes_snap') || '[]');
      
      // Check if recipe already exists
      if (savedRecipes.find(r => r.recipeName === recipe.recipeName)) {
        toast({
          title: "Recipe Already Saved",
          description: `"${recipe.recipeName}" is already in your saved recipes.`,
          variant: "default",
        });
        return;
      }

      // Create optimized recipe for storage (remove large image data)
      const optimizedRecipe: SavedRecipe = {
        ...recipe,
        id: Date.now().toString(),
        // Remove or compress the large image data to save space
        photoDataUri: undefined, // Remove image to save localStorage space
      };

      // Check localStorage space before saving
      const testData = JSON.stringify([...savedRecipes, optimizedRecipe]);
      
      try {
        // Test if we can save this data
        localStorage.setItem('saved_recipes_snap_test', testData);
        localStorage.removeItem('saved_recipes_snap_test');
        
        // If test succeeds, save the actual data
        savedRecipes.push(optimizedRecipe);
        localStorage.setItem('saved_recipes_snap', JSON.stringify(savedRecipes));
        
        toast({
          title: "Recipe Saved!",
          description: `"${recipe.recipeName}" has been added to your saved recipes.`,
          variant: "default",
        });
      } catch (quotaError) {
        // If still too large, try cleaning up old recipes
        if (savedRecipes.length > 10) {
          // Remove oldest recipes to make space
          const recentRecipes = savedRecipes.slice(-10);
          recentRecipes.push(optimizedRecipe);
          localStorage.setItem('saved_recipes_snap', JSON.stringify(recentRecipes));
          
          toast({
            title: "Recipe Saved!",
            description: `"${recipe.recipeName}" has been saved. Older recipes were removed to free up space.`,
            variant: "default",
          });
        } else {
          throw quotaError;
        }
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast({
        title: "Storage Full",
        description: "Unable to save recipe. Your browser storage is full. Try clearing some saved recipes.",
        variant: "destructive",
      });
    }
  };

  const ingredientsList = formatList(recipe.ingredients);
  const instructionsList = formatList(recipe.instructions);
  const nutritionalInfoList = formatNutritionalInfo(recipe.nutritionalInfo);
  const nutritionalValues = parseNutritionalValues(recipe.nutritionalInfo);

  return (
    <Card className="finpay-card finpay-card-hover overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-finpay-teal-50/30 to-finpay-blue-50/30 dark:from-muted/30 dark:to-muted/20 p-4 md:p-6 lg:p-8 border-b border-finpay-gray-200 dark:border-border">
        <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold finpay-gradient-text flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-2 md:p-3 rounded-xl shadow-md flex-shrink-0">
            <ChefHat size={24} className="text-white md:w-8 md:h-8" />
          </div>
          <span className="break-words">{recipe.recipeName || "Your Delicious Recipe"}</span>
        </CardTitle>
        <CardDescription className="text-finpay-gray-600 dark:text-muted-foreground text-sm md:text-base lg:text-lg pt-2">
          Enjoy this AI-generated culinary creation!
        </CardDescription>
        
        {/* Cooking Time and Difficulty in Header - Always show for testing */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-finpay-gray-200/50 dark:border-border/50">
          <div className="flex items-center gap-2 bg-finpay-blue-50 dark:bg-finpay-blue-900/20 px-3 py-2 rounded-lg border border-finpay-blue-200/50 dark:border-finpay-blue-800/50">
            <Clock size={16} className="text-finpay-blue-600 dark:text-finpay-blue-400" />
            <span className="text-sm font-medium text-finpay-blue-700 dark:text-finpay-blue-300">
              {recipe.cookingTime || "30 minutes"}
            </span>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            (recipe.difficulty || 'Medium') === 'Easy' 
              ? 'bg-finpay-green-50 dark:bg-finpay-green-900/20 border-finpay-green-200/50 dark:border-finpay-green-800/50'
              : (recipe.difficulty || 'Medium') === 'Medium'
              ? 'bg-finpay-yellow-50 dark:bg-finpay-yellow-900/20 border-finpay-yellow-200/50 dark:border-finpay-yellow-800/50'
              : 'bg-finpay-red-50 dark:bg-finpay-red-900/20 border-finpay-red-200/50 dark:border-finpay-red-800/50'
          }`}>
            <Target size={16} className={
              (recipe.difficulty || 'Medium') === 'Easy' 
                ? 'text-finpay-green-600 dark:text-finpay-green-400'
                : (recipe.difficulty || 'Medium') === 'Medium'
                ? 'text-finpay-yellow-600 dark:text-finpay-yellow-400'
                : 'text-finpay-red-600 dark:text-finpay-red-400'
            } />
            <span className={`text-sm font-medium ${
              (recipe.difficulty || 'Medium') === 'Easy' 
                ? 'text-finpay-green-700 dark:text-finpay-green-300'
                : (recipe.difficulty || 'Medium') === 'Medium'
                ? 'text-finpay-yellow-700 dark:text-finpay-yellow-300'
                : 'text-finpay-red-700 dark:text-finpay-red-300'
            }`}>
              {recipe.difficulty || "Medium"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
        {recipe.imageAnalysis && (
          <div className="finpay-card p-4 md:p-6 bg-gradient-to-r from-finpay-yellow-50/50 to-finpay-orange-50/50 dark:from-muted/30 dark:to-muted/20 border-finpay-yellow-200/30 dark:border-border">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-semibold flex items-center gap-2 md:gap-3 text-finpay-orange-600 dark:text-finpay-orange-400">
                <div className="bg-finpay-orange-100 dark:bg-finpay-orange-900/20 p-1.5 md:p-2 rounded-lg">
                  <Info size={20} className="text-finpay-orange-600 dark:text-finpay-orange-400 md:w-6 md:h-6" />
                </div>
                AI Image Analysis
              </h3>
              {recipe.imageAnalysis.includes('CONFIDENCE WARNING') && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-md text-xs font-medium">
                  ⚠️ Low Confidence
                </div>
              )}
            </div>
            <p className="text-sm md:text-base text-finpay-gray-700 dark:text-foreground leading-relaxed whitespace-pre-line">{recipe.imageAnalysis}</p>
          </div>
        )}
        
        {/* Recipe Image */}
        {recipe.photoDataUri ? (
          <div className="relative w-full aspect-video md:aspect-[4/3] max-w-md mx-auto rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <Image
              src={recipe.photoDataUri}
              alt={recipe.recipeName || "Generated Recipe Image"}
              fill
              className="object-cover"
              data-ai-hint="dish food"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-video md:aspect-[4/3] max-w-md mx-auto rounded-xl md:rounded-2xl overflow-hidden shadow-md bg-finpay-gray-100 dark:bg-muted flex items-center justify-center">
            <Image
              src="https://placehold.co/400x300.png"
              alt="Placeholder image"
              width={400}
              height={300}
              className="opacity-20"
              data-ai-hint="food plate"
            />
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
                      {ingredientsList.length} items
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
                {ingredientsList.length > 0 ? (
                  <ol className="list-decimal list-inside space-y-2 md:space-y-3 text-sm md:text-base text-finpay-gray-700 dark:text-foreground pl-1 md:pl-2">
                    {ingredientsList.map((ingredient, index) => (
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
                      {instructionsList.length} steps
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
                {instructionsList.length > 0 ? (
                  <ol className="list-decimal list-inside space-y-3 md:space-y-4 text-sm md:text-base text-finpay-gray-700 dark:text-foreground pl-1 md:pl-2">
                    {instructionsList.map((step, index) => (
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
          {nutritionalInfoList.length > 0 && (
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
                    {recipe.nutritionalInfo && (
                      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Original nutritional info:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{recipe.nutritionalInfo}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Additional nutrition info if any */}
                  {nutritionalValues && nutritionalValues.other.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="text-sm font-medium text-finpay-gray-700 dark:text-foreground">Additional Information:</h4>
                      <div className="flex flex-wrap gap-2">
                        {nutritionalValues.other.map((info, index) => (
                          <div 
                            key={index} 
                            className="text-xs md:text-sm text-finpay-gray-600 dark:text-muted-foreground bg-finpay-gray-50 dark:bg-muted/40 px-3 py-1 rounded-full border border-finpay-gray-200 dark:border-border"
                          >
                            {info}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Shopping List Section */}
          <Collapsible open={openSections.shopping} onOpenChange={() => toggleSection('shopping')}>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between p-4 h-auto text-left finpay-card-hover border-finpay-green-200/50 dark:border-border hover:bg-finpay-green-50/50 dark:hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-finpay-green-100 dark:bg-finpay-green-900/20 p-2 rounded-lg">
                    <ShoppingBasket size={20} className="text-finpay-green-600 dark:text-finpay-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-finpay-green-600 dark:text-finpay-green-400">
                      Shopping List
                    </h3>
                    <p className="text-sm text-finpay-gray-600 dark:text-muted-foreground">
                      Organized by category
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
              <ShoppingList 
                ingredients={recipe.ingredients || ''} 
                recipeName={recipe.recipeName || 'Recipe'} 
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>

      <CardFooter className="p-4 md:p-6 lg:p-8 bg-gradient-to-r from-finpay-teal-50/30 to-finpay-blue-50/30 dark:from-muted/30 dark:to-muted/20 border-t border-finpay-gray-200 dark:border-border flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-start">
        <Button onClick={handleSaveRecipe} size="sm" className="finpay-button-accent w-full sm:w-auto text-xs md:text-sm">
          <Save className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
          Save Recipe
        </Button>
        <Button asChild variant="outline" size="sm" className="finpay-button-secondary w-full sm:w-auto text-xs md:text-sm">
          <a 
            href={recipe.youtubeLink || `https://www.youtube.com/results?search_query=how+to+make+${encodeURIComponent(recipe.recipeName || 'recipe')}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Youtube className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
            Watch on YouTube
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
