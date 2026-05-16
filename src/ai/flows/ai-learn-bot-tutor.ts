'use server';
/**
 * @fileOverview An AI tutor agent that answers educational questions.
 *
 * - askLearnBot - A function that handles asking the LearnBot a question.
 * - AskLearnBotInput - The input type for the askLearnBot function.
 * - AskLearnBotOutput - The return type for the askLearnBot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskLearnBotInputSchema = z.object({
  question: z.string().describe('The educational question from the student.'),
});
export type AskLearnBotInput = z.infer<typeof AskLearnBotInputSchema>;

const AskLearnBotOutputSchema = z.object({
  answer: z.string().describe('The personalized and accurate answer from the AI tutor.'),
});
export type AskLearnBotOutput = z.infer<typeof AskLearnBotOutputSchema>;

export async function askLearnBot(input: AskLearnBotInput): Promise<AskLearnBotOutput> {
  return askLearnBotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'learnBotTutorPrompt',
  input: {schema: AskLearnBotInputSchema},
  output: {schema: AskLearnBotOutputSchema},
  prompt: `You are the LearnBot AI tutor, an expert educational assistant designed to provide accurate, personalized, and clear answers to student questions.

Your goal is to help students understand complex topics by breaking them down and explaining them concisely. Always maintain a helpful and encouraging tone.

Student Question: {{{question}}}`,
});

const askLearnBotFlow = ai.defineFlow(
  {
    name: 'askLearnBotFlow',
    inputSchema: AskLearnBotInputSchema,
    outputSchema: AskLearnBotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
