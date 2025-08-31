
//StagKitchen

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
    .optional()
    .describe('A comma-separated list of ingredients available for use in the recipe, or the name of a finished dish.'),
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
  inputType: z
    .enum(['ingredients', 'finishedDish'])
    .optional()
    .describe('Specifies if the text input is a list of "ingredients" or a "finishedDish" name.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  imageAnalysis: z.string().optional().describe('Detailed description of what is seen in the provided image(s), including dish identification, visual characteristics, and cultural context.'),
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredients: z.string().describe('A list of ingredients required for the recipe.'),
  instructions: z.string().describe('Step-by-step cooking instructions for the recipe.'),
  nutritionalInfo: z.string().optional().describe('Estimated nutritional information for the recipe (e.g., calories, protein, carbs, fat).'),
  cookingTime: z.string().optional().describe('Estimated total cooking time including prep and cook time (e.g., "30 minutes", "1 hour 15 minutes").'),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional().describe('Cooking difficulty level: Easy (basic techniques, minimal prep), Medium (some skill required, moderate prep), Hard (advanced techniques, extensive prep).'),
  youtubeLink: z.string().optional().describe('A YouTube search URL for a video showing how to make a similar recipe.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "A photo of the finished dish, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'" // keep the backslashes here, they're needed to escape the single quote in the string
    ),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const PromptInputSchema = GenerateRecipeInputSchema.extend({
  isImageFinishedDish: z.boolean().optional(),
  isTextInputFinishedDish: z.boolean().optional(),
});

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: PromptInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are an expert chef with knowledge of cuisines from around the world. Your job is to accurately identify dishes from images and create authentic recipes.

{{#if images}}
  {{#if isImageFinishedDish}}
    ANALYZE THE IMAGE CAREFULLY: You are looking at a photo of a completed dish.
    
    {{{images}}}
    
    IMPORTANT: Look at the actual visual details in the image:
    - What colors do you see?
    - What textures and shapes are visible?
    - What cooking method appears to have been used?
    - Are there any garnishes or accompaniments?
    - What cultural cuisine does this appear to be from based on visual cues?
    
    Do NOT assume or default to common dishes. Base your identification ONLY on what you can actually see in the image.
    
    {{#if ingredients}}
      Additional context from user: {{{ingredients}}}
    {{/if}}
    
    Identify the specific dish and create an authentic recipe for exactly what you see.
  {{else}}
    ANALYZE THE INGREDIENTS: You are looking at photos of individual ingredients.
    
    {{{images}}}
    
    Identify each ingredient you can see and create a recipe using them.
    
    {{#if ingredients}}
      Additional ingredients: {{{ingredients}}}
    {{/if}}
  {{/if}}
{{else}}
  {{#if isTextInputFinishedDish}}
    Create a recipe for this dish: {{{ingredients}}}
  {{else}}
    Create a recipe using these ingredients: {{{ingredients}}}
  {{/if}}
{{/if}}

{{#if dietaryPreferences}}
Consider these dietary preferences: {{{dietaryPreferences}}}
{{/if}}

Provide your response in this format:
{{#if images}}
Image Analysis: [What you actually see in the image]
{{/if}}
Recipe Name: [Name of the dish]
Ingredients: [List with quantities]
Instructions: [Step-by-step directions]
Nutritional Info: [Estimated nutrition facts]
Cooking Time: [Total time including prep and cooking]
Difficulty: [Easy/Medium/Hard based on techniques and complexity]
YouTube Link: [Search URL for cooking video]`,
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
      console.log(`Processing ${input.images.length} images for recipe generation`);
      input.images.forEach((imageDataUri, index) => {
        try {
          if (!imageDataUri || typeof imageDataUri !== 'string') {
            console.error(`Invalid image at index ${index}:`, imageDataUri);
            return;
          }
          
          const [header, data] = imageDataUri.split(',');
          if (!header || !data) {
            console.error(`Invalid image format at index ${index}: missing header or data`);
            return;
          }
          
          const mimeType = header.match(/:(.*?);/)?.[1];
          if (!mimeType) {
            console.error(`Could not extract MIME type from header at index ${index}:`, header);
            return;
          }
          
          if (!mimeType.startsWith('image/')) {
            console.error(`Invalid MIME type at index ${index}:`, mimeType);
            return;
          }
          
          promptParts.push({inlineData: {data, mimeType}});
          console.log(`Successfully processed image ${index + 1} with MIME type: ${mimeType}`);
        } catch (error) {
          console.error(`Error processing image at index ${index}:`, error);
        }
      });
      console.log(`Successfully processed ${promptParts.length} out of ${input.images.length} images`);
    }

    // Use the enhanced prompt for better accuracy
    // Use the original working approach with better prompt
    const recipePromise = generateRecipePrompt({
      ...input,
      isImageFinishedDish: input.imageType === 'finishedDish',
      isTextInputFinishedDish: input.inputType === 'finishedDish',
      // @ts-ignore
      images: promptParts.length > 0 ? promptParts : undefined,
    }, {
      config: {
        temperature: 0.3,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048
      }
    });

    const tempRecipe = await recipePromise;
    if (!tempRecipe.output) {
      throw new Error('Failed to generate recipe');
    }

    const imagePromise = ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a photo of the finished ${tempRecipe.output.recipeName} dish.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

    const [{output: recipe}, {media}] = await Promise.all([
        recipePromise,
        imagePromise
    ]);

    if (!recipe) {
      throw new Error('Failed to generate recipe');
    }

    return {
      imageAnalysis: recipe.imageAnalysis,
      recipeName: recipe.recipeName,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      nutritionalInfo: recipe.nutritionalInfo,
      cookingTime: recipe.cookingTime,
      difficulty: recipe.difficulty,
      youtubeLink: recipe.youtubeLink,
      photoDataUri: media.url,
    };
  }
);
