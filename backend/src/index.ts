import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { pool } from "./db";
import expensesRouter from "./routes/expenses";
import categoriesRouter from "./routes/categories";
import dashboardRouter from "./routes/dashboard";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use("/api/expenses", expensesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/dashboard", dashboardRouter);

// Centralized error handler so route handlers can just `throw` / reject.
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// The database container may still be starting when the backend boots,
// so retry the connection a few times before giving up.
async function waitForDatabase(retries = 10, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query("SELECT 1");
      console.log("Connected to the database");
      return;
    } catch (err) {
      console.log(`Database not ready yet (attempt ${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Could not connect to the database after multiple attempts");
}

waitForDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Expense Tracker API listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
