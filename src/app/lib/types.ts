
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  merchant?: string;
}

export interface BudgetGoal {
  category: string;
  monthlyLimit: number;
  currentSpent: number;
}

export type SummaryPeriod = "last month" | "this month" | "last 3 months" | "all time";
