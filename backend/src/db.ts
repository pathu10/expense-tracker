import { Pool } from "pg";

// All configuration comes from environment variables — never hardcode
// credentials here. See ../../.env.example for the full list.
export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// The demo user every expense belongs to (no login flow in this workshop app).
export const DEMO_USER_ID = 1;
