"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calendar, Target, Utensils, XIcon, Calculator, Info } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { DailyMealPlanInput } from "@/ai/flows/generate-daily-meal-plan";

const formSchema = z.object({
  ingredients: z.string().min(1, "Please provide at least one ingredient."),
  targetCalories: z.number().min(800).max(5000),
  dietaryPreferences: z.string().optional(),
  fitnessGoal: z.string().optional(),
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

// Calorie calculation using Mifflin-St Jeor Equation
const calculateMaintenanceCalories = (weight: number, height: number, age: number, sex: string, activityLevel: string) => {
  // BMR calculation (Mifflin-St Jeor Equation)
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr = sex === 'male' ? bmr + 5 : bmr - 161;
  
  // Activity multiplier
  const activityMultipliers = {
    'sedentary': 1.2,      // Little or no exercise
    'light': 1.375,        // Light exercise 1-3 days/week
    'moderate': 1.55,      // Moderate exercise 3-5 days/week
    'active': 1.725,       // Hard exercise 6-7 days/week
    'very-active': 1.9     // Very hard exercise, physical job
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers]);
};

export default function DailyMealPlanForm({ onSubmit, isLoading }: DailyMealPlanFormProps) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showCalorieCalculator, setShowCalorieCalculator] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);
  
  const form = useForm<DailyMealPlanFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      targetCalories: 2000,
      dietaryPreferences: "",
      fitnessGoal: "none",
      mealCount: 4,
      images: [],
    },
  });

  const [calculatorForm, setCalculatorForm] = useState({
    weight: '',
    height: '',
    age: '',
    sex: 'male',
    activityLevel: 'moderate'
  });

  const handleCalculatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = parseFloat(calculatorForm.weight);
    const height = parseFloat(calculatorForm.height);
    const age = parseInt(calculatorForm.age);
    
    if (weight && height && age) {
      const calories = calculateMaintenanceCalories(weight, height, age, calculatorForm.sex, calculatorForm.activityLevel);
      setCalculatedCalories(calories);
      form.setValue('targetCalories', calories);
    }
  };

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
                    
                    {/* Calorie Calculator Section */}
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCalorieCalculator(!showCalorieCalculator)}
                        className="finpay-button-secondary text-sm"
                      >
                        <Calculator className="h-4 w-4 mr-2" />
                        {showCalorieCalculator ? 'Hide' : 'Calculate'} Maintenance Calories
                      </Button>
                      
                      {showCalorieCalculator && (
                        <Card className="mt-3 p-4 bg-finpay-gray-50/50 dark:bg-muted/30 border border-finpay-gray-200/30 dark:border-border">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-finpay-gray-900 dark:text-foreground">
                                Calculate Your Daily Calorie Needs
                              </h4>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-finpay-gray-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Uses the Mifflin-St Jeor Equation to calculate your Basal Metabolic Rate (BMR) and applies activity level multipliers.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                placeholder="Weight (kg)"
                                value={calculatorForm.weight}
                                onChange={(e) => setCalculatorForm({...calculatorForm, weight: e.target.value})}
                                className="finpay-input text-sm"
                              />
                              <Input
                                type="number"
                                placeholder="Height (cm)"
                                value={calculatorForm.height}
                                onChange={(e) => setCalculatorForm({...calculatorForm, height: e.target.value})}
                                className="finpay-input text-sm"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                placeholder="Age"
                                value={calculatorForm.age}
                                onChange={(e) => setCalculatorForm({...calculatorForm, age: e.target.value})}
                                className="finpay-input text-sm"
                              />
                              <Select value={calculatorForm.sex} onValueChange={(value) => setCalculatorForm({...calculatorForm, sex: value})}>
                                <SelectTrigger className="finpay-input text-sm h-10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="w-full min-w-[var(--radix-select-trigger-width)]">
                                  <SelectItem value="male" className="text-sm py-2 pl-8 pr-3 cursor-pointer">Male</SelectItem>
                                  <SelectItem value="female" className="text-sm py-2 pl-8 pr-3 cursor-pointer">Female</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <Select value={calculatorForm.activityLevel} onValueChange={(value) => setCalculatorForm({...calculatorForm, activityLevel: value})}>
                              <SelectTrigger className="finpay-input text-sm h-10">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-[250px] w-full min-w-[var(--radix-select-trigger-width)]">
                                <SelectItem value="sedentary" className="text-sm py-2 pl-8 pr-3 cursor-pointer">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Sedentary</span>
                                    <span className="text-xs text-muted-foreground">Little/no exercise</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="light" className="text-sm py-2 pl-8 pr-3 cursor-pointer">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Light</span>
                                    <span className="text-xs text-muted-foreground">1-3 days/week</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="moderate" className="text-sm py-2 pl-8 pr-3 cursor-pointer">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Moderate</span>
                                    <span className="text-xs text-muted-foreground">3-5 days/week</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="active" className="text-sm py-2 pl-8 pr-3 cursor-pointer">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Active</span>
                                    <span className="text-xs text-muted-foreground">6-7 days/week</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="very-active" className="text-sm py-2 pl-8 pr-3 cursor-pointer">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Very Active</span>
                                    <span className="text-xs text-muted-foreground">Physical job</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button
                              type="button"
                              onClick={handleCalculatorSubmit}
                              className="finpay-button-primary text-sm w-full"
                              disabled={!calculatorForm.weight || !calculatorForm.height || !calculatorForm.age}
                            >
                              Calculate Calories
                            </Button>
                            
                            {calculatedCalories && (
                              <div className="text-center p-3 bg-finpay-teal-50 dark:bg-finpay-teal-900/20 rounded-lg border border-finpay-teal-200/30 dark:border-finpay-teal-800/30">
                                <p className="text-sm text-finpay-gray-600 dark:text-muted-foreground">
                                  Your maintenance calories:
                                </p>
                                <p className="text-xl font-bold text-finpay-teal-600 dark:text-finpay-teal-400">
                                  {calculatedCalories} calories/day
                                </p>
                                <p className="text-xs text-finpay-gray-500 dark:text-muted-foreground mt-1">
                                  This has been set as your target calories
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      )}
                    </div>
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
                        <SelectTrigger className="finpay-input h-12 text-sm md:text-base">
                          <SelectValue placeholder="Select meal count" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] w-full min-w-[var(--radix-select-trigger-width)]">
                          <SelectItem value="3" className="text-sm md:text-base py-3 pl-8 pr-4 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-medium">3 meals</span>
                              <span className="text-xs text-muted-foreground">Breakfast, Lunch, Dinner</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="4" className="text-sm md:text-base py-3 pl-8 pr-4 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-medium">4 meals</span>
                              <span className="text-xs text-muted-foreground">Breakfast, Lunch, Dinner, Snack</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="5" className="text-sm md:text-base py-3 pl-8 pr-4 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-medium">5 meals</span>
                              <span className="text-xs text-muted-foreground">Breakfast, Snack, Lunch, Snack, Dinner</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="6" className="text-sm md:text-base py-3 pl-8 pr-4 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-medium">6 meals</span>
                              <span className="text-xs text-muted-foreground">Breakfast, Snack, Lunch, Snack, Dinner, Snack</span>
                            </div>
                          </SelectItem>
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
                      placeholder="e.g., chicken, rice, vegetables..."
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                        placeholder="e.g., vegetarian, gluten-free..."
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

              <FormField
                control={form.control}
                name="fitnessGoal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold text-finpay-gray-900 dark:text-foreground flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Fitness Goal (Optional)
                    </FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="finpay-input h-12 text-sm md:text-base">
                          <SelectValue placeholder="Select your fitness goal" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px] w-full min-w-[var(--radix-select-trigger-width)]">
                          <SelectItem value="none" className="text-sm md:text-base py-3 pl-8 pr-4 cursor-pointer">
                            <span className="font-medium">No specific goal</span>
                          </SelectItem>
                          <SelectItem value="bulking" className="text-sm md:text-base py-3 pl-8 pr-4 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-medium">Bulking</span>
                              <span className="text-xs text-muted-foreground">Build muscle mass & gain weight</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="cutting" className="text-sm md:text-base py-3 pl-8 pr-4 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-medium">Cutting</span>
                              <span className="text-xs text-muted-foreground">Lose fat while preserving muscle</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="recomposition" className="text-sm md:text-base py-3 pl-8 pr-4 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-medium">Body Recomposition</span>
                              <span className="text-xs text-muted-foreground">Build muscle & lose fat simultaneously</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="maintenance" className="text-sm md:text-base py-3 pl-8 pr-4 cursor-pointer">
                            <div className="flex flex-col">
                              <span className="font-medium">Maintenance</span>
                              <span className="text-xs text-muted-foreground">Maintain current weight & fitness</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="text-finpay-gray-600 dark:text-muted-foreground">
                      Your fitness goal helps us optimize macro ratios and meal timing.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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

            <div className="text-center pt-4 px-2">
              <Button 
                type="submit" 
                disabled={isLoading || form.formState.isSubmitting} 
                size="lg" 
                className="finpay-button-primary w-full sm:w-auto text-sm sm:text-lg py-3 sm:py-6 px-6 sm:px-12 font-bold"
              >
                {isLoading || form.formState.isSubmitting ? (
                  <>
                    <Calendar className="mr-2 h-4 w-4 sm:h-6 sm:w-6 animate-pulse" />
                    <span className="text-sm sm:text-xl">Planning...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4 sm:h-6 sm:w-6" />
                    <span className="text-sm sm:text-xl">Generate Daily Meal Plan</span>
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
