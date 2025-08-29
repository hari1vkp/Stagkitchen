"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Target, Utensils, XIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DailyMealPlanInput } from "@/ai/flows/generate-daily-meal-plan";

const formSchema = z.object({
  ingredients: z.string().min(1, "Please provide at least one ingredient."),
  targetCalories: z.number().min(800).max(5000),
  dietaryPreferences: z.string().optional(),
  mealCount: z.number().min(3).max(6),
  images: z.array(z.string()).optional(),
}).refine(data => {
    return !!data.ingredients;
}, {
    message: "Please provide ingredients for the meal plan.",
    path: ["ingredients"],
});

type DailyMealPlanFormValues = z.infer<typeof formSchema>;

interface DailyMealPlanFormProps {
  onSubmit: (data: DailyMealPlanInput) => void;
  isLoading: boolean;
}

export default function DailyMealPlanForm({ onSubmit, isLoading }: DailyMealPlanFormProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const form = useForm<DailyMealPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      targetCalories: 2000,
      dietaryPreferences: "",
      mealCount: 4,
      images: [],
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

  const currentOnSubmit = (values: DailyMealPlanFormValues) => {
    onSubmit({ ...values, images: imagePreviews });
  };

  return (
    <Card className="finpay-card finpay-card-hover animate-pop">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl md:text-4xl flex items-center justify-center gap-3 font-bold finpay-gradient-text">
          <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-3 rounded-xl shadow-md">
            <Calendar className="text-white" />
          </div>
          Plan Your Day
        </CardTitle>
        <CardDescription className="text-lg text-finpay-gray-600 dark:text-muted-foreground">
          Get a complete daily meal plan using your ingredients and calorie goals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(currentOnSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="targetCalories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-finpay-gray-900 dark:text-foreground flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Daily Calorie Target
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="800"
                        max="5000"
                        className="finpay-input"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="2000"
                      />
                    </FormControl>
                    <FormDescription className="text-finpay-gray-600 dark:text-muted-foreground">
                      Recommended: 1500-2500 calories per day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mealCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-finpay-gray-900 dark:text-foreground flex items-center gap-2">
                      <Utensils className="h-5 w-5" />
                      Meals Per Day
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                        <SelectTrigger className="finpay-input">
                          <SelectValue placeholder="Select meal count" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 meals (Breakfast, Lunch, Dinner)</SelectItem>
                          <SelectItem value="4">4 meals (Breakfast, Lunch, Dinner, Snack)</SelectItem>
                          <SelectItem value="5">5 meals (Breakfast, Snack, Lunch, Snack, Dinner)</SelectItem>
                          <SelectItem value="6">6 meals (Breakfast, Snack, Lunch, Snack, Dinner, Snack)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="text-finpay-gray-600 dark:text-muted-foreground">
                      Choose how many meals you prefer per day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-finpay-gray-900 dark:text-foreground">
                    Available Ingredients
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., chicken breast, broccoli, rice, eggs, spinach, tomatoes, olive oil, garlic, onions"
                      className="finpay-textarea min-h-[120px]"
                      {...field}
                      aria-label="Available ingredients"
                    />
                  </FormControl>
                  <FormDescription className="text-finpay-gray-600 dark:text-muted-foreground">
                    List all ingredients you have available. We'll use these to create your meal plan.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dietaryPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-finpay-gray-900 dark:text-foreground">
                    Dietary Preferences (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., vegetarian, gluten-free, low-carb, dairy-free"
                      className="finpay-textarea min-h-[100px]"
                      {...field}
                      aria-label="Dietary preferences"
                    />
                  </FormControl>
                  <FormDescription className="text-finpay-gray-600 dark:text-muted-foreground">
                    Any dietary restrictions or preferences we should consider.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel className="text-lg font-semibold text-finpay-gray-900 dark:text-foreground">Upload Ingredient Photos (Optional)</FormLabel>
               <FormDescription className="text-finpay-gray-600 dark:text-muted-foreground">
                Upload photos of your ingredients to help us plan better meals.
              </FormDescription>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="finpay-input cursor-pointer file:text-finpay-teal-600 file:font-semibold hover:bg-finpay-gray-100 dark:hover:bg-muted/70 transition-all duration-300"
                  aria-label="Upload ingredient images"
                />
              </FormControl>
              <FormMessage />
            </FormItem>

            {imagePreviews.length > 0 && (
              <div>
                <FormLabel className="text-md font-semibold text-finpay-gray-900 dark:text-foreground">Image Previews:</FormLabel>
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="rounded-xl object-cover h-full w-full shadow-md hover:shadow-lg transition-all duration-300"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500 hover:bg-red-600"
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

            <div className="text-center pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || form.formState.isSubmitting} 
                size="lg" 
                className="finpay-button-primary text-lg py-6 px-12 text-xl font-bold"
              >
                {isLoading || form.formState.isSubmitting ? (
                  <>
                    <Calendar className="mr-2 h-6 w-6 animate-pulse" />
                    Planning...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-6 w-6" />
                    Generate Daily Meal Plan
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
