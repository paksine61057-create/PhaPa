
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum TransactionCategory {
  CATERING = 'หมวดโต๊ะจีน',
  DRINKS = 'หมวดเครื่องดื่ม',
  GLASS = 'หมวดแก้ว',
  DONATION = 'หมวดรับบริจาค'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  title: string;
  amount: number;
  date: string;
  note?: string;
  receiptImage?: string; // เก็บภาพหลักฐาน (base64)
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}
