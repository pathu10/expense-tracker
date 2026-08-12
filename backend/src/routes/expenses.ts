import { Router, Request, Response } from "express";
import { pool, DEMO_USER_ID } from "../db";

const router = Router();

const EXPENSE_SELECT = `
  SELECT e.id, e.title, e.amount, e.expense_date, e.notes,
         e.created_at, e.updated_at,
         e.category_id, c.name AS category_name
  FROM expenses e
  LEFT JOIN categories c ON c.id = e.category_id
  WHERE e.user_id = $1
`;

// GET /api/expenses?category_id=&from=&to=&search=
router.get("/", async (req: Request, res: Response) => {
  const { category_id, from, to, search } = req.query;

  const conditions: string[] = [];
  const params: any[] = [DEMO_USER_ID];

  if (category_id) {
    params.push(category_id);
    conditions.push(`e.category_id = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`e.expense_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`e.expense_date <= $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`e.title ILIKE $${params.length}`);
  }

  const whereExtra = conditions.length ? ` AND ${conditions.join(" AND ")}` : "";
  const query = `${EXPENSE_SELECT}${whereExtra} ORDER BY e.expense_date DESC, e.id DESC`;

  const result = await pool.query(query, params);
  res.json(result.rows);
});

// GET /api/expenses/:id
router.get("/:id", async (req: Request, res: Response) => {
  const result = await pool.query(`${EXPENSE_SELECT} AND e.id = $2`, [
    DEMO_USER_ID,
    req.params.id,
  ]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Expense not found" });
  }

  res.json(result.rows[0]);
});

function validateExpenseBody(body: any) {
  const { title, amount, expense_date } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return "Title is required";
  }
  if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
    return "Amount must be a positive number";
  }
  if (!expense_date || isNaN(Date.parse(expense_date))) {
    return "A valid expense_date is required";
  }
  return null;
}

// POST /api/expenses
router.post("/", async (req: Request, res: Response) => {
  const error = validateExpenseBody(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { title, amount, category_id, expense_date, notes } = req.body;

  const result = await pool.query(
    `INSERT INTO expenses (user_id, category_id, title, amount, expense_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [DEMO_USER_ID, category_id || null, title.trim(), amount, expense_date, notes || null]
  );

  const created = await pool.query(`${EXPENSE_SELECT} AND e.id = $2`, [
    DEMO_USER_ID,
    result.rows[0].id,
  ]);

  res.status(201).json(created.rows[0]);
});

// PUT /api/expenses/:id
router.put("/:id", async (req: Request, res: Response) => {
  const error = validateExpenseBody(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const { title, amount, category_id, expense_date, notes } = req.body;

  const result = await pool.query(
    `UPDATE expenses
     SET title = $1, amount = $2, category_id = $3, expense_date = $4,
         notes = $5, updated_at = now()
     WHERE id = $6 AND user_id = $7
     RETURNING id`,
    [title.trim(), amount, category_id || null, expense_date, notes || null, req.params.id, DEMO_USER_ID]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Expense not found" });
  }

  const updated = await pool.query(`${EXPENSE_SELECT} AND e.id = $2`, [
    DEMO_USER_ID,
    req.params.id,
  ]);

  res.json(updated.rows[0]);
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const result = await pool.query(
    "DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id",
    [req.params.id, DEMO_USER_ID]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Expense not found" });
  }

  res.status(204).send();
});

export default router;
