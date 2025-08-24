
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sparkles, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { GenerateRecipeInput } from "@/ai/flows/generate-recipe";

const formSchema = z.object({
  ingredients: z.string().min(3, {
    message: "Please list at least one ingredient.",
  }),
  dietaryPreferences: z.string().optional(),
});

type RecipeFormValues = z.infer<typeof formSchema>;

interface RecipeFormProps {
  onSubmit: (data: GenerateRecipeInput) => void;
  isLoading: boolean;
}

export default function RecipeForm({ onSubmit, isLoading }: RecipeFormProps) {
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      dietaryPreferences: "",
    },
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  // Storing File objects might be useful for more complex scenarios,
  // but for now, data URIs in imagePreviews are sufficient for submission.
  // const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const currentFilesArray = Array.from(files);
      const newPreviews: string[] = [];

      // Reset input field value to allow re-uploading the same file if removed.
      event.target.value = "";

      currentFilesArray.forEach(file => {
        // Basic check for image type (optional, as accept="image/*" already helps)
        if (!file.type.startsWith("image/")) {
          // Optionally, show an error message to the user
          console.warn(`File ${file.name} is not an image and will be skipped.`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          // Update previews once all selected files are processed
          if (newPreviews.length === currentFilesArray.filter(f => f.type.startsWith("image/")).length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.onerror = () => {
          console.error("Error reading file:", file.name);
          // Optionally, show an error message to the user
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    // If also storing File objects:
    // setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const currentOnSubmit = (values: RecipeFormValues) => {
    onSubmit({ ...values, images: imagePreviews });
  };

  return (
    <Card className="w-full shadow-xl bg-card/50 backdrop-blur-sm border-border/20">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Sparkles className="text-primary" />
          Create Your Recipe
        </CardTitle>
        <CardDescription>
          Tell us what ingredients you have, any dietary preferences, and optionally upload images of your ingredients.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(currentOnSubmit)} className="space-y-6 md:space-y-8">
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Ingredients</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., chicken breast, broccoli, soy sauce, garlic"
                      className="min-h-[100px] resize-y bg-background/70"
                      {...field}
                      aria-label="Ingredients"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dietaryPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Dietary Preferences (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., vegetarian, gluten-free, low-carb"
                      className="min-h-[70px] resize-y bg-background/70"
                      {...field}
                      aria-label="Dietary Preferences"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel className="text-lg">Ingredient Images (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer file:text-primary file:font-semibold"
                  aria-label="Upload ingredient images"
                />
              </FormControl>
              <FormMessage /> {/* For potential future error messages related to file input */}
            </FormItem>

            {imagePreviews.length > 0 && (
              <div>
                <FormLabel className="text-md font-medium">Image Previews:</FormLabel>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="rounded-md object-cover h-full w-full"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" disabled={isLoading || form.formState.isSubmitting} size="lg" className="w-full sm:w-auto text-lg py-6 px-8 shadow-lg shadow-primary/20">
              {isLoading || form.formState.isSubmitting ? (
                <>
                  <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Recipe
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
