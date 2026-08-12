export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Expense {
  id: number;
  title: string;
  amount: string | number;
  category_id: number | null;
  category_name: string | null;
  expense_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInput {
  title: string;
  amount: number;
  category_id: number | null;
  expense_date: string;
  notes: string;
}

export interface DashboardSummary {
  total: number;
  count: number;
  highest: number;
  currentMonthTotal: number;
  byCategory: { categoryId: number; categoryName: string; total: number }[];
}

export interface ExpenseFilters {
  category_id?: string;
  from?: string;
  to?: string;
  search?: string;
}
