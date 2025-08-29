
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
      
      MANDATORY FIRST STEP - IMAGE ANALYSIS: 
      Look at the image and provide a detailed description including:
      - What specific dish do you see? (be very specific - e.g., "masala dosa", "chicken biryani", "pad thai")
      - What are the visual characteristics? (color, texture, shape, size, presentation)
      - What cultural cuisine does this belong to? (Indian, Chinese, Italian, etc.)
      - What cooking method was likely used? (fried, grilled, steamed, etc.)
      - What garnishes or accompaniments do you see?
      
      {{{images}}}
      
      {{#if ingredients}}
        User provided additional context: {{{ingredients}}}
        Only use this if it helps clarify what you see, but the image is the primary source of truth.
      {{/if}}
      
      MANDATORY SECOND STEP - RECIPE GENERATION:
      Based ONLY on your visual analysis above, create an authentic recipe for the EXACT dish you identified in the image.
      Do NOT generate a recipe for a different dish.
    {{else}}
      CRITICAL INSTRUCTION: You have been provided with images of INDIVIDUAL INGREDIENTS.
      
      MANDATORY FIRST STEP - INGREDIENT IDENTIFICATION:
      Examine each image carefully and list:
      - Each specific ingredient you can identify
      - The state/preparation of each ingredient (whole, chopped, cooked, etc.)
      - Approximate quantities if visible
      
      {{{images}}}
      
      {{#if ingredients}}
        Additional ingredients mentioned: {{{ingredients}}}
      {{/if}}
      
      MANDATORY SECOND STEP - RECIPE CREATION:
      Create a recipe using the ingredients you identified from the images.
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
  Finally, create a YouTube search query for a video showing how to cook this specific dish, and format it as a search URL (e.g., https://www.youtube.com/results?search_query=how+to+make+...).

  Format the response as follows:

  {{#if images}}
  Image Analysis: [Detailed description of what you see in the image - this is MANDATORY if images are provided]
  {{/if}}
  Recipe Name: [Recipe Name - must match what's actually in the image if image provided]
  Ingredients: [List of ingredients with quantities]
  Instructions: [Step-by-step cooking instructions]
  Nutritional Info: [e.g., Calories: 350, Protein: 20g, Carbs: 30g, Fat: 15g]
  YouTube Link: [Search URL]

  Please respond with ONLY the recipe details. Do not generate an image.`,
});

// First, create a separate image analysis prompt for better accuracy
const imageAnalysisPrompt = ai.definePrompt({
  name: 'imageAnalysisPrompt',
  input: {
    schema: z.object({
      images: z.array(z.any()),
      imageType: z.enum(['ingredients', 'finishedDish']).optional(),
    })
  },
  output: {
    schema: z.object({
      analysis: z.string().describe('Detailed analysis of what is seen in the image'),
      dishName: z.string().optional().describe('The specific name of the dish if it can be identified'),
    })
  },
  prompt: `You are an expert food analyst. Look at the provided image(s) very carefully.

{{#if imageType}}
  {{#if (eq imageType "finishedDish")}}
    This image shows a FINISHED DISH. Analyze it and provide:
    1. EXACT dish identification (be very specific - e.g., "masala dosa with coconut chutney", "chicken tikka masala", "pad thai with shrimp")
    2. Visual characteristics (colors, textures, presentation, garnishes)
    3. Cultural/regional cuisine type
    4. Cooking method apparent from appearance
    5. Any accompaniments or sides visible
  {{else}}
    This image shows INDIVIDUAL INGREDIENTS. Analyze it and provide:
    1. List each ingredient you can identify
    2. State of preparation (whole, chopped, cooked, etc.)
    3. Approximate quantities if visible
  {{/if}}
{{/if}}

{{{images}}}

Be extremely specific and accurate in your identification. If you see a masala dosa, say "masala dosa" not "crepe" or "pancake".`
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const promptParts: any[] = [];
    let imageAnalysisResult: any = null;
    
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

      // First, analyze the image separately for better accuracy
      if (promptParts.length > 0) {
        try {
          const analysisResult = await imageAnalysisPrompt({
            images: promptParts,
            imageType: input.imageType
          });
          imageAnalysisResult = analysisResult.output;
          console.log('Image analysis result:', imageAnalysisResult);
        } catch (error) {
          console.error('Error in image analysis:', error);
        }
      }
    }

    // Log the processing details for debugging
    console.log('Recipe generation input:', {
      hasImages: !!input.images && input.images.length > 0,
      imageCount: input.images?.length || 0,
      imageType: input.imageType,
      inputType: input.inputType,
      processedImageParts: promptParts.length,
      imageAnalysis: imageAnalysisResult?.analysis || 'No analysis'
    });

    const recipePromise = generateRecipePrompt({
      ...input,
      isImageFinishedDish: input.imageType === 'finishedDish',
      isTextInputFinishedDish: input.inputType === 'finishedDish',
      // @ts-ignore
      images: promptParts.length > 0 ? promptParts : undefined,
    }, {
      config: {
        temperature: 0.1, // Lower temperature for more consistent image analysis
        topP: 0.8,
        topK: 20
      }
    });

    // We get the recipe name first to generate a better image prompt.
    // This adds a small delay but results in a better image.
    const tempRecipe = await recipePromise;
    if (!tempRecipe.output) {
      throw new Error('Failed to start recipe generation');
    }

    const imagePromise = ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: `Generate a photo of the finished ${tempRecipe.output.recipeName} dish.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

    // Now we wait for both to complete
    const [{output: recipe}, {media}] = await Promise.all([
        recipePromise,
        imagePromise
    ]);

    if (!recipe) {
      throw new Error('Failed to generate recipe');
    }

    return {
      imageAnalysis: imageAnalysisResult?.analysis || undefined,
      recipeName: imageAnalysisResult?.dishName || recipe.recipeName,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      nutritionalInfo: recipe.nutritionalInfo,
      youtubeLink: recipe.youtubeLink,
      photoDataUri: media.url,
    };
  }
);
