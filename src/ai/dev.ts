import 'dotenv/config';
import { ai } from './genkit';

// Import all flows
import './flows/suggest-recipe-name';
import './flows/summarize-recipe';
import './flows/generate-recipe';
import './flows/generate-daily-meal-plan';

// Start the Genkit server
ai.start();