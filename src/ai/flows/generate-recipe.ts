
//Recipe Snap

'use server';
/**
 * @fileOverview AI agent that generates a cooking recipe based on user-provided ingredients.
 *
 * - generateRecipe - A function that handles the recipe generation process.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available for use in the recipe.'),
  dietaryPreferences: z
    .string()
    .optional()
    .describe('Any dietary restrictions or preferences, e.g., vegetarian, gluten-free.'),
  images: z
    .array(z.string())
    .optional()
    .describe(
      'An array of Base64 encoded image data URIs. The model will try to identify ingredients from these images.'
    ),
  imageType: z
    .enum(['ingredients', 'finishedDish'])
    .optional()
    .describe('Specifies if the images are of "ingredients" or a "finishedDish".'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredients: z.string().describe('A list of ingredients required for the recipe.'),
  instructions: z.string().describe('Step-by-step cooking instructions for the recipe.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of the finished dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'." // keep the backslashes here, they're needed to escape the single quote in the string
    ),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are a world-class chef skilled at creating delicious and innovative recipes.

  You will be provided with a list of ingredients and/or images.

  {{#if images}}
    {{#if (eq imageType "finishedDish")}}
      You have been provided with an image of a finished dish. Analyze the image and generate a recipe to make it. Also consider the additional ingredients listed.
      {{{images}}}
    {{else}}
      You have been provided with the following images. Identify the ingredients from these images first:
      {{{images}}}
    {{/if}}
  {{/if}}

  {{#if ingredients}}
  Consider these ingredients: {{{ingredients}}}
  {{/if}}

  Based on all identified ingredients, create a unique and easy-to-follow recipe.
  Consider any dietary preferences provided: {{{dietaryPreferences}}}

  Format the response as follows:

  Recipe Name: [Recipe Name]
  Ingredients: [List of ingredients with quantities]
  Instructions: [Step-by-step cooking instructions]

  After generating the recipe, create a visually appealing image of the finished dish.
  Please respond with the recipe details and image data URI.`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const promptParts: any[] = [];
    if (input.images && input.images.length > 0) {
      input.images.forEach(imageDataUri => {
        const [header, data] = imageDataUri.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        if (mimeType && data) {
          promptParts.push({inlineData: {data, mimeType}});
        }
      });
    }

    const recipe = await generateRecipePrompt({
      ...input,
      // @ts-ignore
      images: promptParts.length > 0 ? promptParts : undefined, // Pass processed images
    });

    // Generate image in parallel with text
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {
          text: `Generate a photo of the finished ${recipe.output?.recipeName} dish.`,
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    // console.log(media.url);

    return {
      recipeName: recipe.output!.recipeName,
      ingredients: recipe.output!.ingredients,
      instructions: recipe.output!.instructions,
      photoDataUri: media.url,
    };
  }
);
