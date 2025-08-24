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
  return text.split(/[\n,]/)
    .map(item => item.replace(/^[\s*-]+/, '').trim())
    .filter(item => item.length > 0);
};

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

  return (
    <Card className="w-full shadow-2xl overflow-hidden bg-card border-border/60">
      <CardHeader className="bg-secondary/30 p-4 md:p-6">
        <CardTitle className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
          <ChefHat size={32} className="text-accent" /> {recipe.recipeName || "Your Delicious Recipe"}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-base pt-1">
          Enjoy this AI-generated culinary creation!
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 md:p-6 grid md:grid-cols-2 gap-6 lg:gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-accent">
              <ShoppingBasket size={24} /> Ingredients
            </h3>
            {ingredientsList.length > 0 ? (
              <ul className="list-disc list-inside space-y-1.5 text-foreground/90 pl-2">
                {ingredientsList.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No ingredients listed.</p>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-accent">
              <ListChecks size={24} /> Instructions
            </h3>
            {instructionsList.length > 0 ? (
              <ol className="list-decimal list-inside space-y-2 text-foreground/90 pl-2">
                {instructionsList.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-muted-foreground">No instructions provided.</p>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          {recipe.photoDataUri ? (
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-lg overflow-hidden shadow-lg self-start">
              <Image
                src={recipe.photoDataUri}
                alt={recipe.recipeName || "Generated Recipe Image"}
                layout="fill"
                objectFit="cover"
                data-ai-hint="dish food"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-lg overflow-hidden shadow-md bg-muted flex items-center justify-center">
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

          {recipe.nutritionalInfo && (
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-accent">
                <Info size={24} /> Nutritional Info
              </h3>
              <p className="text-foreground/90">{recipe.nutritionalInfo}</p>
            </div>
          )}

          {recipe.youtubeLink && (
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-accent">
                <Youtube size={24} /> Watch a Video
              </h3>
              <a href={recipe.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                {recipe.youtubeLink}
              </a>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 md:p-6 bg-secondary/20 border-t">
        <Button onClick={handleSaveRecipe} size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
          <Save className="mr-2 h-5 w-5" />
          Save Recipe
        </Button>
      </CardFooter>
    </Card>
  );
}
