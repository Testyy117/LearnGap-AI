'use server';
/**
 * @fileOverview This file implements an AI flow to analyze student quiz performance and confidence scores
 * to identify learning gaps and misconceptions.
 *
 * - analyzeLearningGap - A function that handles the learning gap analysis process.
 * - AnalyzeLearningGapInput - The input type for the analyzeLearningGap function.
 * - AnalyzeLearningGapOutput - The return type for the analyzeLearningGap function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuizQuestionResultSchema = z.object({
  questionId: z.string().describe('Unique identifier for the quiz question.'),
  questionText: z.string().describe('The text of the quiz question.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  studentAnswer: z.string().describe('The answer provided by the student.'),
  isCorrect: z.boolean().describe('Whether the student\'s answer was correct.'),
  confidenceLevel: z
    .number()
    .min(0)
    .max(100)
    .describe('Student\'s self-reported confidence level for this question (0-100).'),
  subject: z.string().describe('The subject area of the question.'),
  topic: z.string().describe('The specific topic within the subject.'),
});

const AnalyzeLearningGapInputSchema = z.object({
  quizResults: z
    .array(QuizQuestionResultSchema)
    .min(1)
    .describe('An array of results for each quiz question answered by the student.'),
});
export type AnalyzeLearningGapInput = z.infer<typeof AnalyzeLearningGapInputSchema>;

const DetectedGapSchema = z.object({
  topic: z.string().describe('The topic or sub-topic where the gap is detected.'),
  description: z
    .string()
    .describe('A detailed explanation of the identified learning gap or misconception.'),
  accuracy: z
    .number()
    .min(0)
    .max(100)
    .describe('The student\'s accuracy score for this specific topic, as a percentage (0-100).'),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe(
      'The student\'s average confidence level for questions in this topic, as a percentage (0-100).'
    ),
  isMisconception: z
    .boolean()
    .describe('True if a misconception is likely (low accuracy + high confidence), false otherwise.'),
  recommendation: z
    .string()
    .describe('A concise recommendation or next step to address this specific gap.'),
});

const AnalyzeLearningGapOutputSchema = z.object({
  overallInsight: z
    .string()
    .describe('A general AI insight banner content summarizing the student\'s performance and gaps.'),
  gapSummary: z.object({
    totalGaps: z.number().describe('The total number of distinct learning gaps identified.'),
    topicsWithGaps: z
      .array(z.string())
      .describe('An array of topics where learning gaps were detected.'),
    misconceptionCount: z
      .number()
      .describe('The total number of identified misconceptions (low accuracy + high confidence).'),
  }),
  detectedGaps: z
    .array(DetectedGapSchema)
    .describe('An array of detailed identified learning gaps and misconceptions.'),
});
export type AnalyzeLearningGapOutput = z.infer<typeof AnalyzeLearningGapOutputSchema>;

export async function analyzeLearningGap(
  input: AnalyzeLearningGapInput
): Promise<AnalyzeLearningGapOutput> {
  return analyzeLearningGapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLearningGapPrompt',
  input: { schema: AnalyzeLearningGapInputSchema },
  output: { schema: AnalyzeLearningGapOutputSchema },
  prompt: `You are an expert educational AI designed to analyze student quiz results and confidence levels to identify learning gaps and misconceptions.

Your task is to review the provided quiz results, calculate accuracy and average confidence for each topic, and identify specific learning gaps and misconceptions. Pay special attention to areas where the student has low accuracy but high confidence, as these often indicate misconceptions.

Provide a detailed analysis in the specified JSON format, including an overall insight, a summary for pie chart visualization, and a list of specific detected gaps with recommendations.

--- Quiz Results ---
{{#each quizResults}}
Question ID: {{{questionId}}}
Question: {{{questionText}}}
Correct Answer: {{{correctAnswer}}}
Student Answer: {{{studentAnswer}}}
Is Correct: {{{isCorrect}}}
Confidence Level: {{{confidenceLevel}}}
Subject: {{{subject}}}
Topic: {{{topic}}}
---
{{/each}}

Based on the above data, analyze the student's performance and provide your output in the following JSON format. Ensure all numerical values are calculated accurately and boolean flags like 'isMisconception' are correctly set based on your analysis (e.g., isMisconception=true if accuracy is low and confidence is high for a topic).`,
});

const analyzeLearningGapFlow = ai.defineFlow(
  {
    name: 'analyzeLearningGapFlow',
    inputSchema: AnalyzeLearningGapInputSchema,
    outputSchema: AnalyzeLearningGapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('AI did not return a valid output for learning gap analysis.');
    }
    return output;
  }
);
