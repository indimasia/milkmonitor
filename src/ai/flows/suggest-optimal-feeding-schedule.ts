'use server';

/**
 * @fileOverview AI-powered tool that suggests optimal feeding schedules based on baby's data and external factors.
 *
 * - suggestOptimalFeedingSchedule - A function that returns a feeding schedule suggestion.
 * - SuggestOptimalFeedingScheduleInput - The input type for the suggestOptimalFeedingSchedule function.
 * - SuggestOptimalFeedingScheduleOutput - The return type for the suggestOptimalFeedingSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalFeedingScheduleInputSchema = z.object({
  babyAgeMonths: z
    .number()
    .describe('The age of the baby in months.'),
  babyWeightKg: z
    .number()
    .describe('The weight of the baby in kilograms.'),
  feedingHistory: z
    .string()
    .describe(
      'A summary of the baby feeding history, including feeding times, amounts, and types (breast milk, formula).'    ),
  weatherCondition: z
    .string()
    .optional()
    .describe("The current weather conditions."),
  newsEvents: z
    .string()
    .optional()
    .describe("Any relevant news events that might affect the baby's mood or appetite."),
});
export type SuggestOptimalFeedingScheduleInput = z.infer<typeof SuggestOptimalFeedingScheduleInputSchema>;

const SuggestOptimalFeedingScheduleOutputSchema = z.object({
  suggestedSchedule: z
    .string()
    .describe('The suggested feeding schedule, including feeding times, amounts, and types.'),
});
export type SuggestOptimalFeedingScheduleOutput = z.infer<typeof SuggestOptimalFeedingScheduleOutputSchema>;

export async function suggestOptimalFeedingSchedule(
  input: SuggestOptimalFeedingScheduleInput
): Promise<SuggestOptimalFeedingScheduleOutput> {
  return suggestOptimalFeedingScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalFeedingSchedulePrompt',
  input: {schema: SuggestOptimalFeedingScheduleInputSchema},
  output: {schema: SuggestOptimalFeedingScheduleOutputSchema},
  prompt: `You are an expert pediatrician specializing in infant nutrition. Based on the information provided, suggest an optimal feeding schedule for the baby in Bahasa Indonesia.

Baby Age: {{babyAgeMonths}} months
Baby Weight: {{babyWeightKg}} kg
Feeding History: {{feedingHistory}}
Weather Condition: {{weatherCondition}}
News Events: {{newsEvents}}

Consider all factors, including age, weight, feeding history, weather conditions, and news events, to create a comprehensive feeding schedule. Provide specific times and amounts for each feeding, and specify whether breast milk or formula is recommended.

Suggested Feeding Schedule (in Bahasa Indonesia):`,
});

const suggestOptimalFeedingScheduleFlow = ai.defineFlow(
  {
    name: 'suggestOptimalFeedingScheduleFlow',
    inputSchema: SuggestOptimalFeedingScheduleInputSchema,
    outputSchema: SuggestOptimalFeedingScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
