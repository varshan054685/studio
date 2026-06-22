
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  created_at?: string;
}

export interface BudgetGoal {
  id: string;
  category: string;
  monthly_limit: number;
  current_spent: number;
}

export type SummaryPeriod = "last month" | "this month" | "last 3 months" | "all time";
