'use server';
import { callAI } from '@/ai/genkit';
import { z } from 'zod';

const QuizQuestionResultSchema = z.object({
  question: z.string(),
  correct: z.boolean(),
  confidence: z.number().min(0).max(100),
});

const AnalyzeLearningGapInputSchema = z.object({
  quizResults: z.array(QuizQuestionResultSchema).min(1).describe('An array of results for each quiz question answered by the student.'),
});
export type AnalyzeLearningGapInput = z.infer<typeof AnalyzeLearningGapInputSchema>;

const DetectedGapSchema = z.object({
  topic: z.string(),
  description: z.string(),
  accuracy: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
});

const AnalyzeLearningGapOutputSchema = z.object({
  gaps: z.array(DetectedGapSchema),
  overallInsight: z.string(),
});
export type AnalyzeLearningGapOutput = z.infer<typeof AnalyzeLearningGapOutputSchema>;

export async function analyzeLearningGap(input: AnalyzeLearningGapInput): Promise<AnalyzeLearningGapOutput> {
  const prompt = `Analyze these quiz results and identify learning gaps. Return a JSON object with "gaps" array and "overallInsight" string. Quiz results: ${JSON.stringify(input.quizResults)}`;
  const result = await callAI(prompt);
  try {
    const clean = result.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      gaps: [],
      overallInsight: result,
    };
  }
}
