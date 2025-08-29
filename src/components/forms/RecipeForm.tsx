
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
    const hasIngredients = !!data.ingredients && data.ingredients.trim().length > 0;
    const hasImages = !!data.images && data.images.length > 0;
    return hasIngredients || hasImages;
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
      
      let filesToProcess = currentFilesArray.length;
      let processedFiles = 0;

      if (filesToProcess === 0) {
        return;
      }

      currentFilesArray.forEach(file => {
        if (!file.type.startsWith("image/")) {
          console.warn(`File ${file.name} is not an image and will be skipped.`);
          processedFiles++;
          if (processedFiles === filesToProcess) {
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
          processedFiles++;
          
          if (processedFiles === filesToProcess) {
            const allImages = [...imagePreviews, ...newPreviews];
            setImagePreviews(allImages);
            form.setValue("images", allImages, { shouldValidate: true });
            
            // Set default imageType if not already set
            if (!form.getValues("imageType") && allImages.length > 0) {
              form.setValue("imageType", "finishedDish", { shouldValidate: true });
            }
          }
        };
        reader.onerror = () => {
          console.error("Error reading file:", file.name);
          processedFiles++;
          if (processedFiles === filesToProcess) {
            const allImages = [...imagePreviews, ...newPreviews];
            setImagePreviews(allImages);
            form.setValue("images", allImages, { shouldValidate: true });
          }
        };
        reader.readAsDataURL(file);
      });
      
      // Clear the input value to allow re-selecting the same files
      event.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newPreviews);
    form.setValue("images", newPreviews, { shouldValidate: true });
  };

  const currentOnSubmit = (values: RecipeFormValues) => {
    console.log('Form submission values:', values);
    console.log('Image previews:', imagePreviews);
    onSubmit({ ...values, images: values.images || imagePreviews });
  };

  const inputType = form.watch("inputType");

  return (
    <Card className="finpay-card finpay-card-hover">
      <CardHeader className="text-center p-4 md:p-6">
        <CardTitle className="text-2xl sm:text-3xl md:text-4xl flex flex-col sm:flex-row items-center justify-center gap-3 font-bold finpay-gradient-text">
          <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-2 md:p-3 rounded-xl shadow-md">
            <Sparkles className="text-white h-5 w-5 md:h-6 md:w-6" />
          </div>
          Create Your Recipe
        </CardTitle>
        <CardDescription className="text-base md:text-lg text-finpay-gray-600 dark:text-muted-foreground px-2">
          Tell us what you have, and we'll whip up a recipe for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(currentOnSubmit)} className="space-y-6 md:space-y-8">
            <FormField
              control={form.control}
              name="inputType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base md:text-lg font-semibold text-finpay-gray-900 dark:text-foreground">What are you providing?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col sm:flex-row gap-4 pt-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ingredients" className="finpay-radio" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm md:text-base text-finpay-gray-700 dark:text-foreground cursor-pointer">
                          Ingredients
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="finishedDish" className="finpay-radio" />
                        </FormControl>
                        <FormLabel className="font-normal text-sm md:text-base text-finpay-gray-700 dark:text-foreground cursor-pointer">
                          Finished Dish
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
               <FormField
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base md:text-lg font-semibold text-finpay-gray-900 dark:text-foreground">
                        {inputType === 'ingredients' ? 'Ingredients' : 'Finished Dish Name'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            inputType === "ingredients"
                              ? "e.g., chicken breast, broccoli, soy sauce"
                              : "e.g., Spaghetti Carbonara"
                          }
                          className="finpay-textarea min-h-[100px] md:min-h-[120px] text-sm md:text-base"
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
                      <FormLabel className="text-base md:text-lg font-semibold text-finpay-gray-900 dark:text-foreground">Dietary Preferences (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., vegetarian, gluten-free, low-carb"
                          className="finpay-textarea min-h-[100px] md:min-h-[120px] text-sm md:text-base"
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
              <FormLabel className="text-base md:text-lg font-semibold text-finpay-gray-900 dark:text-foreground">Upload Photos (Optional)</FormLabel>
               <FormDescription className="text-sm md:text-base text-finpay-gray-600 dark:text-muted-foreground">
                You can upload photos of ingredients or a finished dish.
              </FormDescription>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="finpay-input cursor-pointer file:text-finpay-teal-600 file:font-semibold hover:bg-finpay-gray-100 dark:hover:bg-muted/60 transition-all duration-300 text-sm md:text-base"
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
                  <FormItem className="space-y-4">
                    <FormLabel className="text-base md:text-lg font-semibold text-finpay-gray-900 dark:text-foreground">What's in the photos?</FormLabel>
                    <FormDescription className="text-sm md:text-base text-finpay-gray-600 dark:text-muted-foreground">
                      This helps the AI understand how to analyze your images correctly.
                    </FormDescription>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col gap-4"
                      >
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ingredients" className="finpay-radio mt-1" />
                          </FormControl>
                          <FormLabel className="font-normal text-sm md:text-base text-finpay-gray-700 dark:text-foreground cursor-pointer leading-relaxed">
                            Individual Ingredients (raw items like vegetables, spices, etc.)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="finishedDish" className="finpay-radio mt-1" />
                          </FormControl>
                          <FormLabel className="font-normal text-sm md:text-base text-finpay-gray-700 dark:text-foreground cursor-pointer leading-relaxed">
                            A Finished Dish (cooked food ready to eat)
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
                <FormLabel className="text-sm md:text-base font-semibold text-finpay-gray-900 dark:text-foreground">Image Previews:</FormLabel>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="rounded-lg md:rounded-xl object-cover h-full w-full shadow-md hover:shadow-lg transition-all duration-300"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-5 w-5 md:h-6 md:w-6 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500 hover:bg-red-600"
                        onClick={() => handleRemoveImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <XIcon className="h-3 w-3 md:h-4 md:w-4" />
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
                className="finpay-button-primary text-base md:text-lg py-4 md:py-6 px-8 md:px-12 font-bold w-full sm:w-auto"
              >
                {isLoading || form.formState.isSubmitting ? (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 md:h-6 md:w-6 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                    Generate Recipe
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
