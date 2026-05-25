'use server';
/**
 * @fileOverview An AI agent that analyzes user spending patterns and provides budget optimization recommendations.
 *
 * - getAISpendingInsights - A function that handles the AI spending insights process.
 * - AISpendingInsightsInput - The input type for the getAISpendingInsights function.
 * - AISpendingInsightsOutput - The return type for the getAISpendingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for the AI spending insights flow.
 */
const AISpendingInsightsInputSchema = z.object({
  transactions: z.array(
    z.object({
      date: z.string().describe('Date of the transaction in YYYY-MM-DD format.'),
      description: z.string().describe('Description of the transaction.'),
      amount: z.number().positive().describe('Amount of the transaction.'),
      category: z.string().describe('Category of the transaction.'),
    })
  ).describe('List of user transactions to be analyzed.'),
  budgetGoals: z.array(
    z.object({
      category: z.string().describe('Category for the budget goal.'),
      monthlyLimit: z.number().positive().describe('Monthly budget limit for the category.'),
    })
  ).optional().describe('Optional list of user-defined monthly budget goals.'),
  summaryPeriod: z.string().describe('The period for which the spending data is summarized (e.g., "last month", "last 3 months", "this quarter").'),
});
export type AISpendingInsightsInput = z.infer<typeof AISpendingInsightsInputSchema>;

/**
 * Output schema for the AI spending insights flow.
 */
const AISpendingInsightsOutputSchema = z.object({
  overallInsights: z.string().describe('A general summary of spending patterns for the given period, highlighting key trends.'),
  categoryInsights: z.array(
    z.object({
      category: z.string().describe('The spending category.'),
      analysis: z.string().describe('Analysis of spending behavior in this category, comparing against budget goals if provided.').optional(),
      recommendations: z.array(z.string()).describe('Actionable recommendations for optimizing spending in this category.'),
    })
  ).describe('Detailed insights and recommendations for each spending category.'),
  anomaliesDetected: z.array(z.string()).describe('List of unusual transactions or spending spikes detected, with brief explanations.'),
  budgetOptimizationTips: z.array(z.string()).describe('General tips and strategies for saving money and improving financial health.'),
});
export type AISpendingInsightsOutput = z.infer<typeof AISpendingInsightsOutputSchema>;

/**
 * Analyzes user spending patterns and provides personalized recommendations for budget optimization.
 */
export async function getAISpendingInsights(
  input: AISpendingInsightsInput
): Promise<AISpendingInsightsOutput> {
  return aiSpendingInsightsFlow(input);
}

/**
 * Defines the prompt for the AI spending insights flow.
 */
const aiSpendingInsightsPrompt = ai.definePrompt({
  name: 'aiSpendingInsightsPrompt',
  input: { schema: AISpendingInsightsInputSchema },
  output: { schema: AISpendingInsightsOutputSchema },
  prompt: `You are an expert financial advisor specializing in personal budgeting and expense analysis. Your goal is to analyze the provided spending data and offer personalized, actionable insights and recommendations for budget optimization. Respond with a JSON object that strictly adheres to the AISpendingInsightsOutputSchema.

Here is the spending data for the {{summaryPeriod}}:

Transactions:
{{#each transactions}}
- Date: {{this.date}}, Description: "{{this.description}}", Amount: {{this.amount}}, Category: "{{this.category}}"
{{/each}}

{{#if budgetGoals}}
Budget Goals:
{{#each budgetGoals}}
- Category: "{{this.category}}", Monthly Limit: {{this.monthlyLimit}}
{{/each}}
{{/if}}

Please provide a comprehensive analysis structured to match the output schema:

1.  **Overall Insights**: A general summary of spending patterns for the {{summaryPeriod}}.
2.  **Category Insights**: For each spending category, provide an 'analysis' and 2-3 'recommendations'.
3.  **Anomalies Detected**: Identify any unusual transactions or spending spikes.
4.  **Budget Optimization Tips**: Provide 3-5 general tips for improving financial health.`,
});

/**
 * Defines the Genkit flow for AI spending insights.
 */
const aiSpendingInsightsFlow = ai.defineFlow(
  {
    name: 'aiSpendingInsightsFlow',
    inputSchema: AISpendingInsightsInputSchema,
    outputSchema: AISpendingInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await aiSpendingInsightsPrompt(input);
    if (!output) {
      throw new Error('Failed to generate spending insights. Please check your API key configuration.');
    }
    return output;
  }
);