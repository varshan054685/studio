'use server';
/**
 * @fileOverview An AI agent for automatically categorizing financial transactions.
 *
 * - categorizeTransaction - A function that handles the transaction categorization process.
 * - TransactionCategorizationInput - The input type for the categorizeTransaction function.
 * - TransactionCategorizationOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionCategorizationInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction, typically from a bank statement or merchant.'),
});
export type TransactionCategorizationInput = z.infer<
  typeof TransactionCategorizationInputSchema
>;

const TransactionCategorizationOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'The most appropriate spending category for the transaction (e.g., "Groceries", "Utilities", "Transportation", "Dining", "Shopping", "Rent", "Entertainment", "Salary", "Investment"). If no existing category fits, create a new relevant category name.'
    ),
});
export type TransactionCategorizationOutput = z.infer<
  typeof TransactionCategorizationOutputSchema
>;

export async function categorizeTransaction(
  input: TransactionCategorizationInput
): Promise<TransactionCategorizationOutput> {
  return automaticTransactionCategorizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automaticTransactionCategorizationPrompt',
  input: {schema: TransactionCategorizationInputSchema},
  output: {schema: TransactionCategorizationOutputSchema},
  prompt: `You are an intelligent financial assistant specialized in categorizing transactions.

You will be given a transaction description and your task is to identify the most fitting spending category.
Consider common categories like "Groceries", "Utilities", "Transportation", "Dining", "Shopping", "Rent", "Entertainment", "Salary", "Investment", etc.
If none of the common categories fit well, suggest a new, concise, and relevant category name.

Transaction Description: {{{transactionDescription}}}`,
});

const automaticTransactionCategorizationFlow = ai.defineFlow(
  {
    name: 'automaticTransactionCategorizationFlow',
    inputSchema: TransactionCategorizationInputSchema,
    outputSchema: TransactionCategorizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
