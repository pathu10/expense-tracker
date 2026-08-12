import { Router, Request, Response } from "express";
import { pool, DEMO_USER_ID } from "../db";

const router = Router();

// GET /api/dashboard/summary
router.get("/summary", async (_req: Request, res: Response) => {
  const totals = await pool.query(
    `SELECT
       COALESCE(SUM(amount), 0) AS total,
       COUNT(*) AS count,
       COALESCE(MAX(amount), 0) AS highest
     FROM expenses
     WHERE user_id = $1`,
    [DEMO_USER_ID]
  );

  const currentMonth = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM expenses
     WHERE user_id = $1
       AND date_trunc('month', expense_date) = date_trunc('month', CURRENT_DATE)`,
    [DEMO_USER_ID]
  );

  const byCategory = await pool.query(
    `SELECT c.id AS category_id, c.name AS category_name, COALESCE(SUM(e.amount), 0) AS total
     FROM categories c
     LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = $1
     GROUP BY c.id, c.name
     HAVING COALESCE(SUM(e.amount), 0) > 0
     ORDER BY total DESC`,
    [DEMO_USER_ID]
  );

  res.json({
    total: Number(totals.rows[0].total),
    count: Number(totals.rows[0].count),
    highest: Number(totals.rows[0].highest),
    currentMonthTotal: Number(currentMonth.rows[0].total),
    byCategory: byCategory.rows.map((row) => ({
      categoryId: row.category_id,
      categoryName: row.category_name,
      total: Number(row.total),
    })),
  });
});

export default router;
