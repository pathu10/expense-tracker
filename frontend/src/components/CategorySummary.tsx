import type { DashboardSummary } from "../types";

function formatCurrency(value: number) {
  return `₹${value.toFixed(2)}`;
}

export default function CategorySummary({ summary }: { summary: DashboardSummary | null }) {
  if (!summary || summary.byCategory.length === 0) {
    return null;
  }

  return (
    <section className="card">
      <h2>Category-wise Summary</h2>
      <ul className="category-summary-list">
        {summary.byCategory.map((row) => (
          <li key={row.categoryId}>
            <span>{row.categoryName}</span>
            <span>{formatCurrency(row.total)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
