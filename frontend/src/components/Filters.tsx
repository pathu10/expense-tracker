import type { Category, ExpenseFilters } from "../types";

interface Props {
  categories: Category[];
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
}

export default function Filters({ categories, filters, onChange }: Props) {
  return (
    <section className="card">
      <h2>Filters</h2>
      <div className="filters">
        <label>
          Search by title
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search..."
          />
        </label>

        <label>
          Category
          <select
            value={filters.category_id || ""}
            onChange={(e) => onChange({ ...filters, category_id: e.target.value || undefined })}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          From
          <input
            type="date"
            value={filters.from || ""}
            onChange={(e) => onChange({ ...filters, from: e.target.value || undefined })}
          />
        </label>

        <label>
          To
          <input
            type="date"
            value={filters.to || ""}
            onChange={(e) => onChange({ ...filters, to: e.target.value || undefined })}
          />
        </label>

        <button type="button" className="secondary" onClick={() => onChange({})}>
          Clear Filters
        </button>
      </div>
    </section>
  );
}
