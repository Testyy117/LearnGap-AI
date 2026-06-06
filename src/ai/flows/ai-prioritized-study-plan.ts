'use server';
import { callAI } from '@/ai/genkit';
import { z } from 'zod';

const StudyPlanItemSchema = z.object({
  topic: z.string(),
  urgency: z.enum(['High', 'Moderate', 'Low']),
  recommendation: z.string(),
  reasoning: z.string(),
});

const AiPrioritizedStudyPlanOutputSchema = z.object({
  studyPlan: z.array(StudyPlanItemSchema),
  overallInsight: z.string(),
});
export type AiPrioritizedStudyPlanOutput = z.infer<typeof AiPrioritizedStudyPlanOutputSchema>;

const AiPrioritizedStudyPlanInputSchema = z.object({
  subject: z.string(),
  gaps: z.array(z.string()),
});
export type AiPrioritizedStudyPlanInput = z.infer<typeof AiPrioritizedStudyPlanInputSchema>;

export async function aiPrioritizedStudyPlan(input: AiPrioritizedStudyPlanInput): Promise<AiPrioritizedStudyPlanOutput> {
  const prompt = `Create a prioritized study plan for ${input.subject} with gaps: ${input.gaps.join(', ')}. Return JSON with studyPlan array and overallInsight string.`;
  const result = await callAI(prompt);
  try {
    const clean = result.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { studyPlan: [], overallInsight: result };
  }
}
