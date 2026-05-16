'use server';
/**
 * @fileOverview An AI tutor agent that answers educational questions (Mocked for global access).
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

/**
 * Mock implementation of the LearnBot to allow testing without an API key.
 */
export async function askLearnBot(input: AskLearnBotInput): Promise<AskLearnBotOutput> {
  return askLearnBotFlow(input);
}

const askLearnBotFlow = ai.defineFlow(
  {
    name: 'askLearnBotFlow',
    inputSchema: AskLearnBotInputSchema,
    outputSchema: AskLearnBotOutputSchema,
  },
  async input => {
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const q = input.question.toLowerCase();
    let response = "That's an interesting question! As a specialized AI tutor, I'd suggest looking into the core principles of this topic. ";

    if (q.includes("newton")) {
      response = "Newton's laws of motion are three physical laws that, together, laid the foundation for classical mechanics. They describe the relationship between a body and the forces acting upon it, and its motion in response to those forces.";
    } else if (q.includes("photo") || q.includes("light")) {
      response = "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll pigments.";
    } else if (q.includes("math") || q.includes("quadratic")) {
      response = "To solve a quadratic equation like ax² + bx + c = 0, you can use the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.";
    } else {
      response += "To give you the most accurate answer, please specify which subject or topic you'd like to dive deeper into. For example, 'Explain the water cycle' or 'How do I calculate momentum?'";
    }

    return {
      answer: response + "\n\n(Note: This is a mock response from LearnBot to ensure the app works in your region without an API key.)"
    };
  }
);
