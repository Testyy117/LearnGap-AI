'use server';
import { callAI } from '@/ai/genkit';
import { z } from 'zod';

const AskLearnBotInputSchema = z.object({
  question: z.string().describe('The educational question from the student.'),
});
export type AskLearnBotInput = z.infer<typeof AskLearnBotInputSchema>;

const AskLearnBotOutputSchema = z.object({
  answer: z.string().describe('The personalized and accurate answer from the AI tutor.'),
});
export type AskLearnBotOutput = z.infer<typeof AskLearnBotOutputSchema>;

export async function askLearnBot(input: AskLearnBotInput): Promise<AskLearnBotOutput> {
  const prompt = `You are LearnBot, a helpful AI tutor for LearnGap AI. Answer this educational question clearly and accurately: ${input.question}`;
  const answer = await callAI(prompt);
  return { answer };
}
