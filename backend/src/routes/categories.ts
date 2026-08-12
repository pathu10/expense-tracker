import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();

// GET /api/categories
router.get("/", async (_req: Request, res: Response) => {
  const result = await pool.query("SELECT * FROM categories ORDER BY name ASC");
  res.json(result.rows);
});

// POST /api/categories
router.post("/", async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Category name is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Category already exists" });
    }
    throw err;
  }
});

// PUT /api/categories/:id
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Category name is required" });
  }

  const result = await pool.query(
    "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
    [name.trim(), id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Category not found" });
  }

  res.json(result.rows[0]);
});

// DELETE /api/categories/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query("DELETE FROM categories WHERE id = $1 RETURNING *", [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Category not found" });
  }

  res.status(204).send();
});

export default router;
