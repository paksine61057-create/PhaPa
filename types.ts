
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  date: string;
  note?: string;
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
