"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
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

  const handleSubmit = (values: RecipeFormValues) => {
    onSubmit(values);
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Sparkles className="text-primary" />
          Create Your Recipe
        </CardTitle>
        <CardDescription>
          Tell us what ingredients you have and any dietary preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Ingredients</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., chicken breast, broccoli, soy sauce, garlic"
                      className="min-h-[100px] resize-y"
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
                      className="min-h-[70px] resize-y"
                      {...field}
                      aria-label="Dietary Preferences"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto text-lg py-6 px-8">
              {isLoading ? (
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
