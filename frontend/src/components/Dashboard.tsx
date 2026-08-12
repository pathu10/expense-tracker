import type { DashboardSummary } from "../types";

function formatCurrency(value: number) {
  return `₹${value.toFixed(2)}`;
}

export default function Dashboard({ summary }: { summary: DashboardSummary | null }) {
  if (!summary) {
    return <p>Loading dashboard...</p>;
  }

  const cards = [
    { label: "Total Expenses", value: formatCurrency(summary.total) },
    { label: "This Month", value: formatCurrency(summary.currentMonthTotal) },
    { label: "Number of Expenses", value: summary.count },
    { label: "Highest Expense", value: formatCurrency(summary.highest) },
  ];

  return (
    <section className="card">
      <h2>Dashboard</h2>
      <div className="dashboard-grid">
        {cards.map((card) => (
          <div className="dashboard-tile" key={card.label}>
            <span className="dashboard-tile-label">{card.label}</span>
            <span className="dashboard-tile-value">{card.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
