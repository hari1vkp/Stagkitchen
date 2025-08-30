
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
  prompt: `You are a world-class chef skilled at creating delicious and innovative recipes with expertise in global cuisines including Indian, Asian, European, American, and other international dishes.

Your task is to generate a recipe based on the provided information.

{{#if images}}
  {{#if isImageFinishedDish}}
    CRITICAL INSTRUCTION: You have been provided with an image of a FINISHED DISH. 
    
    Look at the image carefully and identify the specific dish. Be very precise with the dish name - for example:
    - Say "Masala Dosa with Coconut Chutney and Sambar" not just "crepe" or "pancake"
    - Say "Chicken Tikka Masala with Basmati Rice" not just "curry"
    - Say "Margherita Pizza with Fresh Basil" not just "pizza"
    
    {{{images}}}
    
    {{#if ingredients}}
      User provided additional context: {{{ingredients}}}
      Only use this if it helps clarify what you see, but the image is the primary source of truth.
    {{/if}}
    
    Create an authentic recipe for the EXACT dish you identified in the image.
  {{else}}
    CRITICAL INSTRUCTION: You have been provided with images of INDIVIDUAL INGREDIENTS.
    
    Examine each image carefully and identify the specific ingredients, then create a recipe using them.
    
    {{{images}}}
    
    {{#if ingredients}}
      Additional ingredients mentioned: {{{ingredients}}}
    {{/if}}
  {{/if}}
{{else}}
  {{#if isTextInputFinishedDish}}
      You have been provided with the name of a finished dish: {{{ingredients}}}. Generate an authentic recipe for this specific dish.
  {{else}}
      You have been provided with the following ingredients: {{{ingredients}}}. Create a recipe using these ingredients.
  {{/if}}
{{/if}}

RECIPE CREATION GUIDELINES:
- Be accurate to the visual content of images (if provided)
- Consider cultural authenticity for international dishes
- Provide realistic cooking times and temperatures
- Include proper seasoning and technique details
- Consider any dietary preferences: {{{dietaryPreferences}}}

Also, provide estimated nutritional information for the generated recipe.
Finally, create a YouTube search query for a video showing how to cook this specific dish, and format it as a search URL.

Format the response as follows:

{{#if images}}
Image Analysis: [Detailed description of what you see in the image - be very specific about the dish identification]
{{/if}}
Recipe Name: [Recipe Name - must match what's actually in the image if image provided]
Ingredients: [List of ingredients with quantities]
Instructions: [Step-by-step cooking instructions]
Nutritional Info: [e.g., Calories: 350, Protein: 20g, Carbs: 30g, Fat: 15g]
YouTube Link: [Search URL]

Please respond with ONLY the recipe details.`,
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
        temperature: 0.0,
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
      youtubeLink: recipe.youtubeLink,
      photoDataUri: media.url,
    };
  }
);
