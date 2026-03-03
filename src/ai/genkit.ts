import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Validate API key on initialization
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.warn('⚠️ GOOGLE_GENAI_API_KEY is not set in environment variables. AI features may not work.');
}

export const ai = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
  model: 'googleai/gemini-1.5-flash-latest',
});
