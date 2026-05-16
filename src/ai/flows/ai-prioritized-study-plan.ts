'use server';
/**
 * @fileOverview This file implements a mocked Genkit flow for generating an AI-prioritized study plan.
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

const aiPrioritizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'aiPrioritizedStudyPlanFlow',
    inputSchema: AiPrioritizedStudyPlanInputSchema,
    outputSchema: AiPrioritizedStudyPlanOutputSchema,
  },
  async input => {
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const studyPlan = input.learningGaps.map(gap => ({
      topic: gap.topic,
      urgency: gap.accuracy < 40 ? 'High' : gap.accuracy < 70 ? 'Moderate' : 'Low' as any,
      recommendation: `Complete 3 advanced simulations and review the 'Common Pitfalls' guide for ${gap.topic}.`,
      reasoning: gap.accuracy < 40 
        ? `Your accuracy is significantly below target, making this a critical area to address before your next assessment.`
        : `Steady progress detected, but minor misconceptions are still impacting your overall performance.`
    }));

    // If no gaps, provide a default plan
    if (studyPlan.length === 0) {
      studyPlan.push({
        topic: "General Subject Review",
        urgency: "Moderate",
        recommendation: "Take a full-length mock exam to identify potential hidden gaps.",
        reasoning: "Maintaining overall subject fluency is key to long-term retention."
      });
    }

    return {
      studyPlan: studyPlan.sort((a, b) => {
        const order = { 'High': 0, 'Moderate': 1, 'Low': 2 };
        return order[a.urgency] - order[b.urgency];
      }),
      overallInsight: "Based on your recent performance, we've prioritized topics where accuracy is lowest to maximize your mastery gains this week."
    };
  }
);
