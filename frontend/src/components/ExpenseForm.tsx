import { FormEvent, useEffect, useState } from "react";
import type { Category, Expense, ExpenseInput } from "../types";

interface Props {
  categories: Category[];
  editingExpense: Expense | null;
  onSubmit: (input: ExpenseInput) => Promise<void>;
  onCancelEdit: () => void;
}

const emptyForm: ExpenseInput = {
  title: "",
  amount: 0,
  category_id: null,
  expense_date: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function ExpenseForm({ categories, editingExpense, onSubmit, onCancelEdit }: Props) {
  const [form, setForm] = useState<ExpenseInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingExpense) {
      setForm({
        title: editingExpense.title,
        amount: Number(editingExpense.amount),
        category_id: editingExpense.category_id,
        expense_date: editingExpense.expense_date.slice(0, 10),
        notes: editingExpense.notes || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingExpense]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || form.amount <= 0 || !form.expense_date) {
      setError("Please fill in a title, a positive amount, and a date.");
      return;
    }

    try {
      await onSubmit(form);
      setForm(emptyForm);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  }

  return (
    <section className="card">
      <h2>{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
      <form onSubmit={handleSubmit} className="expense-form">
        <label>
          Title
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Lunch"
          />
        </label>

        <label>
          Amount (₹)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          />
        </label>

        <label>
          Category
          <select
            value={form.category_id ?? ""}
            onChange={(e) =>
              setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })
            }
          >
            <option value="">-- None --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            value={form.expense_date}
            onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
          />
        </label>

        <label>
          Notes (optional)
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g. Lunch with friends"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="submit">{editingExpense ? "Save Changes" : "Add Expense"}</button>
          {editingExpense && (
            <button type="button" className="secondary" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
