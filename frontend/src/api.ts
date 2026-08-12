import type { Category, DashboardSummary, Expense, ExpenseFilters, ExpenseInput } from "./types";

// Baked in at build time by Vite. In Docker Compose this points at the
// backend service; see frontend/Dockerfile and docker-compose.yml.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export function fetchCategories(): Promise<Category[]> {
  return request("/api/categories");
}

export function createCategory(name: string): Promise<Category> {
  return request("/api/categories", { method: "POST", body: JSON.stringify({ name }) });
}

export function fetchExpenses(filters: ExpenseFilters): Promise<Expense[]> {
  const params = new URLSearchParams();
  if (filters.category_id) params.set("category_id", filters.category_id);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.search) params.set("search", filters.search);

  const query = params.toString();
  return request(`/api/expenses${query ? `?${query}` : ""}`);
}

export function createExpense(input: ExpenseInput): Promise<Expense> {
  return request("/api/expenses", { method: "POST", body: JSON.stringify(input) });
}

export function updateExpense(id: number, input: ExpenseInput): Promise<Expense> {
  return request(`/api/expenses/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function deleteExpense(id: number): Promise<void> {
  return request(`/api/expenses/${id}`, { method: "DELETE" });
}

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return request("/api/dashboard/summary");
}
