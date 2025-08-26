
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
    <Card className="finpay-card finpay-card-hover">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl md:text-4xl flex items-center justify-center gap-3 font-bold finpay-gradient-text">
          <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-3 rounded-xl shadow-md">
            <Sparkles className="text-white" />
          </div>
          Create Your Recipe
        </CardTitle>
        <CardDescription className="text-lg text-finpay-gray-600">
          Tell us what you have, and we'll whip up a recipe for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(currentOnSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="inputType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-finpay-gray-900">What are you providing?</FormLabel>
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
                        <FormLabel className="font-normal text-base text-finpay-gray-700">
                          Ingredients
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="finishedDish" className="finpay-radio" />
                        </FormControl>
                        <FormLabel className="font-normal text-base text-finpay-gray-700">
                          Finished Dish
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <FormField
                  control={form.control}
                  name="ingredients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-finpay-gray-900">
                        {inputType === 'ingredients' ? 'Ingredients' : 'Finished Dish Name'}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            inputType === "ingredients"
                              ? "e.g., chicken breast, broccoli, soy sauce"
                              : "e.g., Spaghetti Carbonara"
                          }
                          className="finpay-textarea min-h-[120px]"
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
                      <FormLabel className="text-lg font-semibold text-finpay-gray-900">Dietary Preferences (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., vegetarian, gluten-free, low-carb"
                          className="finpay-textarea min-h-[120px]"
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
              <FormLabel className="text-lg font-semibold text-finpay-gray-900">Upload Photos (Optional)</FormLabel>
               <FormDescription className="text-finpay-gray-600">
                You can upload photos of ingredients or a finished dish.
              </FormDescription>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="finpay-input cursor-pointer file:text-finpay-teal-600 file:font-semibold hover:bg-finpay-gray-100 transition-all duration-300"
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
                    <FormLabel className="text-lg font-semibold text-finpay-gray-900">What's in the photos?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col md:flex-row gap-4"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ingredients" className="finpay-radio" />
                          </FormControl>
                          <FormLabel className="font-normal text-base text-finpay-gray-700">
                            Individual Ingredients
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="finishedDish" className="finpay-radio" />
                          </FormControl>
                          <FormLabel className="font-normal text-base text-finpay-gray-700">
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
                <FormLabel className="text-md font-semibold text-finpay-gray-900">Image Previews:</FormLabel>
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
                    <Sparkles className="mr-2 h-6 w-6 animate-pulse" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-6 w-6" />
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
