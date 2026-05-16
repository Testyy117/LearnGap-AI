'use server';
/**
 * @fileOverview This file implements a mocked AI flow to analyze student quiz performance.
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

const analyzeLearningGapFlow = ai.defineFlow(
  {
    name: 'analyzeLearningGapFlow',
    inputSchema: AnalyzeLearningGapInputSchema,
    outputSchema: AnalyzeLearningGapOutputSchema,
  },
  async (input) => {
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock logic: Identify gaps based on input
    const incorrectResults = input.quizResults.filter(r => !r.isCorrect);
    const topicsWithErrors = Array.from(new Set(incorrectResults.map(r => r.topic)));
    
    const detectedGaps = topicsWithErrors.map(topic => {
      const topicResults = input.quizResults.filter(r => r.topic === topic);
      const accuracy = (topicResults.filter(r => r.isCorrect).length / topicResults.length) * 100;
      const avgConfidence = topicResults.reduce((acc, curr) => acc + curr.confidenceLevel, 0) / topicResults.length;
      
      const isMisconception = accuracy < 50 && avgConfidence > 70;

      return {
        topic,
        description: isMisconception 
          ? `You show high confidence but low accuracy in ${topic}. This suggests a core misconception in how you apply these principles.`
          : `You're struggling with foundational concepts in ${topic}. Your low confidence indicates you're aware of these gaps.`,
        accuracy,
        confidence: avgConfidence,
        isMisconception,
        recommendation: `Review the introductory modules for ${topic} and complete 5 targeted practice problems.`
      };
    });

    return {
      overallInsight: `You've completed the diagnostic. We found ${detectedGaps.length} areas for improvement, with a focus on ${topicsWithErrors[0] || 'fundamental principles'}.`,
      gapSummary: {
        totalGaps: detectedGaps.length,
        topicsWithGaps: topicsWithErrors,
        misconceptionCount: detectedGaps.filter(g => g.isMisconception).length,
      },
      detectedGaps,
    };
  }
);
