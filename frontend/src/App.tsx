import { useCallback, useEffect, useState } from "react";
import {
  createExpense,
  deleteExpense,
  fetchCategories,
  fetchDashboardSummary,
  fetchExpenses,
  updateExpense,
} from "./api";
import type { Category, DashboardSummary, Expense, ExpenseFilters, ExpenseInput } from "./types";
import Dashboard from "./components/Dashboard";
import CategorySummary from "./components/CategorySummary";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import Filters from "./components/Filters";

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      const data = await fetchExpenses(filters);
      setExpenses(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [filters]);

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    fetchCategories().then(setCategories).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary, expenses]);

  async function handleAddOrUpdate(input: ExpenseInput) {
    if (editingExpense) {
      await updateExpense(editingExpense.id, input);
      setEditingExpense(null);
    } else {
      await createExpense(input);
    }
    await loadExpenses();
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this expense?")) return;
    await deleteExpense(id);
    await loadExpenses();
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Expense Tracker</h1>
        <p>Docker Workshop Reference Project</p>
      </header>

      {error && (
        <div className="card error-banner">
          <strong>Error:</strong> {error}
          <button type="button" onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      <Dashboard summary={summary} />
      <CategorySummary summary={summary} />

      <ExpenseForm
        categories={categories}
        editingExpense={editingExpense}
        onSubmit={handleAddOrUpdate}
        onCancelEdit={() => setEditingExpense(null)}
      />

      <Filters categories={categories} filters={filters} onChange={setFilters} />

      <ExpenseList expenses={expenses} onEdit={setEditingExpense} onDelete={handleDelete} />
    </div>
  );
}
