
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, Eye, Soup, Info, Youtube, ShoppingBasket, ListChecks } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import type { SavedRecipe } from '@/types/recipe';

const formatList = (text?: string, isInstructions = false): string[] => {
  if (!text) return [];

  if (isInstructions) {
    // Split by number followed by a period (e.g., "1.", "2."), handling potential newlines
    return text.split(/\s*\d+\.\s*/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && !/^\s*$/.test(item));
  }

  // Handle various delimiters for ingredients and clean up each item
  return text.split(/[\n,]+/)
    .map(item => item.replace(/^[\s*-–—]+/, '').trim())
    .filter(item => item.length > 0 && !/^\s*$/.test(item));
};


export default function SavedRecipesClient() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const recipesFromStorage = JSON.parse(localStorage.getItem('saved_recipes_snap') || '[]');
    setSavedRecipes(recipesFromStorage);
  }, []);

  const handleDeleteRecipe = (recipeId: string) => {
    const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== recipeId);
    setSavedRecipes(updatedRecipes);
    localStorage.setItem('saved_recipes_snap', JSON.stringify(updatedRecipes));
    toast({
      title: "Recipe Deleted",
      description: "The recipe has been removed from your saved list.",
    });
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
      <div className="text-center py-10">
        <Soup size={64} className="mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-primary">No Saved Recipes Yet</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Generate some recipes and save your favorites to see them here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Your Saved Recipes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {savedRecipes.map((recipe) => (
          <Card key={recipe.id} className="flex flex-col bg-card border-border/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="p-0">
              {recipe.photoDataUri ? (
                 <div className="relative w-full h-48 overflow-hidden">
                    <Image src={recipe.photoDataUri} alt={recipe.recipeName || "Recipe image"} fill className="object-cover rounded-t-lg" data-ai-hint="food photography"/>
                  </div>
              ) : (
                <div className="relative w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                   <Image src="https://placehold.co/300x200.png" alt="Placeholder image" width={150} height={100} className="opacity-20" data-ai-hint="food plate cooking"/>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <CardTitle className="text-xl truncate font-semibold">{recipe.recipeName}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground h-10 overflow-hidden mt-1">
                {recipe.ingredients?.substring(0, 70) || "No ingredients preview."}...
              </CardDescription>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4 p-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedRecipe(recipe)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the recipe
                      "{recipe.recipeName}" from your saved list.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteRecipe(recipe.id)}>
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
          <DialogContent className="sm:max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl text-accent">{selectedRecipe.recipeName}</DialogTitle>
              <DialogDescription>
                View your saved recipe details below.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(80vh - 120px)] pr-4">
            <div className="py-4 space-y-4">
              {selectedRecipe.photoDataUri ? (
                <div className="relative w-full aspect-video rounded-md overflow-hidden">
                  <Image src={selectedRecipe.photoDataUri} alt={selectedRecipe.recipeName || "Recipe"} fill className="object-cover" data-ai-hint="delicious food"/>
                </div>
              ) : (
                 <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted flex items-center justify-center">
                   <Image src="https://placehold.co/400x225.png" alt="Placeholder image" width={200} height={112} className="opacity-20" data-ai-hint="recipe placeholder"/>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg mb-2 text-accent flex items-center gap-2"><ShoppingBasket size={20} /> Ingredients:</h3>
                <ul className="list-disc list-inside text-foreground/90 space-y-1">
                  {formatList(selectedRecipe.ingredients).map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-accent flex items-center gap-2"><ListChecks size={20} /> Instructions:</h3>
                <ol className="list-decimal list-inside text-foreground/90 space-y-2">
                  {formatList(selectedRecipe.instructions, true).map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
               {selectedRecipe.nutritionalInfo && (
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-accent flex items-center gap-2"><Info size={20} /> Nutritional Info:</h3>
                  <p className="text-foreground/90">{selectedRecipe.nutritionalInfo}</p>
                </div>
              )}
              {selectedRecipe.youtubeLink && (
                 <div>
                    <Button asChild variant="outline">
                        <a href={selectedRecipe.youtubeLink} target="_blank" rel="noopener noreferrer">
                           <Youtube className="mr-2 h-4 w-4" /> Watch on YouTube
                        </a>
                    </Button>
                </div>
              )}
            </div>
            </ScrollArea>
             <DialogClose asChild>
                <Button type="button" variant="outline" className="mt-4">
                  Close
                </Button>
              </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
