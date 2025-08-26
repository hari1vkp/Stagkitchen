
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
      <CardHeader className="bg-gradient-to-r from-finpay-teal-50/30 to-finpay-blue-50/30 p-6 md:p-8 border-b border-finpay-gray-200">
        <CardTitle className="text-3xl md:text-4xl font-bold finpay-gradient-text flex items-center gap-4">
          <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-3 rounded-xl shadow-md">
            <ChefHat size={32} className="text-white" />
          </div>
          {recipe.recipeName || "Your Delicious Recipe"}
        </CardTitle>
        <CardDescription className="text-finpay-gray-600 text-lg pt-2">
          Enjoy this AI-generated culinary creation!
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-8 lg:order-2">
           {recipe.photoDataUri ? (
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 self-start">
              <Image
                src={recipe.photoDataUri}
                alt={recipe.recipeName || "Generated Recipe Image"}
                fill
                className="object-cover"
                data-ai-hint="dish food"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden shadow-md bg-finpay-gray-100 flex items-center justify-center">
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
            <div className="finpay-card p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-finpay-teal-600">
                <div className="bg-finpay-teal-100 p-2 rounded-lg">
                  <Info size={24} className="text-finpay-teal-600" />
                </div>
                Nutritional Info
              </h3>
              <ul className="space-y-3">
                {nutritionalInfoList.map((info, index) => (
                  <li 
                    key={index} 
                    className="text-finpay-gray-700 bg-finpay-teal-50/50 p-3 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-finpay-teal-100/50 cursor-pointer border border-finpay-teal-200/30"
                  >
                   • {info}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-8 lg:order-1">
          <div className="finpay-card p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-finpay-blue-600">
              <div className="bg-finpay-blue-100 p-2 rounded-lg">
                <ShoppingBasket size={24} className="text-finpay-blue-600" />
              </div>
              Ingredients
            </h3>
            {ingredientsList.length > 0 ? (
              <ol className="list-decimal list-inside space-y-3 text-finpay-gray-700 pl-2">
                {ingredientsList.map((ingredient, index) => (
                  <li key={index} className="bg-finpay-blue-50/50 p-3 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-finpay-blue-100/50 cursor-pointer border border-finpay-blue-200/30">{ingredient}</li>
                ))}
              </ol>
            ) : (
              <p className="text-finpay-gray-600">No ingredients listed.</p>
            )}
          </div>

          <Separator className="bg-finpay-gray-200" />

          <div className="finpay-card p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-3 text-finpay-purple-600">
              <div className="bg-finpay-purple-100 p-2 rounded-lg">
                <ListChecks size={24} className="text-finpay-purple-600" />
              </div>
              Instructions
            </h3>
            {instructionsList.length > 0 ? (
              <ol className="list-decimal list-inside space-y-4 text-finpay-gray-700 pl-2">
                {instructionsList.map((step, index) => (
                  <li key={index} className="bg-finpay-purple-50/50 p-3 rounded-lg transition-all duration-300 ease-in-out hover:scale-105 hover:bg-finpay-purple-100/50 cursor-pointer border border-finpay-purple-200/30">{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-finpay-gray-600">No instructions provided.</p>
            )}
          </div>
        </div>
        
      </CardContent>

      <CardFooter className="p-6 md:p-8 bg-gradient-to-r from-finpay-teal-50/30 to-finpay-blue-50/30 border-t border-finpay-gray-200 flex flex-wrap gap-4 justify-start">
        <Button onClick={handleSaveRecipe} size="lg" className="finpay-button-accent">
          <Save className="mr-2 h-5 w-5" />
          Save Recipe
        </Button>
         {recipe.youtubeLink && (
            <Button asChild variant="outline" size="lg" className="finpay-button-secondary">
              <a href={recipe.youtubeLink} target="_blank" rel="noopener noreferrer">
                <Youtube className="mr-2 h-5 w-5" />
                Watch on YouTube
              </a>
            </Button>
          )}
      </CardFooter>
    </Card>
  );
}
