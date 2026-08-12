import type { Expense } from "../types";

interface Props {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: number) => void;
}

function formatCurrency(value: string | number) {
  return `₹${Number(value).toFixed(2)}`;
}

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  return (
    <section className="card">
      <h2>Expenses ({expenses.length})</h2>
      {expenses.length === 0 ? (
        <p>No expenses found. Add one above, or adjust your filters.</p>
      ) : (
        <table className="expense-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Date</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{expense.title}</td>
                <td>{formatCurrency(expense.amount)}</td>
                <td>{expense.category_name || "—"}</td>
                <td>{expense.expense_date.slice(0, 10)}</td>
                <td>{expense.notes || "—"}</td>
                <td className="expense-actions">
                  <button type="button" onClick={() => onEdit(expense)}>
                    Edit
                  </button>
                  <button type="button" className="danger" onClick={() => onDelete(expense.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
