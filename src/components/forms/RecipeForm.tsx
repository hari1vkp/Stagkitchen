
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { GenerateRecipeInput } from "@/ai/flows/generate-recipe";

const formSchema = z.object({
  ingredients: z.string().optional(),
  dietaryPreferences: z.string().optional(),
  imageType: z.enum(["ingredients", "finishedDish"]).optional(),
  images: z.array(z.string()).optional(),
  inputType: z.enum(["ingredients", "finishedDish"]).default("ingredients"),
}).refine(data => {
    return !!data.ingredients || (!!data.images && data.images.length > 0);
}, {
    message: "Please provide ingredients, a dish name, or at least one image.",
    path: ["ingredients"],
});

type RecipeFormValues = z.infer<typeof formSchema>;

interface RecipeFormProps {
  onSubmit: (data: GenerateRecipeInput) => void;
  isLoading: boolean;
}

export default function RecipeForm({ onSubmit, isLoading }: RecipeFormProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      dietaryPreferences: "",
      imageType: "ingredients",
      images: [],
      inputType: "ingredients",
    },
  });


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const currentFilesArray = Array.from(files);
      const newPreviews: string[] = [];
      const newFormImages: string[] = [];
      event.target.value = "";

      let filesToProcess = currentFilesArray.length;

      currentFilesArray.forEach(file => {
        if (!file.type.startsWith("image/")) {
          console.warn(`File ${file.name} is not an image and will be skipped.`);
          filesToProcess--;
          if(filesToProcess === 0) {
             const allImages = [...imagePreviews, ...newPreviews];
             setImagePreviews(allImages);
             form.setValue("images", allImages, { shouldValidate: true });
          }
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          newPreviews.push(result);
          newFormImages.push(result);
          
          if (newPreviews.length === filesToProcess) {
             const allImages = [...imagePreviews, ...newPreviews];
             setImagePreviews(allImages);
             form.setValue("images", allImages, { shouldValidate: true });
          }
        };
        reader.onerror = () => {
          console.error("Error reading file:", file.name);
           filesToProcess--;
           if(filesToProcess === 0) {
             const allImages = [...imagePreviews, ...newPreviews];
             setImagePreviews(allImages);
             form.setValue("images", allImages, { shouldValidate: true });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    form.setValue("images", newPreviews, { shouldValidate: true });
  };

  const currentOnSubmit = (values: RecipeFormValues) => {
    onSubmit({ ...values, images: imagePreviews });
  };

  const inputType = form.watch("inputType");

  return (
    <Card className="w-full shadow-2xl bg-card border-border/60">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl flex items-center gap-2 font-bold text-primary">
          <Sparkles className="text-accent" />
          Create Your Recipe
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Tell us what you have, and we'll whip up a recipe for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(currentOnSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="inputType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">What are you providing?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row gap-4 pt-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ingredients" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Ingredients
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="finishedDish" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Finished Dish
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">
                        {inputType === 'ingredients' ? 'Ingredients' : 'Finished Dish Name'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            inputType === "ingredients"
                              ? "e.g., chicken breast, broccoli, soy sauce"
                              : "e.g., Spaghetti Carbonara"
                          }
                          className="min-h-[120px] resize-y bg-input/80"
                          {...field}
                          aria-label={
                            inputType === "ingredients"
                              ? "Ingredients"
                              : "Finished Dish Name"
                          }
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
                          className="min-h-[120px] resize-y bg-input/80"
                          {...field}
                          aria-label="Dietary Preferences"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <FormItem>
              <FormLabel className="text-lg">Upload Photos (Optional)</FormLabel>
               <FormDescription>
                You can upload photos of ingredients or a finished dish.
              </FormDescription>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer file:text-accent file:font-semibold bg-input/80 hover:bg-input/100 transition-colors"
                  aria-label="Upload ingredient images"
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            {imagePreviews.length > 0 && (
              <FormField
                control={form.control}
                name="imageType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg">What's in the photos?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col md:flex-row gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ingredients" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Individual Ingredients
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="finishedDish" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            A Finished Dish
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {imagePreviews.length > 0 && (
              <div>
                <FormLabel className="text-md font-medium">Image Previews:</FormLabel>
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
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
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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

            <Button type="submit" disabled={isLoading || form.formState.isSubmitting} size="lg" className="w-full sm:w-auto text-lg py-6 px-8 shadow-lg shadow-accent/20 bg-accent text-accent-foreground hover:bg-accent/90">
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
