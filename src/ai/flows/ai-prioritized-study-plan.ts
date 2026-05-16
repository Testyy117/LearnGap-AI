'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating an AI-prioritized study plan.
 *
 * - aiPrioritizedStudyPlan - A function that generates a study plan based on learning gaps.
 * - AiPrioritizedStudyPlanInput - The input type for the aiPrioritizedStudyPlan function.
 * - AiPrioritizedStudyPlanOutput - The return type for the aiPrioritizedStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LearningGapSchema = z.object({
  topic: z.string().describe('The topic where a learning gap has been identified.'),
  accuracy: z.number().min(0).max(100).describe('The student\u0027s percentage accuracy on this topic.'),
  confidence: z.number().min(0).max(100).describe('The student\u0027s self-reported confidence level on this topic.'),
  misconceptionDetail: z.string().optional().describe('A detailed description of the identified misconception, if available.'),
});

const AiPrioritizedStudyPlanInputSchema = z.object({
  learningGaps: z.array(LearningGapSchema).describe('A list of identified learning gaps for the student.'),
  studentContext: z
    .string()
    .optional()
    .describe('Any additional context about the student or their learning goals.'),
});
export type AiPrioritizedStudyPlanInput = z.infer<typeof AiPrioritizedStudyPlanInputSchema>;

const StudyPlanItemSchema = z.object({
  topic: z.string().describe('The specific topic or sub-topic for this study item.'),
  urgency: z.enum(['High', 'Moderate', 'Low']).describe('The urgency level for studying this topic.'),
  recommendation: z
    .string()
    .describe('Specific study activities or resources recommended for this topic.'),
  reasoning: z
    .string()
    .describe('An explanation for the assigned urgency and the specific recommendation.'),
});

const AiPrioritizedStudyPlanOutputSchema = z.object({
  studyPlan: z.array(StudyPlanItemSchema).describe('The generated prioritized study plan.'),
  overallInsight: z
    .string()
    .describe('A general insight or summary of the study plan and key areas of focus.'),
});
export type AiPrioritizedStudyPlanOutput = z.infer<typeof AiPrioritizedStudyPlanOutputSchema>;

export async function aiPrioritizedStudyPlan(
  input: AiPrioritizedStudyPlanInput
): Promise<AiPrioritizedStudyPlanOutput> {
  return aiPrioritizedStudyPlanFlow(input);
}

const aiPrioritizedStudyPlanPrompt = ai.definePrompt({
  name: 'aiPrioritizedStudyPlanPrompt',
  input: {schema: AiPrioritizedStudyPlanInputSchema},
  output: {schema: AiPrioritizedStudyPlanOutputSchema},
  prompt: `You are an expert educational AI assistant tasked with creating personalized study plans.
Your goal is to analyze a student's identified learning gaps and generate a prioritized study plan, assigning an urgency level (High, Moderate, Low) to each topic.

Prioritize topics based on the following criteria:
1.  **High Urgency**:
    *   Topics where accuracy is very low (e.g., below 50%) regardless of confidence.
    *   Topics where accuracy is low (e.g., below 70%) but confidence is high (indicating a misconception).
    *   Topics with detailed misconception descriptions.
2.  **Moderate Urgency**:
    *   Topics where accuracy is moderate (e.g., 70-85%) and confidence is also moderate.
    *   Topics that are foundational for other areas.
3.  **Low Urgency**:
    *   Topics where accuracy is relatively high (e.g., above 85%) but still show some room for improvement.
    *   Topics where both accuracy and confidence are already high, but a quick review could be beneficial.

For each topic, provide a specific recommendation for study activities. Explain your reasoning for the urgency and recommendation.

Student's learning gaps:
{{#if learningGaps}}
{{#each learningGaps}}
Topic: {{{topic}}}
Accuracy: {{{accuracy}}}%
Confidence: {{{confidence}}}%
{{#if misconceptionDetail}}Misconception Detail: {{{misconceptionDetail}}}{{/if}}
---
{{/each}}
{{else}}
No specific learning gaps provided. Focus on general study strategies.
{{/if}}

{{#if studentContext}}
Additional student context: {{{studentContext}}}
{{/if}}

Generate the study plan in a structured JSON format, following the provided output schema.`,
});

const aiPrioritizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'aiPrioritizedStudyPlanFlow',
    inputSchema: AiPrioritizedStudyPlanInputSchema,
    outputSchema: AiPrioritizedStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await aiPrioritizedStudyPlanPrompt(input);
    return output!;
  }
);
