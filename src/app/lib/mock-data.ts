
import { Transaction, BudgetGoal } from './types';

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-01', description: 'Whole Foods Market', amount: 84.50, category: 'Groceries' },
  { id: '2', date: '2023-10-02', description: 'Netflix Subscription', amount: 15.99, category: 'Entertainment' },
  { id: '3', date: '2023-10-03', description: 'Shell Gas Station', amount: 52.00, category: 'Transportation' },
  { id: '4', date: '2023-10-05', description: 'Starbucks Coffee', amount: 6.75, category: 'Dining' },
  { id: '5', date: '2023-10-07', description: 'Amazon.com Order', amount: 124.99, category: 'Shopping' },
  { id: '6', date: '2023-10-10', description: 'Rent Payment', amount: 1800.00, category: 'Rent' },
  { id: '7', date: '2023-10-12', description: 'City Water Utility', amount: 45.30, category: 'Utilities' },
  { id: '8', date: '2023-10-15', description: 'Gym Membership', amount: 50.00, category: 'Health' },
  { id: '9', date: '2023-10-18', description: 'Local Bistro Dinner', amount: 75.00, category: 'Dining' },
  { id: '10', date: '2023-10-20', description: 'Apple App Store', amount: 9.99, category: 'Entertainment' },
];

export const MOCK_BUDGETS: BudgetGoal[] = [
  { category: 'Groceries', monthlyLimit: 500, currentSpent: 384.50 },
  { category: 'Dining', monthlyLimit: 300, currentSpent: 285.40 },
  { category: 'Transportation', monthlyLimit: 200, currentSpent: 120.00 },
  { category: 'Entertainment', monthlyLimit: 150, currentSpent: 65.98 },
  { category: 'Shopping', monthlyLimit: 400, currentSpent: 420.00 },
];
