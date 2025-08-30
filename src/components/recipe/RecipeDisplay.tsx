
"use client";

import Image from 'next/image';
import { Save, ShoppingBasket, ListChecks, ChefHat, Info, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Recipe, SavedRecipe } from '@/types/recipe'; // Using defined types
import { useToast } from '@/hooks/use-toast';

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


export default function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  const { toast } = useToast();

  const handleSaveRecipe = () => {
    const savedRecipes: SavedRecipe[] = JSON.parse(localStorage.getItem('saved_recipes_snap') || '[]');
    const newSaveRecipe: SavedRecipe = { ...recipe, id: Date.now().toString() };
    
    if (savedRecipes.find(r => r.recipeName === newSaveRecipe.recipeName)) {
      toast({
        title: "Recipe Already Saved",
        description: `"${recipe.recipeName}" is already in your saved recipes.`,
        variant: "default",
      });
      return;
    }

    savedRecipes.push(newSaveRecipe);
    localStorage.setItem('saved_recipes_snap', JSON.stringify(savedRecipes));
    toast({
      title: "Recipe Saved!",
      description: `"${recipe.recipeName}" has been added to your saved recipes.`,
      variant: "default",
    });
  };

  const ingredientsList = formatList(recipe.ingredients);
  const instructionsList = formatList(recipe.instructions);
  const nutritionalInfoList = formatNutritionalInfo(recipe.nutritionalInfo);

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
      </CardHeader>

      <CardContent className="p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
        {recipe.imageAnalysis && (
          <div className="lg:col-span-2 finpay-card p-4 md:p-6 bg-gradient-to-r from-finpay-yellow-50/50 to-finpay-orange-50/50 dark:from-muted/30 dark:to-muted/20 border-finpay-yellow-200/30 dark:border-border">
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
        
        <div className="space-y-6 md:space-y-8 lg:order-2">
           {recipe.photoDataUri ? (
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 self-start">
              <Image
                src={recipe.photoDataUri}
                alt={recipe.recipeName || "Generated Recipe Image"}
                fill
                className="object-cover"
                data-ai-hint="dish food"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden shadow-md bg-finpay-gray-100 dark:bg-muted flex items-center justify-center">
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

          {nutritionalInfoList.length > 0 && (
            <div className="finpay-card p-4 md:p-6">
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-finpay-teal-600 dark:text-finpay-teal-400">
                <div className="bg-finpay-teal-100 dark:bg-finpay-teal-900/20 p-1.5 md:p-2 rounded-lg">
                  <Info size={20} className="text-finpay-teal-600 dark:text-finpay-teal-400 md:w-6 md:h-6" />
                </div>
                Nutritional Info
              </h3>
              <ul className="space-y-2 md:space-y-3">
                {nutritionalInfoList.map((info, index) => (
                  <li 
                    key={index} 
                    className="text-sm md:text-base text-finpay-gray-700 dark:text-foreground bg-finpay-teal-50/50 dark:bg-muted/40 p-2 md:p-3 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-finpay-teal-100/50 dark:hover:bg-muted/60 cursor-pointer border border-finpay-teal-200/30 dark:border-border"
                  >
                   • {info}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6 md:space-y-8 lg:order-1">
          <div className="finpay-card p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-finpay-blue-600 dark:text-finpay-blue-400">
              <div className="bg-finpay-blue-100 dark:bg-finpay-blue-900/20 p-1.5 md:p-2 rounded-lg">
                <ShoppingBasket size={20} className="text-finpay-blue-600 dark:text-finpay-blue-400 md:w-6 md:h-6" />
              </div>
              Ingredients
            </h3>
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

          <Separator className="bg-finpay-gray-200 dark:bg-border" />

          <div className="finpay-card p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2 md:gap-3 text-finpay-purple-600 dark:text-finpay-purple-400">
              <div className="bg-finpay-purple-100 dark:bg-finpay-purple-900/20 p-1.5 md:p-2 rounded-lg">
                <ListChecks size={20} className="text-finpay-purple-600 dark:text-finpay-purple-400 md:w-6 md:h-6" />
              </div>
              Instructions
            </h3>
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
        </div>
        
      </CardContent>

      <CardFooter className="p-4 md:p-6 lg:p-8 bg-gradient-to-r from-finpay-teal-50/30 to-finpay-blue-50/30 dark:from-muted/30 dark:to-muted/20 border-t border-finpay-gray-200 dark:border-border flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 justify-start">
        <Button onClick={handleSaveRecipe} size="sm" className="finpay-button-accent w-full sm:w-auto text-xs md:text-sm">
          <Save className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
          Save Recipe
        </Button>
         {recipe.youtubeLink && (
            <Button asChild variant="outline" size="sm" className="finpay-button-secondary w-full sm:w-auto text-xs md:text-sm">
              <a href={recipe.youtubeLink} target="_blank" rel="noopener noreferrer">
                <Youtube className="mr-1 md:mr-2 h-4 w-4 md:h-5 md:w-5" />
                Watch on YouTube
              </a>
            </Button>
          )}
      </CardFooter>
    </Card>
  );
}
